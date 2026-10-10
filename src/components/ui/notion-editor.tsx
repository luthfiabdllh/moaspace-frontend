'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { useEditor, EditorContent, NodeViewWrapper, ReactNodeViewRenderer, type NodeViewProps } from '@tiptap/react';
import type { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { Table, TableRow, TableCell, TableHeader } from '@tiptap/extension-table';
import { computePosition, flip, shift, offset, type VirtualElement } from '@floating-ui/dom';
import { toast } from 'sonner';
import { uploadImage } from '@/features/uploads/api/upload-image';
import { formatFileSize } from '@/features/uploads/lib/compress-image';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Minus,
  Type,
  FileCode2,
  Table as TableIcon,
  Rows,
  Columns3,
  Trash2,
  PanelTop,
  PanelLeft,
  Plus,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Loader2,
  Link as LinkIcon,
  Unlink,
  ExternalLink,
  X,
  Undo2,
  Redo2,
  RemoveFormatting,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// --- NOTION-STYLE RESIZABLE IMAGE COMPONENT ---

const ResizableImageComponent: React.FC<NodeViewProps> = ({
  node,
  updateAttributes,
  selected,
  editor,
  getPos,
}) => {
  const { src, alt, alignment = 'center', width = '100%' } = node.attrs;
  const isEditable = editor.isEditable;
  const [isResizing, setIsResizing] = useState(false);
  const [liveWidth, setLiveWidth] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const startDragData = useRef<{
    startX: number;
    startWidthPx: number;
    containerWidthPx: number;
    direction: 'left' | 'right';
  } | null>(null);

  const displayWidth = liveWidth ?? width ?? '100%';

  const handlePointerDown = (
    e: React.PointerEvent<HTMLDivElement>,
    direction: 'left' | 'right'
  ) => {
    if (!isEditable) return;
    e.preventDefault();
    e.stopPropagation();

    const targetEl = e.currentTarget;
    targetEl.setPointerCapture(e.pointerId);

    const parentContainer =
      containerRef.current?.closest('.ProseMirror') || containerRef.current?.parentElement;
    const containerWidthPx =
      parentContainer?.clientWidth || containerRef.current?.clientWidth || 600;
    const imgEl = containerRef.current?.querySelector('img');
    const startWidthPx = imgEl?.getBoundingClientRect().width || containerWidthPx;

    startDragData.current = {
      startX: e.clientX,
      startWidthPx,
      containerWidthPx,
      direction,
    };
    setIsResizing(true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isResizing || !startDragData.current) return;
    e.preventDefault();

    const { startX, startWidthPx, containerWidthPx, direction } = startDragData.current;
    const deltaX = e.clientX - startX;
    const effectiveDelta = direction === 'right' ? deltaX : -deltaX;

    const newWidthPx = Math.max(80, Math.min(containerWidthPx, startWidthPx + effectiveDelta));
    const newPercentage = Math.round((newWidthPx / containerWidthPx) * 100);
    const clampedPercentage = Math.max(15, Math.min(100, newPercentage));

    setLiveWidth(`${clampedPercentage}%`);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isResizing) return;
    e.preventDefault();
    const targetEl = e.currentTarget;
    try {
      targetEl.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore
    }

    if (liveWidth) {
      updateAttributes({ width: liveWidth });
    }
    setIsResizing(false);
    startDragData.current = null;
    setLiveWidth(null);
  };

  const handleSelectNode = () => {
    if (typeof getPos === 'function') {
      const pos = getPos();
      if (typeof pos === 'number') {
        editor.commands.setNodeSelection(pos);
      }
    }
  };

  const alignClass =
    alignment === 'left'
      ? 'justify-start'
      : alignment === 'right'
      ? 'justify-end'
      : 'justify-center';

  return (
    <NodeViewWrapper
      ref={containerRef}
      className={cn('notion-image-node my-3 flex w-full select-none', alignClass)}
      data-alignment={alignment}
      data-width={displayWidth}
    >
      <div
        onClick={handleSelectNode}
        className={cn(
          'relative group inline-block max-w-full transition-all duration-75',
          selected &&
            isEditable &&
            'ring-2 ring-primary ring-offset-2 ring-offset-background rounded-xl shadow-lg',
          isResizing && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
        )}
        style={{ width: displayWidth, maxWidth: '100%' }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- editor node renders arbitrary user-pasted/blob image sources with manual resize handles; next/image's static sizing doesn't fit this use case */}
        <img
          src={src}
          alt={alt || ''}
          draggable={false}
          className={cn(
            'block w-full h-auto rounded-xl object-contain pointer-events-auto cursor-pointer shadow-xs border border-border/40',
            isResizing && 'pointer-events-none'
          )}
        />

        {/* Live Percentage Badge while resizing */}
        {isResizing && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 px-2.5 py-0.5 rounded-full bg-primary text-primary-foreground text-3xs font-semibold shadow-md pointer-events-none animate-in fade-in duration-150">
            {displayWidth}
          </div>
        )}

        {/* Notion-style Left & Right Resize Handles */}
        {selected && isEditable && (
          <>
            {/* Left Handle */}
            <div
              onPointerDown={(e) => handlePointerDown(e, 'left')}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              className="absolute -left-2.5 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center cursor-ew-resize group/handle p-1"
              title="Tarik untuk mengubah ukuran gambar"
            >
              <div className="w-1.5 h-8 rounded-full bg-primary/80 group-hover/handle:bg-primary group-hover/handle:w-2 shadow-md transition-all border border-background" />
            </div>

            {/* Right Handle */}
            <div
              onPointerDown={(e) => handlePointerDown(e, 'right')}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              className="absolute -right-2.5 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center cursor-ew-resize group/handle p-1"
              title="Tarik untuk mengubah ukuran gambar"
            >
              <div className="w-1.5 h-8 rounded-full bg-primary/80 group-hover/handle:bg-primary group-hover/handle:w-2 shadow-md transition-all border border-background" />
            </div>
          </>
        )}
      </div>
    </NodeViewWrapper>
  );
};

const CustomImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      alignment: {
        default: 'center',
        renderHTML: (attributes) => {
          return {
            'data-alignment': attributes.alignment || 'center',
            class: `notion-img-${attributes.alignment || 'center'}`,
          };
        },
        parseHTML: (element) => element.getAttribute('data-alignment') || 'center',
      },
      width: {
        default: '100%',
        renderHTML: (attributes) => {
          const w = attributes.width || '100%';
          return {
            'data-width': w,
            style: `width: ${w}; max-width: 100%;`,
          };
        },
        parseHTML: (element) =>
          element.getAttribute('data-width') || element.style.width || '100%',
      },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageComponent);
  },
});

