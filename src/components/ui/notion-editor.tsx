'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Placeholder from '@tiptap/extension-placeholder';
import { Table, TableRow, TableCell, TableHeader } from '@tiptap/extension-table';
import { computePosition, flip, shift, offset } from '@floating-ui/dom';
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
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
  action: (editor: any) => void;
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
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const slashRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Bubble Menu state
  const [bubblePos, setBubblePos] = useState<{ x: number; y: number } | null>(null);

  // Slash Command state
  const [slashOpen, setSlashOpen] = useState(false);
  const [slashPos, setSlashPos] = useState<{ x: number; y: number } | null>(null);
  const [slashQuery, setSlashQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    setMounted(true);
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

      item.action(editor);
      setSlashOpen(false);
      setSlashQuery('');
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

  const editorRef = useRef<any>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        dropcursor: false,
      }),
      Underline,
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
      handleKeyDown: (_view, event) => {
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

  editorRef.current = editor;

  // Sync value from outside if changed
  useEffect(() => {
    if (editor && value !== undefined && value !== editor.getHTML()) {
      editor.commands.setContent(value || '');
    }
  }, [value, editor]);

  // Update Floating Bubble and Slash Menu positions
  const updateMenus = useCallback(() => {
    if (!editor || readOnly) return;

    const { state, view } = editor;
    const { from, to, empty } = state.selection;

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
              computePosition(virtualEl as any, slashRef.current, {
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

    // ─── 2. Floating Bubble Menu Check (Selection Highlighted) ───
    if (!empty) {
      try {
        const startCoords = view.coordsAtPos(from);
        const endCoords = view.coordsAtPos(to);

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
          computePosition(virtualEl as any, bubbleRef.current, {
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

      computePosition(virtualEl as any, slashRef.current, {
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

  // Listen to outside clicks to close slash menu
  useEffect(() => {
    if (!slashOpen) return;

    const handlePointerDown = (e: MouseEvent) => {
      if (
        slashRef.current &&
        !slashRef.current.contains(e.target as Node) &&
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setSlashOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
    };
  }, [slashOpen]);

  // Reposition menus on window scroll
  useEffect(() => {
    if (!slashOpen && !bubblePos) return;

    const handleScroll = () => {
      updateMenus();
    };

    window.addEventListener('scroll', handleScroll, true);
    return () => {
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [slashOpen, bubblePos, updateMenus]);

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

      {/* Editor Footer Hint */}
      {!readOnly && (
        <div className="flex items-center justify-between px-3.5 py-1.5 border-t border-border/40 text-3xs text-muted-foreground/70 bg-muted/10 rounded-b-xl select-none">
          <span>
            {isInsideTable
              ? 'Tabel: Drag garis tepi kolom untuk atur lebar • Tekan Tab di sel terakhir untuk tambah baris'
              : "Ketik '/' untuk opsi blok (Tabel, Heading, Checklist, dll) • Sorot teks untuk format cepat"}
          </span>
          <span>Notion Editor</span>
        </div>
      )}
    </div>
  );
}