export interface NotionEditorProps {
  value?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  minHeight?: string;
  className?: string;
}

interface SlashCommandItem {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  shortcut?: string;
  keywords: string[];
  action: (editor: Editor) => void;
}

const COMMAND_ITEMS: SlashCommandItem[] = [
  {
    id: 'paragraph',
    title: 'Teks Biasa',
    description: 'Mulai menulis paragraf teks biasa',
    icon: Type,
    keywords: ['text', 'teks', 'p', 'paragraf', 'normal'],
    action: (editor) => editor.chain().focus().setParagraph().run(),
  },
  {
    id: 'h1',
    title: 'Heading 1',
    description: 'Judul bagian utama berukuran besar',
    icon: Heading1,
    shortcut: '#',
    keywords: ['h1', 'heading', 'judul', 'header', 'besar'],
    action: (editor) => editor.chain().focus().toggleHeading({ level: 1 }).run(),
  },
  {
    id: 'h2',
    title: 'Heading 2',
    description: 'Subjudul bagian sedang',
    icon: Heading2,
    shortcut: '##',
    keywords: ['h2', 'heading', 'subjudul', 'header', 'sedang'],
    action: (editor) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
  },
  {
    id: 'h3',
    title: 'Heading 3',
    description: 'Subjudul bagian kecil',
    icon: Heading3,
    shortcut: '###',
    keywords: ['h3', 'heading', 'subjudul', 'header', 'kecil'],
    action: (editor) => editor.chain().focus().toggleHeading({ level: 3 }).run(),
  },
  {
    id: 'table',
    title: 'Tabel Dinamis',
    description: 'Sisipkan tabel data yang bisa di-resize dan ditambah baris/kolom',
    icon: TableIcon,
    shortcut: '/tabel',
    keywords: ['table', 'tabel', 'grid', 'kolom', 'baris', 'sheet', 'matrix'],
    action: (editor) =>
      editor
        .chain()
        .focus()
        .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
        .run(),
  },
  {
    id: 'link',
    title: 'Tautan / Link Web',
    description: 'Sisipkan atau edit tautan hyperlink web (Ctrl+K)',
    icon: LinkIcon,
    shortcut: 'Ctrl+K',
    keywords: ['link', 'tautan', 'url', 'hyperlink', 'web', 'situs'],
    action: () => {},
  },
  {
    id: 'image',
    title: 'Gambar / Foto',
    description: 'Unggah gambar (JPG, PNG, WebP, GIF maks 5 MB)',
    icon: ImageIcon,
    shortcut: '/gambar',
    keywords: ['image', 'gambar', 'foto', 'photo', 'picture', 'upload', 'unggah', 'img'],
    action: () => {},
  },
  {
    id: 'task-list',
    title: 'Daftar Tugas / Checklist',
    description: 'Daftar ceklis pengerjaan dengan kotak centang',
    icon: CheckSquare,
    shortcut: '[]',
    keywords: ['todo', 'task', 'checklist', 'ceklis', 'centang', 'tugas'],
    action: (editor) => editor.chain().focus().toggleTaskList().run(),
  },
  {
    id: 'bullet-list',
    title: 'Daftar Poin',
    description: 'Daftar butir tanpa urutan angka',
    icon: List,
    shortcut: '-',
    keywords: ['bullet', 'list', 'poin', 'daftar', 'titik', 'ul'],
    action: (editor) => editor.chain().focus().toggleBulletList().run(),
  },
  {
    id: 'numbered-list',
    title: 'Daftar Bernomor',
    description: 'Daftar butir berurutan dengan nomor',
    icon: ListOrdered,
    shortcut: '1.',
    keywords: ['number', 'numbered', 'nomor', 'angka', 'daftar', 'ol'],
    action: (editor) => editor.chain().focus().toggleOrderedList().run(),
  },
  {
    id: 'blockquote',
    title: 'Kutipan / Catatan',
    description: 'Sorot informasi penting dengan garis kutipan',
    icon: Quote,
    shortcut: '>',
    keywords: ['quote', 'kutipan', 'catatan', 'note', 'info'],
    action: (editor) => editor.chain().focus().toggleBlockquote().run(),
  },
  {
    id: 'code-block',
    title: 'Blok Kode',
    description: 'Format kode pemrograman monospaced',
    icon: FileCode2,
    shortcut: '```',
    keywords: ['code', 'kode', 'program', 'snippet', 'pre'],
    action: (editor) => editor.chain().focus().toggleCodeBlock().run(),
  },
  {
    id: 'divider',
    title: 'Garis Pembatas',
    description: 'Pemisah visual antar bagian teks',
    icon: Minus,
    shortcut: '---',
    keywords: ['divider', 'line', 'garis', 'pembatas', 'separator', 'hr'],
    action: (editor) => editor.chain().focus().setHorizontalRule().run(),
  },
];

export function NotionEditor({
  value = '',
  onChange,
  placeholder,
  readOnly = false,
  minHeight = 'min-h-[160px]',
  className,
}: NotionEditorProps) {
  // true only after client-side mount, false during SSR — avoids a
  // hydration mismatch for the portal-rendered menus below. Implemented via
  // useSyncExternalStore (not an effect + setState) per
  // react-hooks/set-state-in-effect: there's nothing to subscribe to since
  // "mounted" never changes again after the first client render, but this
  // still gives the correct SSR-false / client-true snapshot split.
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const slashRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Bubble Menu state
  const [bubblePos, setBubblePos] = useState<{ x: number; y: number } | null>(null);

  // Floating Image Toolbar state
  const [imageToolbarPos, setImageToolbarPos] = useState<{ x: number; y: number } | null>(null);
  const imageToolbarRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Slash Command state
  const [slashOpen, setSlashOpen] = useState(false);
  const [slashPos, setSlashPos] = useState<{ x: number; y: number } | null>(null);
  const [slashQuery, setSlashQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Editor ref
  const editorRef = useRef<Editor | null>(null);

  // Link state & helpers
  const [isEditingLink, setIsEditingLink] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const isEditingLinkRef = useRef(false);
  useEffect(() => {
    isEditingLinkRef.current = isEditingLink;
  }, [isEditingLink]);

  const openLinkEditor = useCallback(() => {
    if (!editorRef.current) return;
    const currentEditor = editorRef.current;
    const currentHref = currentEditor.getAttributes('link').href || '';
    setLinkUrl(currentHref);
    setIsEditingLink(true);

    const { state, view } = currentEditor;
    const { from, to, empty } = state.selection;
    try {
      const startCoords = view.coordsAtPos(from);
      const endCoords = view.coordsAtPos(empty ? from : to);
      const virtualEl = {
        getBoundingClientRect: () => ({
          width: Math.max(1, Math.abs(endCoords.right - startCoords.left)),
          height: Math.max(1, Math.abs(endCoords.bottom - startCoords.top)),
          top: Math.min(startCoords.top, endCoords.top),
          bottom: Math.max(startCoords.bottom, endCoords.bottom),
          left: Math.min(startCoords.left, endCoords.left),
          right: Math.max(startCoords.right, endCoords.right),
          x: Math.min(startCoords.left, endCoords.left),
          y: Math.min(startCoords.top, endCoords.top),
          toJSON: () => {},
        }),
      };
      if (bubbleRef.current) {
        computePosition(virtualEl as VirtualElement, bubbleRef.current, {
          placement: 'top',
          middleware: [offset(8), flip(), shift({ padding: 12 })],
        }).then(({ x, y }) => {
          setBubblePos({ x, y });
        });
      } else {
        setBubblePos({ x: startCoords.left, y: Math.max(10, startCoords.top - 46) });
      }
    } catch {
      // ignore
    }
  }, []);

  const handleApplyLink = useCallback((rawUrl: string) => {
    if (!editorRef.current) return;
    const currentEditor = editorRef.current;
    const trimmed = rawUrl.trim();

    if (!trimmed) {
      currentEditor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      let validUrl = trimmed;
      if (
        !/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(validUrl) &&
        !validUrl.startsWith('#') &&
        !validUrl.startsWith('/')
      ) {
        validUrl = `https://${validUrl}`;
      }

      if (currentEditor.state.selection.empty && !currentEditor.isActive('link')) {
        currentEditor
          .chain()
          .focus()
          .insertContent({
            type: 'text',
            text: trimmed,
            marks: [{ type: 'link', attrs: { href: validUrl } }],
          })
          .run();
      } else {
        currentEditor
          .chain()
          .focus()
          .extendMarkRange('link')
          .setLink({ href: validUrl })
          .run();
      }
    }

    setIsEditingLink(false);
    setLinkUrl('');
  }, []);

  const handleUnsetLink = useCallback(() => {
    if (!editorRef.current) return;
    editorRef.current.chain().focus().extendMarkRange('link').unsetLink().run();
    setIsEditingLink(false);
    setLinkUrl('');
  }, []);


  const handleImageUpload = useCallback(async (file: File) => {
    if (!editorRef.current) return;
    setIsUploading(true);
    const toastId = toast.loading('Mengompres dan mengunggah gambar ke storage Cloudflare R2...');

    try {
      const { fileUrl, compression } = await uploadImage(file);
      editorRef.current
        .chain()
        .focus()
        .setImage({ src: fileUrl, alt: file.name })
        .run();

      if (compression?.wasCompressed) {
        const savedInfo = `hemat ${compression.savedPercentage}% • ${formatFileSize(compression.compressedSize)}`;
        toast.success(`Gambar berhasil diunggah (${savedInfo})!`, { id: toastId });
      } else {
        toast.success('Gambar berhasil diunggah!', { id: toastId });
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal mengunggah gambar.', { id: toastId });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, []);

  // Filter commands by query
  const filteredCommands = useMemo(() => {
    if (!slashQuery.trim()) return COMMAND_ITEMS;
    const q = slashQuery.trim().toLowerCase();
    return COMMAND_ITEMS.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.keywords.some((k) => k.includes(q)) ||
        (c.shortcut && c.shortcut.toLowerCase().includes(q))
    );
  }, [slashQuery]);

  // Keep slash state in ref for keyboard handling in ProseMirror editorProps
  const slashStateRef = useRef({
    slashOpen,
    filteredCommands,
    selectedIndex,
    executeCommand: (_item: SlashCommandItem) => {},
  });

  // Execute Slash Command
  const executeCommand = useCallback(
    (item: SlashCommandItem) => {
      if (!editorRef.current) return;
      const editor = editorRef.current;

      const { state } = editor;
      const { from } = state.selection;
      const resolvedPos = state.doc.resolve(from);
      const textBefore = resolvedPos.parent.textBetween(0, resolvedPos.parentOffset, '\n', '\0');
      const slashIndex = textBefore.lastIndexOf('/');

      if (slashIndex !== -1) {
        const startPos = from - (textBefore.length - slashIndex);
        editor.chain().focus().deleteRange({ from: startPos, to: from }).run();
      }

      setSlashOpen(false);
      setSlashQuery('');

      if (item.id === 'image') {
        fileInputRef.current?.click();
        return;
      }

      if (item.id === 'link') {
        openLinkEditor();
        return;
      }

      item.action(editor);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => {
    slashStateRef.current = {
      slashOpen,
      filteredCommands,
      selectedIndex,
      executeCommand,
    };
  }, [slashOpen, filteredCommands, selectedIndex, executeCommand]);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        dropcursor: false,
        link: false,
        underline: false,
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: 'https',
        protocols: ['http', 'https', 'mailto', 'tel'],
        HTMLAttributes: {
          target: '_blank',
          rel: 'noopener noreferrer',
          class: 'text-primary underline underline-offset-2 hover:opacity-80 transition-opacity cursor-pointer font-medium',
        },
      }),
      CustomImage.configure({
        allowBase64: false,
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Table.configure({
        resizable: true,
        renderWrapper: true,
        handleWidth: 6,
        cellMinWidth: 80,
        lastColumnResizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({
        placeholder: placeholder || "Ketik '/' untuk perintah atau opsi format...",
        showOnlyWhenEditable: true,
        showOnlyCurrent: true,
      }),
    ],
    content: value || '',
    editable: !readOnly,
    editorProps: {
      attributes: {
        class: cn(
          'prose-notion outline-none px-4 py-3.5',
          minHeight
        ),
      },
      handleDrop: (view, event, _slice, moved) => {
        if (moved || readOnly) return false;
        const files = event.dataTransfer?.files;
        if (!files || files.length === 0) return false;
        const file = files[0];
        if (file && file.type.startsWith('image/')) {
          event.preventDefault();
          const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY });
          if (coordinates && editorRef.current) {
            editorRef.current.commands.setTextSelection(coordinates.pos);
          }
          handleImageUpload(file);
          return true;
        }
        return false;
      },
      handlePaste: (_view, event) => {
        if (readOnly) return false;
        const items = event.clipboardData?.items;
        if (!items) return false;
        for (const item of Array.from(items)) {
          if (item.type.startsWith('image/')) {
            const file = item.getAsFile();
            if (file) {
              event.preventDefault();
              handleImageUpload(file);
              return true;
            }
          }
        }
        return false;
      },
      handleKeyDown: (_view, event) => {
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
          event.preventDefault();
          openLinkEditor();
          return true;
        }

        const { slashOpen: isOpen, filteredCommands: commands, selectedIndex: idx, executeCommand: exec } =
          slashStateRef.current;

        if (!isOpen) return false;

        if (event.key === 'ArrowDown') {
          event.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % Math.max(1, commands.length));
          return true;
        }

        if (event.key === 'ArrowUp') {
          event.preventDefault();
          setSelectedIndex((prev) => (prev <= 0 ? Math.max(0, commands.length - 1) : prev - 1));
          return true;
        }

        if (event.key === 'Enter') {
          if (commands.length > 0 && idx < commands.length) {
            event.preventDefault();
            exec(commands[idx]);
            return true;
          }
        }

        if (event.key === 'Escape') {
          event.preventDefault();
          setSlashOpen(false);
          return true;
        }

        return false;
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      const html = currentEditor.getHTML();
      onChange?.(html);
    },
  });

  // Keep the ref in sync so stable callbacks (handleImageUpload, keyboard
  // handlers, etc.) can always read the *latest* editor instance without
  // being re-created on every edit — the standard imperative-escape-hatch
  // pattern for wrapping a third-party imperative API (Tiptap) documented
  // by React itself. The React Compiler isn't enabled in this build (no
  // babel-plugin-react-compiler configured) — only its ESLint rule is,
  // which has no safe alternative for this exact pattern short of
  // restructuring the editor's entire callback wiring.
  useEffect(() => {
    editorRef.current = editor;
  }, [editor]);

  // Sync value from outside if changed
  useEffect(() => {
    if (editor && value !== undefined && value !== editor.getHTML()) {
      editor.commands.setContent(value || '');
    }
  }, [value, editor]);

  // Update Floating Bubble, Slash Menu, and Image Toolbar positions
  const updateMenus = useCallback(() => {
    if (!editor || readOnly) return;

    const { state, view } = editor;
    const { from, to, empty } = state.selection;

    // ─── 0. Floating Image Toolbar Check ───
    if (editor.isActive('image')) {
      try {
        const nodeDOM = view.nodeDOM(from) as HTMLElement | null;
        const imgEl =
          nodeDOM instanceof HTMLImageElement
            ? nodeDOM
            : nodeDOM?.querySelector?.('img') || nodeDOM;
        const rect = imgEl?.getBoundingClientRect?.() || view.coordsAtPos(from);

        const virtualEl = {
          getBoundingClientRect: () => ({
            width: (rect as DOMRect).width || 0,
            height: (rect as DOMRect).height || 0,
            top: rect.top,
            bottom: rect.bottom,
            left: rect.left,
            right: rect.right,
            x: rect.left,
            y: rect.top,
            toJSON: () => {},
          }),
        };

        if (imageToolbarRef.current) {
          computePosition(virtualEl as VirtualElement, imageToolbarRef.current, {
            placement: 'top',
            middleware: [offset(8), flip(), shift({ padding: 12 })],
          }).then(({ x, y }) => {
            setImageToolbarPos({ x, y });
          });
        } else {
          setImageToolbarPos({ x: rect.left, y: Math.max(10, rect.top - 46) });
        }
      } catch {
        setImageToolbarPos(null);
      }
      setBubblePos(null);
      setSlashOpen(false);
      return;
    } else {
      setImageToolbarPos(null);
    }

    // ─── 1. Slash Command Check ───
    if (empty) {
      const resolvedPos = state.doc.resolve(from);
      const textBefore = resolvedPos.parent.textBetween(0, resolvedPos.parentOffset, '\n', '\0');
      const lastSlash = textBefore.lastIndexOf('/');

      if (lastSlash !== -1 && (lastSlash === 0 || /\s/.test(textBefore[lastSlash - 1]))) {
        const textAfterSlash = textBefore.slice(lastSlash + 1);

        // If there's whitespace after '/', do not open menu
        if (!/\s/.test(textAfterSlash)) {
          const query = textAfterSlash.toLowerCase();
          setSlashQuery(query);
          setSelectedIndex(0);

          try {
            const coords = view.coordsAtPos(from);
            // Provide immediate position so the portal renders on the very first frame
            const initialX = Math.max(16, coords.left);
            const initialY = coords.bottom + 6;
            setSlashPos({ x: initialX, y: initialY });
            setSlashOpen(true);

            const virtualEl = {
              getBoundingClientRect: () => ({
                width: 0,
                height: coords.bottom - coords.top,
                top: coords.top,
                bottom: coords.bottom,
                left: coords.left,
                right: coords.left,
                x: coords.left,
                y: coords.top,
                toJSON: () => {},
              }),
            };

            if (slashRef.current) {
              computePosition(virtualEl as VirtualElement, slashRef.current, {
                placement: 'bottom-start',
                middleware: [offset(6), flip(), shift({ padding: 12 })],
              }).then(({ x, y }) => {
                setSlashPos({ x, y });
              });
            }
          } catch {
            // ignore layout timing exceptions
          }
          setBubblePos(null);
          return;
        }
      }
    }

    setSlashOpen(false);

    // ─── 2. Floating Bubble Menu Check (Selection Highlighted or Cursor on Link) ───
    if (isEditingLinkRef.current) {
      return;
    }

    const isLinkActive = editor.isActive('link');
    if (!empty || isLinkActive) {
      try {
        const startCoords = view.coordsAtPos(from);
        const endCoords = view.coordsAtPos(empty ? from : to);

        const virtualEl = {
          getBoundingClientRect: () => ({
            width: Math.max(1, Math.abs(endCoords.right - startCoords.left)),
            height: Math.max(1, Math.abs(endCoords.bottom - startCoords.top)),
            top: Math.min(startCoords.top, endCoords.top),
            bottom: Math.max(startCoords.bottom, endCoords.bottom),
            left: Math.min(startCoords.left, endCoords.left),
            right: Math.max(startCoords.right, endCoords.right),
            x: Math.min(startCoords.left, endCoords.left),
            y: Math.min(startCoords.top, endCoords.top),
            toJSON: () => {},
          }),
        };

        if (bubbleRef.current) {
          computePosition(virtualEl as VirtualElement, bubbleRef.current, {
            placement: 'top',
            middleware: [offset(8), flip(), shift({ padding: 12 })],
          }).then(({ x, y }) => {
            setBubblePos({ x, y });
          });
        } else {
          setBubblePos({ x: startCoords.left, y: Math.max(10, startCoords.top - 46) });
        }
      } catch {
        setBubblePos(null);
      }
    } else {
      setBubblePos(null);
      setIsEditingLink(false);
    }
  }, [editor, readOnly]);

  // Recalculate slash menu position once mounted
  useEffect(() => {
    if (!slashOpen || !slashRef.current || !editor) return;

    try {
      const { state, view } = editor;
      const { from } = state.selection;
      const coords = view.coordsAtPos(from);

      const virtualEl = {
        getBoundingClientRect: () => ({
          width: 0,
          height: coords.bottom - coords.top,
          top: coords.top,
          bottom: coords.bottom,
          left: coords.left,
          right: coords.left,
          x: coords.left,
          y: coords.top,
          toJSON: () => {},
        }),
      };

      computePosition(virtualEl as VirtualElement, slashRef.current, {
        placement: 'bottom-start',
        middleware: [offset(6), flip(), shift({ padding: 12 })],
      }).then(({ x, y }) => {
        setSlashPos({ x, y });
      });
    } catch {
      // ignore
    }
  }, [slashOpen, slashQuery, editor]);

  // Scroll active item into view
  useEffect(() => {
    if (slashOpen && itemRefs.current[selectedIndex]) {
      itemRefs.current[selectedIndex]?.scrollIntoView({
        block: 'nearest',
      });
    }
  }, [selectedIndex, slashOpen]);

  // Listen to editor selection and transaction changes
  useEffect(() => {
    if (!editor) return;

    editor.on('selectionUpdate', updateMenus);
    editor.on('transaction', updateMenus);

    return () => {
      editor.off('selectionUpdate', updateMenus);
      editor.off('transaction', updateMenus);
    };
  }, [editor, updateMenus]);

  // Listen to outside clicks to close slash menu and image toolbar
  useEffect(() => {
    if (!slashOpen && !imageToolbarPos) return;

    const handlePointerDown = (e: MouseEvent) => {
      if (
        slashRef.current &&
        !slashRef.current.contains(e.target as Node) &&
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setSlashOpen(false);
      }
      if (
        imageToolbarRef.current &&
        !imageToolbarRef.current.contains(e.target as Node) &&
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setImageToolbarPos(null);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
    };
  }, [slashOpen, imageToolbarPos]);

  // Reposition menus on window scroll
  useEffect(() => {
    if (!slashOpen && !bubblePos && !imageToolbarPos) return;

    const handleScroll = () => {
      updateMenus();
    };

    window.addEventListener('scroll', handleScroll, true);
    return () => {
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [slashOpen, bubblePos, imageToolbarPos, updateMenus]);

  if (!mounted || !editor) {
    return (
      <div
        className={cn(
          'w-full rounded-xl border border-input bg-background/50 p-4 animate-pulse',
          minHeight,
          className
        )}
      />
    );
  }

  const isInsideTable = editor.isActive('table');

  return (
    <div
      ref={containerRef}
      className={cn(
        'group relative w-full rounded-xl border border-border/80 bg-background transition-all focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 shadow-2xs',
        className
      )}
    >
      {/* Uploading progress bar */}
      {isUploading && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-primary/20 overflow-hidden rounded-t-xl z-20">
          <div className="h-full bg-primary animate-pulse w-full" />
        </div>
      )}

      {/* Hidden file input for image uploads */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            handleImageUpload(file);
          }
        }}
      />

      {/* Fixed Sticky Top Toolbar for Basic Text & Block Formatting */}
      {!readOnly && (
        <div className="sticky top-0 z-10 flex items-center gap-1 px-2.5 py-1.5 border-b border-border/80 bg-background/95 backdrop-blur-md rounded-t-xl overflow-x-auto scrollbar-none select-none text-xs">
          {/* History: Undo / Redo */}
          <div className="flex items-center gap-0.5 shrink-0">
            <button
              type="button"
              disabled={!editor.can().undo()}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editor.chain().focus().undo().run()}
              className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-35 disabled:pointer-events-none transition-colors cursor-pointer"
              title="Urungkan (Undo - Ctrl+Z)"
            >
              <Undo2 className="size-3.5" />
            </button>
            <button
              type="button"
              disabled={!editor.can().redo()}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editor.chain().focus().redo().run()}
              className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-35 disabled:pointer-events-none transition-colors cursor-pointer"
              title="Ulangi (Redo - Ctrl+Y)"
            >
              <Redo2 className="size-3.5" />
            </button>
          </div>

          <div className="h-4 w-px bg-border/70 mx-1 shrink-0" />

          {/* Block Types: Normal, H1, H2, H3 */}
          <div className="flex items-center gap-0.5 shrink-0">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editor.chain().focus().setParagraph().run()}
              className={cn(
                'px-2 py-1 rounded-md text-xs font-medium hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer',
                editor.isActive('paragraph') &&
                  !editor.isActive('bulletList') &&
                  !editor.isActive('orderedList') &&
                  !editor.isActive('taskList') &&
                  !editor.isActive('blockquote') &&
                  !editor.isActive('codeBlock') &&
                  'bg-muted text-primary font-bold'
              )}
              title="Teks Normal / Paragraf"
            >
              Teks
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              className={cn(
                'px-1.5 py-1 rounded-md text-xs font-semibold hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer',
                editor.isActive('heading', { level: 1 }) && 'bg-muted text-primary font-bold'
              )}
              title="Heading 1"
            >
              H1
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={cn(
                'px-1.5 py-1 rounded-md text-xs font-semibold hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer',
                editor.isActive('heading', { level: 2 }) && 'bg-muted text-primary font-bold'
              )}
              title="Heading 2"
            >
              H2
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              className={cn(
                'px-1.5 py-1 rounded-md text-xs font-semibold hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer',
                editor.isActive('heading', { level: 3 }) && 'bg-muted text-primary font-bold'
              )}
              title="Heading 3"
            >
              H3
            </button>
          </div>

          <div className="h-4 w-px bg-border/70 mx-1 shrink-0" />

          {/* Basic Text Formats: Bold, Italic, Underline, Strikethrough, Code, Link */}
          <div className="flex items-center gap-0.5 shrink-0">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={cn(
                'p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer',
                editor.isActive('bold') && 'bg-muted text-primary font-bold'
              )}
              title="Tebal (Bold - Ctrl+B)"
            >
              <Bold className="size-3.5" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={cn(
                'p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer',
                editor.isActive('italic') && 'bg-muted text-primary font-bold'
              )}
              title="Miring (Italic - Ctrl+I)"
            >
              <Italic className="size-3.5" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={cn(
                'p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer',
                editor.isActive('underline') && 'bg-muted text-primary font-bold'
              )}
              title="Garis Bawah (Underline - Ctrl+U)"
            >
              <UnderlineIcon className="size-3.5" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={cn(
                'p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer',
                editor.isActive('strike') && 'bg-muted text-primary font-bold'
              )}
              title="Coretan (Strikethrough)"
            >
              <Strikethrough className="size-3.5" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editor.chain().focus().toggleCode().run()}
              className={cn(
                'p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer',
                editor.isActive('code') && 'bg-muted text-primary font-mono font-bold'
              )}
              title="Inline Kode"
            >
              <Code className="size-3.5" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => openLinkEditor()}
              className={cn(
                'p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer',
                editor.isActive('link') && 'bg-muted text-primary font-bold'
              )}
              title="Tautan / Link (Ctrl+K)"
            >
              <LinkIcon className="size-3.5" />
            </button>
          </div>

          <div className="h-4 w-px bg-border/70 mx-1 shrink-0" />

          {/* Lists: Bullet, Numbered, Checklist */}
          <div className="flex items-center gap-0.5 shrink-0">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={cn(
                'p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer',
                editor.isActive('bulletList') && 'bg-muted text-primary font-bold'
              )}
              title="Daftar Poin (Bullet List)"
            >
              <List className="size-3.5" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={cn(
                'p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer',
                editor.isActive('orderedList') && 'bg-muted text-primary font-bold'
              )}
              title="Daftar Nomor (Numbered List)"
            >
              <ListOrdered className="size-3.5" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editor.chain().focus().toggleTaskList().run()}
              className={cn(
                'p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer',
                editor.isActive('taskList') && 'bg-muted text-primary font-bold'
              )}
              title="Checklist Tugas"
            >
              <CheckSquare className="size-3.5" />
            </button>
          </div>

          <div className="h-4 w-px bg-border/70 mx-1 shrink-0" />

          {/* Block Quotes, Code Block, Image */}
          <div className="flex items-center gap-0.5 shrink-0">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={cn(
                'p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer',
                editor.isActive('blockquote') && 'bg-muted text-primary font-bold'
              )}
              title="Kutipan / Blockquote"
            >
              <Quote className="size-3.5" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              className={cn(
                'p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer',
                editor.isActive('codeBlock') && 'bg-muted text-primary font-bold'
              )}
              title="Blok Kode"
            >
              <FileCode2 className="size-3.5" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              title="Unggah Gambar"
            >
              <ImageIcon className="size-3.5 text-primary" />
            </button>
          </div>

          <div className="h-4 w-px bg-border/70 mx-1 shrink-0" />

          {/* Clear Formatting */}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer ml-auto shrink-0"
            title="Hapus Semua Format (Clear Formatting)"
          >
            <RemoveFormatting className="size-3.5" />
          </button>
        </div>
      )}

      {/* Dynamic Notion Table Toolbar (Appears whenever cursor is inside any table) */}
      {isInsideTable && !readOnly && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted/40 border-b border-border/60 text-2xs text-muted-foreground flex-wrap rounded-t-xl animate-in fade-in duration-150 select-none">
          <div className="flex items-center gap-1 font-semibold text-foreground mr-1">
            <TableIcon className="size-3.5 text-primary" />
            <span>Tabel Dinamis:</span>
          </div>

          {/* Add Rows */}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().addRowAfter().run()}
            className="px-2 py-0.5 rounded border border-border/60 bg-background hover:bg-muted text-foreground transition-colors cursor-pointer flex items-center gap-1 shadow-2xs text-3xs"
            title="Tambah baris baru di bawah baris saat ini (Bisa juga tekan Tab di sel terakhir)"
          >
            <Rows className="size-3 text-primary" />
            <span>+ Baris Bawah</span>
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().addRowBefore().run()}
            className="px-2 py-0.5 rounded border border-border/60 bg-background hover:bg-muted text-foreground transition-colors cursor-pointer flex items-center gap-1 shadow-2xs text-3xs"
            title="Tambah baris baru di atas"
          >
            <Plus className="size-2.5 text-muted-foreground" />
            <span>Baris Atas</span>
          </button>

          {/* Add Columns */}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().addColumnAfter().run()}
            className="px-2 py-0.5 rounded border border-border/60 bg-background hover:bg-muted text-foreground transition-colors cursor-pointer flex items-center gap-1 shadow-2xs text-3xs"
            title="Tambah kolom baru di sebelah kanan"
          >
            <Columns3 className="size-3 text-primary" />
            <span>+ Kolom Kanan</span>
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().addColumnBefore().run()}
            className="px-2 py-0.5 rounded border border-border/60 bg-background hover:bg-muted text-foreground transition-colors cursor-pointer flex items-center gap-1 shadow-2xs text-3xs"
            title="Tambah kolom baru di sebelah kiri"
          >
            <Plus className="size-2.5 text-muted-foreground" />
            <span>Kolom Kiri</span>
          </button>

          <div className="h-3.5 w-px bg-border/80 mx-0.5" />

          {/* Toggle Header Row / Column */}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().toggleHeaderRow().run()}
            className="px-2 py-0.5 rounded border border-border/60 bg-background hover:bg-muted text-foreground transition-colors cursor-pointer flex items-center gap-1 shadow-2xs text-3xs"
            title="Ubah baris pertama menjadi judul kolom (Header Row)"
          >
            <PanelTop className="size-3 text-muted-foreground" />
            <span>Header Baris</span>
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().toggleHeaderColumn().run()}
            className="px-2 py-0.5 rounded border border-border/60 bg-background hover:bg-muted text-foreground transition-colors cursor-pointer flex items-center gap-1 shadow-2xs text-3xs"
            title="Ubah kolom pertama menjadi judul baris (Header Column)"
          >
            <PanelLeft className="size-3 text-muted-foreground" />
            <span>Header Kolom</span>
          </button>

          <div className="h-3.5 w-px bg-border/80 mx-0.5" />

          {/* Delete Row / Column */}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().deleteRow().run()}
            className="px-2 py-0.5 rounded border border-border/60 bg-background hover:bg-destructive/10 hover:border-destructive/30 hover:text-destructive text-muted-foreground transition-colors cursor-pointer flex items-center gap-1 text-3xs"
            title="Hapus baris saat ini"
          >
            <Trash2 className="size-2.5" />
            <span>Hapus Baris</span>
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().deleteColumn().run()}
            className="px-2 py-0.5 rounded border border-border/60 bg-background hover:bg-destructive/10 hover:border-destructive/30 hover:text-destructive text-muted-foreground transition-colors cursor-pointer flex items-center gap-1 text-3xs"
            title="Hapus kolom saat ini"
          >
            <Trash2 className="size-2.5" />
            <span>Hapus Kolom</span>
          </button>

          {/* Delete Table */}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().deleteTable().run()}
            className="px-2 py-0.5 rounded border border-destructive/30 bg-destructive/5 hover:bg-destructive/15 text-destructive transition-colors cursor-pointer flex items-center gap-1 ml-auto font-medium text-3xs"
            title="Hapus seluruh tabel"
          >
            <Trash2 className="size-2.5" />
            <span>Hapus Tabel</span>
          </button>
        </div>
      )}

      {/* Editor Content Area */}
      <EditorContent editor={editor} />

      {/* Floating Bubble Menu (Shown on Text Selection) via Portal */}
      {mounted && bubblePos && !readOnly && typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={bubbleRef}
            style={{
              position: 'fixed',
              left: `${bubblePos.x}px`,
              top: `${bubblePos.y}px`,
              zIndex: 9999,
            }}
            className="flex items-center gap-0.5 rounded-lg border border-border/80 bg-popover/95 p-1 text-popover-foreground shadow-xl backdrop-blur-md animate-in fade-in-50 zoom-in-95 duration-100 select-none"
          >
            {isEditingLink ? (
              <div className="flex items-center gap-1.5 p-0.5">
                <LinkIcon className="size-3.5 text-primary ml-1 shrink-0" />
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleApplyLink(linkUrl);
                    } else if (e.key === 'Escape') {
                      e.preventDefault();
                      setIsEditingLink(false);
                    }
                  }}
                  placeholder="Ketik atau tempel URL (misal: https://...)"
                  className="h-7 w-52 sm:w-64 rounded-md border border-input bg-background px-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  autoFocus
                />
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleApplyLink(linkUrl)}
                  className="h-7 px-2.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-medium transition-colors cursor-pointer"
                  title="Terapkan tautan (Enter)"
                >
                  Terapkan
                </button>
                {editor.isActive('link') && (
                  <>
                    {editor.getAttributes('link').href && (
                      <a
                        href={editor.getAttributes('link').href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        title="Buka tautan di tab baru"
                      >
                        <ExternalLink className="size-3.5" />
                      </a>
                    )}
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={handleUnsetLink}
                      className="p-1.5 rounded-md hover:bg-destructive/10 text-destructive transition-colors cursor-pointer"
                      title="Hapus tautan"
                    >
                      <Unlink className="size-3.5" />
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setIsEditingLink(false)}
                  className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  title="Tutup (Esc)"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            ) : editor.state.selection.empty && editor.isActive('link') ? (
              <div className="flex items-center gap-1.5 px-2 py-1 text-xs">
                <LinkIcon className="size-3.5 text-primary shrink-0" />
                <a
                  href={editor.getAttributes('link').href || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary underline underline-offset-2 hover:opacity-80 max-w-44 truncate"
                  title={editor.getAttributes('link').href}
                >
                  {editor.getAttributes('link').href}
                </a>
                <a
                  href={editor.getAttributes('link').href || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  title="Buka tautan di tab baru"
                >
                  <ExternalLink className="size-3.5" />
                </a>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => openLinkEditor()}
                  className="px-1.5 py-0.5 rounded text-3xs font-medium border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  title="Ubah URL tautan"
                >
                  Ubah
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={handleUnsetLink}
                  className="p-1 rounded hover:bg-destructive/10 text-destructive transition-colors cursor-pointer"
                  title="Hapus tautan"
                >
                  <Unlink className="size-3.5" />
                </button>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  className={cn(
                    'p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer',
                    editor.isActive('bold') && 'bg-muted text-primary font-bold'
                  )}
                  title="Tebal (Ctrl+B)"
                >
                  <Bold className="size-3.5" />
                </button>

                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  className={cn(
                    'p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer',
                    editor.isActive('italic') && 'bg-muted text-primary'
                  )}
                  title="Miring (Ctrl+I)"
                >
                  <Italic className="size-3.5" />
                </button>

                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => editor.chain().focus().toggleUnderline().run()}
                  className={cn(
                    'p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer',
                    editor.isActive('underline') && 'bg-muted text-primary'
                  )}
                  title="Garis Bawah (Ctrl+U)"
                >
                  <UnderlineIcon className="size-3.5" />
                </button>

                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => editor.chain().focus().toggleStrike().run()}
                  className={cn(
                    'p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer',
                    editor.isActive('strike') && 'bg-muted text-primary'
                  )}
                  title="Coretan"
                >
                  <Strikethrough className="size-3.5" />
                </button>

                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => editor.chain().focus().toggleCode().run()}
                  className={cn(
                    'p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer',
                    editor.isActive('code') && 'bg-muted text-primary font-mono'
                  )}
                  title="Inline Kode"
                >
                  <Code className="size-3.5" />
                </button>

                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => openLinkEditor()}
                  className={cn(
                    'p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer',
                    editor.isActive('link') && 'bg-muted text-primary font-bold'
                  )}
                  title="Sisipkan/Ubah Tautan (Ctrl+K)"
                >
                  <LinkIcon className="size-3.5" />
                </button>

                {editor.isActive('link') && (
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={handleUnsetLink}
                    className="p-1.5 rounded-md hover:bg-destructive/10 text-destructive transition-colors cursor-pointer"
                    title="Hapus Tautan"
                  >
                    <Unlink className="size-3.5" />
                  </button>
                )}

                <div className="h-4 w-px bg-border mx-1" />

                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                  className={cn(
                    'px-1.5 py-1 rounded-md text-xs font-semibold hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer',
                    editor.isActive('heading', { level: 2 }) && 'bg-muted text-primary'
                  )}
                  title="Heading 2"
                >
                  H2
                </button>

                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                  className={cn(
                    'px-1.5 py-1 rounded-md text-xs font-semibold hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer',
                    editor.isActive('heading', { level: 3 }) && 'bg-muted text-primary'
                  )}
                  title="Heading 3"
                >
                  H3
                </button>

                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => editor.chain().focus().toggleBulletList().run()}
                  className={cn(
                    'p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer',
                    editor.isActive('bulletList') && 'bg-muted text-primary'
                  )}
                  title="Daftar Poin"
                >
                  <List className="size-3.5" />
                </button>

                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => editor.chain().focus().toggleTaskList().run()}
                  className={cn(
                    'p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer',
                    editor.isActive('taskList') && 'bg-muted text-primary'
                  )}
                  title="Checklist Tugas"
                >
                  <CheckSquare className="size-3.5" />
                </button>

                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => editor.chain().focus().toggleBlockquote().run()}
                  className={cn(
                    'p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer',
                    editor.isActive('blockquote') && 'bg-muted text-primary'
                  )}
                  title="Kutipan"
                >
                  <Quote className="size-3.5" />
                </button>

                <div className="h-4 w-px bg-border mx-0.5" />

                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => fileInputRef.current?.click()}
                  className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  title="Sisipkan Gambar dari Komputer"
                >
                  <ImageIcon className="size-3.5 text-primary" />
                </button>
              </>
            )}
          </div>,
          document.body
        )}

      {/* Notion-style Slash Command Popover (Shown when typing '/') via Portal */}
      {mounted && slashOpen && slashPos && !readOnly && typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={slashRef}
            style={{
              position: 'fixed',
              left: `${slashPos.x}px`,
              top: `${slashPos.y}px`,
              zIndex: 9999,
            }}
            className="w-76 max-h-80 overflow-y-auto rounded-xl border border-border/80 bg-popover text-popover-foreground shadow-2xl p-1.5 animate-in fade-in-50 zoom-in-95 duration-100 select-none scrollbar-thin"
          >
            <div className="px-2 py-1.5 text-3xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border/50 mb-1 flex items-center justify-between">
              <span>Perintah Blok Notion</span>
              {slashQuery && (
                <span className="text-primary font-normal lowercase">/{slashQuery}</span>
              )}
            </div>

            {filteredCommands.length === 0 ? (
              <div className="p-3 text-center text-xs text-muted-foreground">
                Tidak ada perintah cocok &quot;/{slashQuery}&quot;
              </div>
            ) : (
              <div className="space-y-0.5">
                {filteredCommands.map((item, index) => {
                  const Icon = item.icon;
                  const isSelected = index === selectedIndex;
                  return (
                    <button
                      key={item.id}
                      ref={(el) => {
                        itemRefs.current[index] = el;
                      }}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => executeCommand(item)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={cn(
                        'flex items-center gap-2.5 w-full p-2 rounded-lg text-left transition-colors cursor-pointer',
                        isSelected
                          ? 'bg-muted text-foreground font-medium'
                          : 'text-muted-foreground hover:bg-muted/60'
                      )}
                    >
                      <div
                        className={cn(
                          'flex size-7 shrink-0 items-center justify-center rounded-md border text-xs',
                          isSelected
                            ? 'bg-primary/10 border-primary/30 text-primary'
                            : 'bg-muted border-border/60 text-muted-foreground'
                        )}
                      >
                        <Icon className="size-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-foreground font-medium truncate">
                            {item.title}
                          </span>
                          {item.shortcut && (
                            <span className="text-3xs font-mono text-muted-foreground/70 bg-muted/60 px-1 py-0.2 rounded border border-border/40">
                              {item.shortcut}
                            </span>
                          )}
                        </div>
                        <p className="text-3xs text-muted-foreground truncate leading-tight">
                          {item.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>,
          document.body
        )}

      {/* Floating Image Control Toolbar via Portal */}
      {mounted && imageToolbarPos && !readOnly && typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={imageToolbarRef}
            style={{
              position: 'fixed',
              left: `${imageToolbarPos.x}px`,
              top: `${imageToolbarPos.y}px`,
              zIndex: 9999,
            }}
            className="flex items-center gap-1 rounded-lg border border-border/80 bg-popover/95 p-1 text-popover-foreground shadow-xl backdrop-blur-md animate-in fade-in-50 zoom-in-95 duration-100 select-none"
          >
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() =>
                editor.chain().focus().updateAttributes('image', { alignment: 'left' }).run()
              }
              className={cn(
                'p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer',
                editor.getAttributes('image').alignment === 'left' && 'bg-muted text-primary'
              )}
              title="Rata Kiri"
            >
              <AlignLeft className="size-3.5" />
            </button>

            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() =>
                editor.chain().focus().updateAttributes('image', { alignment: 'center' }).run()
              }
              className={cn(
                'p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer',
                (!editor.getAttributes('image').alignment ||
                  editor.getAttributes('image').alignment === 'center') &&
                  'bg-muted text-primary'
              )}
              title="Rata Tengah (Default)"
            >
              <AlignCenter className="size-3.5" />
            </button>

            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() =>
                editor.chain().focus().updateAttributes('image', { alignment: 'right' }).run()
              }
              className={cn(
                'p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer',
                editor.getAttributes('image').alignment === 'right' && 'bg-muted text-primary'
              )}
              title="Rata Kanan"
            >
              <AlignRight className="size-3.5" />
            </button>

            <div className="h-4 w-px bg-border mx-0.5" />

            {/* Quick Size Presets */}
            {(['25%', '50%', '75%', '100%'] as const).map((size) => {
              const currentWidth = editor.getAttributes('image').width || '100%';
              const isActive = currentWidth === size;
              return (
                <button
                  key={size}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() =>
                    editor.chain().focus().updateAttributes('image', { width: size }).run()
                  }
                  className={cn(
                    'px-1.5 py-0.5 rounded-md hover:bg-muted text-3xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer',
                    isActive && 'bg-primary/15 text-primary font-bold'
                  )}
                  title={`Ubah ukuran ke ${size}`}
                >
                  {size}
                </button>
              );
            })}

            <div className="h-4 w-px bg-border mx-0.5" />

            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                const currentAlt = editor.getAttributes('image').alt || '';
                const newAlt = window.prompt('Masukkan teks keterangan (alt) gambar:', currentAlt);
                if (newAlt !== null) {
                  editor.chain().focus().updateAttributes('image', { alt: newAlt }).run();
                }
              }}
              className={cn(
                'px-2 py-1 rounded-md hover:bg-muted text-3xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer flex items-center gap-1',
                editor.getAttributes('image').alt && 'text-primary font-semibold'
              )}
              title="Ubah teks keterangan gambar"
            >
              <span>Alt</span>
            </button>

            <div className="h-4 w-px bg-border mx-0.5" />

            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editor.chain().focus().deleteSelection().run()}
              className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
              title="Hapus Gambar"
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>,
          document.body
        )}

      {/* Editor Footer Hint & Quick Actions */}
      {!readOnly && (
        <div className="flex items-center justify-between px-3.5 py-1.5 border-t border-border/40 text-3xs text-muted-foreground/70 bg-muted/10 rounded-b-xl select-none flex-wrap gap-2">
          <span>
            {isInsideTable
              ? 'Tabel: Drag garis tepi kolom untuk atur lebar • Tekan Tab di sel terakhir untuk tambah baris'
              : "Ketik '/' untuk perintah lengkap • Drag atau paste gambar langsung ke dokumen"}
          </span>
          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded border border-border/70 bg-background hover:bg-muted text-foreground transition-all cursor-pointer text-3xs font-medium shadow-2xs hover:border-primary/50 active:scale-95 disabled:opacity-50"
              title="Unggah Gambar dari Komputer (JPG, PNG, WebP, GIF maks 5 MB)"
            >
              <ImageIcon className="size-3 text-primary" />
              <span>+ Sisipkan Gambar</span>
            </button>
            {isUploading && (
              <span className="flex items-center gap-1 text-primary animate-pulse font-medium">
                <Loader2 className="size-3 animate-spin" />
                Mengunggah...
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
