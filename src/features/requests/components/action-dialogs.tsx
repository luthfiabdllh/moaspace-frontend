'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  useApproveOrigin,
  useTriageRequest,
  useRespondInfo,
  useConvertToStory,
  useConvertToEpic,
  useDeliverRequest,
  useConfirmRequest,
  useUpdateDraft,
  useSubmitDraft,
  useStartRevision,
} from '../api/use-mutations';
import { DynamicFormRenderer } from './dynamic-form-renderer';
import { NotionEditor } from '@/components/ui/notion-editor';
import { DatePicker } from '@/components/ui/date-picker';
import type { RequestDetail, RequestTemplate } from '../types';
import { useEpics } from '@/features/epics/api/use-queries';
import { useDivisions } from '@/features/divisions/api/use-queries';
import { Plus, Trash2, CheckCircle2, XCircle, HelpCircle, Sparkles, Send, Target, Network, Layers, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

// Memeriksa apakah HTML rich-text (TipTap) punya isi bermakna: ada teks atau
// gambar, bukan sekadar tag kosong seperti "<p></p>".
function hasMeaningfulContent(html: string): boolean {
  if (!html) return false;
  if (/<img[\s>]/i.test(html)) return true;
  return html.replace(/<[^>]*>/g, '').trim().length > 0;
}

// ─── 1. ORIGIN APPROVAL DIALOG ───────────────────────────────────────────────
export function OriginApprovalDialog({
  request,
  open,
  onOpenChange,
}: {
  request: RequestDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [reason, setReason] = useState('');
  const [action, setAction] = useState<'APPROVE' | 'REJECT'>('APPROVE');
  const mutation = useApproveOrigin(request.id);

  const handleSubmit = async () => {
    if (action === 'REJECT' && !reason.trim()) {
      toast.error('Alasan penolakan wajib dicantumkan');
      return;
    }
    await mutation.mutateAsync({ action, reason: reason.trim() || undefined });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-120">
        <DialogHeader>
          <DialogTitle>Persetujuan Koordinator Divisi Asal</DialogTitle>
          <DialogDescription>
            Tinjau permohonan kolaborasi &quot;{request.title}&quot; sebelum diteruskan ke divisi tujuan.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={action === 'APPROVE' ? 'default' : 'outline'}
              className="gap-2"
              onClick={() => setAction('APPROVE')}
            >
              <CheckCircle2 className="h-4 w-4" />
              Setujui (Teruskan)
            </Button>
            <Button
              type="button"
              variant={action === 'REJECT' ? 'destructive' : 'outline'}
              className="gap-2"
              onClick={() => setAction('REJECT')}
            >
              <XCircle className="h-4 w-4" />
              Tolak Internal
            </Button>
          </div>

          {action === 'REJECT' && (
            <div className="space-y-1.5">
              <Label htmlFor="rejectReason">Alasan Penolakan <span className="text-destructive">*</span></Label>
              <Textarea
                id="rejectReason"
                rows={3}
                placeholder="Jelaskan alasan permohonan ini ditolak di tingkat internal divisi..."
                value={reason}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReason(e.target.value)}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={handleSubmit} disabled={mutation.isPending}>
            {mutation.isPending ? 'Memproses...' : 'Kirim Keputusan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── 2. TRIAGE DIALOG (DIVISI TUJUAN) ─────────────────────────────────────────
export function TriageDialog({
  request,
  open,
  onOpenChange,
}: {
  request: RequestDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [action, setAction] = useState<'ACCEPT' | 'REJECT' | 'NEED_INFO'>('ACCEPT');
  const [reason, setReason] = useState('');
  const mutation = useTriageRequest(request.id);

  const handleSubmit = async () => {
    if ((action === 'REJECT' || action === 'NEED_INFO') && !reason.trim()) {
      toast.error('Alasan atau penjelasan informasi yang dibutuhkan wajib dicantumkan');
      return;
    }
    await mutation.mutateAsync({ action, reason: reason.trim() || undefined });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>Triage Permohonan Masuk</DialogTitle>
          <DialogDescription>
            Pilih tindakan terhadap permohonan &quot;{request.title}&quot; dari {request.fromDivisionName}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-3 gap-2">
            <Button
              type="button"
              size="sm"
              variant={action === 'ACCEPT' ? 'default' : 'outline'}
              className="gap-1.5 text-xs"
              onClick={() => setAction('ACCEPT')}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Terima
            </Button>
            <Button
              type="button"
              size="sm"
              variant={action === 'NEED_INFO' ? 'secondary' : 'outline'}
              className="gap-1.5 text-xs"
              onClick={() => setAction('NEED_INFO')}
            >
              <HelpCircle className="h-3.5 w-3.5" />
              Minta Info
            </Button>
            <Button
              type="button"
              size="sm"
              variant={action === 'REJECT' ? 'destructive' : 'outline'}
              className="gap-1.5 text-xs"
              onClick={() => setAction('REJECT')}
            >
              <XCircle className="h-3.5 w-3.5" />
              Tolak
            </Button>
          </div>

          {action !== 'ACCEPT' && (
            <div className="space-y-1.5">
              <Label htmlFor="triageReason">
                {action === 'NEED_INFO'
                  ? 'Informasi Tambahan yang Dibutuhkan'
                  : 'Alasan Penolakan Permohonan'}{' '}
                <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="triageReason"
                rows={3}
                placeholder={
                  action === 'NEED_INFO'
                    ? 'Jelaskan data atau brief apa yang masih kurang lengkap...'
                    : 'Jelaskan mengapa permohonan ini belum dapat diterima...'
                }
                value={reason}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReason(e.target.value)}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={handleSubmit} disabled={mutation.isPending}>
            {mutation.isPending ? 'Memproses...' : 'Simpan Triage'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── 3. RESPOND INFO DIALOG ──────────────────────────────────────────────────
export function RespondInfoDialog({
  request,
  template,
  open,
  onOpenChange,
}: {
  request: RequestDetail;
  template?: RequestTemplate;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [brief, setBrief] = useState<Record<string, unknown>>(request.brief || {});
  const [note, setNote] = useState('');
  const mutation = useRespondInfo(request.id);

  const handleSubmit = async () => {
    await mutation.mutateAsync({ brief, note: note.trim() || undefined });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-137.5 max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Lengkapi Informasi Permohonan</DialogTitle>
          <DialogDescription>
            Divisi tujuan meminta informasi tambahan berikut: &quot;{request.reason}&quot;
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {template?.fields && template.fields.length > 0 ? (
            <DynamicFormRenderer
              fields={template.fields}
              values={brief}
              onChange={setBrief}
            />
          ) : (
            <div className="space-y-1.5">
              <Label htmlFor="generalBrief">Perbarui Brief Permohonan</Label>
              <NotionEditor
                value={typeof brief.deskripsi === 'string' ? brief.deskripsi : ''}
                onChange={(html) => setBrief({ ...brief, deskripsi: html })}
                placeholder="Perbarui rincian kebutuhan... (Ketik '/' untuk opsi format blok)"
                minHeight="min-h-[160px]"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="respondNote">Catatan Tanggapan (Opsional)</Label>
            <Input
              id="respondNote"
              placeholder="Catatan tambahan untuk divisi tujuan..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={handleSubmit} disabled={mutation.isPending}>
            {mutation.isPending ? 'Mengirim...' : 'Kirim Kembali ke Divisi Tujuan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── 4. CONVERT TO STORY DIALOG ──────────────────────────────────────────────
export function ConvertToStoryDialog({
  request,
  open,
  onOpenChange,
}: {
  request: RequestDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [title, setTitle] = useState(request.title);
  const [epicId, setEpicId] = useState<string>('NONE');
  const [doneCriteria, setDoneCriteria] = useState('');
  const [targetDate, setTargetDate] = useState(
    request.deadline ? request.deadline.split('T')[0] : ''
  );
  const [prokerTag, setProkerTag] = useState('');
  const [createInitialTask, setCreateInitialTask] = useState(true);
  const mutation = useConvertToStory(request.id);

  const { data: epics = [] } = useEpics({
    isClosed: false,
    divisionId: request.toDivisionId,
  });

  const handleSubmit = async () => {
    await mutation.mutateAsync({
      title: title.trim() || request.title,
      epicId: epicId && epicId !== 'NONE' ? epicId : undefined,
      doneCriteria: doneCriteria.trim() || undefined,
      targetDate: targetDate || undefined,
      prokerTag: prokerTag.trim() || undefined,
      createInitialTask,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-120">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Konversi Menjadi Story di Kanban
          </DialogTitle>
          <DialogDescription>
            Membuat deliverable Story baru di board {request.toDivisionName} untuk memulai pengerjaan task.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Induk Epic */}
          <div className="space-y-1.5">
            <Label htmlFor="epicSelect" className="flex items-center gap-1.5 text-xs font-semibold">
              <Target className="size-3.5 text-muted-foreground" />
              Induk Epic / Program Kerja Divisi (Opsional)
            </Label>
            <select
              id="epicSelect"
              value={epicId}
              onChange={(e) => setEpicId(e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="NONE">-- Tanpa Epic (Pekerjaan Rutin Divisi) --</option>
              {epics.map((epic) => (
                <option key={epic.id} value={epic.id}>
                  {epic.scope === 'CROSS' ? '[Lintas Divisi] ' : ''}
                  {epic.title}
                </option>
              ))}
            </select>
            <p className="text-2xs text-muted-foreground">
              Pilih Epic agar Story deliverable ini masuk dalam struktur inisiatif / proker {request.toDivisionName}.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="storyTitle">Judul Deliverable Story</Label>
            <Input
              id="storyTitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="targetDate">Target Tanggal Selesai</Label>
            <DatePicker
              id="targetDate"
              value={targetDate}
              onChange={(v) => setTargetDate(v || '')}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="prokerTag">Tag Proker / Inisiatif (Opsional)</Label>
            <Input
              id="prokerTag"
              placeholder="Contoh: EXPO_KKN, PUBLIKASI"
              value={prokerTag}
              onChange={(e) => setProkerTag(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="doneCriteria">Kriteria Selesai (Done Criteria)</Label>
            <Textarea
              id="doneCriteria"
              rows={2}
              placeholder="Syarat hasil dianggap selesai..."
              value={doneCriteria}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDoneCriteria(e.target.value)}
            />
          </div>

          {/* Opsi Buat Task Otomatis */}
          <div className="flex items-center gap-2 pt-1 pb-1">
            <input
              type="checkbox"
              id="createInitialTaskCheck"
              checked={createInitialTask}
              onChange={(e) => setCreateInitialTask(e.target.checked)}
              className="size-4 rounded border-input text-primary focus:ring-primary"
            />
            <label htmlFor="createInitialTaskCheck" className="text-xs font-medium text-foreground cursor-pointer">
              Buat Task pengerjaan otomatis di kolom <span className="font-semibold text-primary">To Do</span> Kanban
            </label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={handleSubmit} disabled={mutation.isPending}>
            {mutation.isPending ? 'Mengonversi...' : 'Buat Story & Mulai Pengerjaan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── 4b. CONVERT TO EPIC DIALOG ──────────────────────────────────────────────
export function ConvertToEpicDialog({
  request,
  open,
  onOpenChange,
}: {
  request: RequestDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: divisions = [] } = useDivisions();
  const [title, setTitle] = useState(request.title);
  const [description, setDescription] = useState<string>(
    typeof request.brief?.deskripsi === 'string' ? request.brief.deskripsi : ''
  );
  const [scope, setScope] = useState<'CROSS' | 'DIVISION'>('CROSS');
  const [participatingDivisionIds, setParticipatingDivisionIds] = useState<string[]>([
    request.fromDivisionId,
    request.toDivisionId,
  ]);
  const [prokerTag, setProkerTag] = useState('');
  const [targetDate, setTargetDate] = useState(
    request.deadline ? request.deadline.split('T')[0] : ''
  );
  const [createInitialStory, setCreateInitialStory] = useState(true);
  const mutation = useConvertToEpic(request.id);

  const toggleDivision = (divId: string) => {
    if (participatingDivisionIds.includes(divId)) {
      setParticipatingDivisionIds(participatingDivisionIds.filter((id) => id !== divId));
    } else {
      setParticipatingDivisionIds([...participatingDivisionIds, divId]);
    }
  };

  const handleSubmit = async () => {
    if (scope === 'CROSS' && participatingDivisionIds.length < 2) {
      toast.error('Pilih minimal 2 divisi untuk inisiatif lintas divisi');
      return;
    }

    await mutation.mutateAsync({
      title: title.trim() || request.title,
      description: description.trim() || undefined,
      scope,
      participatingDivisionIds: scope === 'CROSS' ? participatingDivisionIds : undefined,
      prokerTag: prokerTag.trim() || undefined,
      targetDate: targetDate || undefined,
      createInitialStory,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-130 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            Jadikan Inisiatif / Epic di /epics
          </DialogTitle>
          <DialogDescription>
            Tingkatkan permohonan kolaborasi &quot;{request.title}&quot; menjadi Inisiatif Strategis / Epic tingkat program kerja dengan tracking progres multi-story.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Scope Selector */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Tingkat Cakupan (Scope)</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={scope === 'CROSS' ? 'default' : 'outline'}
                size="sm"
                className="justify-start gap-1.5 text-xs h-9"
                onClick={() => setScope('CROSS')}
              >
                <Network className="h-3.5 w-3.5" />
                Lintas Divisi (Multi-divisi)
              </Button>
              <Button
                type="button"
                variant={scope === 'DIVISION' ? 'default' : 'outline'}
                size="sm"
                className="justify-start gap-1.5 text-xs h-9"
                onClick={() => setScope('DIVISION')}
              >
                <Layers className="h-3.5 w-3.5" />
                Internal Satu Divisi
              </Button>
            </div>
            <p className="text-2xs text-muted-foreground">
              {scope === 'CROSS'
                ? `Melibatkan kolaborasi beberapa divisi kerja sekaligus.`
                : `Hanya dikelola secara internal pada divisi yang dituju (${request.toDivisionName}).`}
            </p>
          </div>

          {/* If DIVISION scope: explicit callout that it belongs only to the destination division */}
          {scope === 'DIVISION' && (
            <div className="p-3 rounded-xl border border-border/80 bg-muted/30 space-y-1 text-xs">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <Layers className="size-3.5 text-primary" />
                Divisi Penanggung Jawab
              </span>
              <p className="text-muted-foreground text-2xs">
                Inisiatif / Epic ini akan ditempatkan dan dikelola khusus pada divisi yang dituju:{' '}
                <strong className="text-foreground">{request.toDivisionName}</strong>.
              </p>
            </div>
          )}

          {/* If CROSS scope: Checklist of participating divisions */}
          {scope === 'CROSS' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold flex items-center gap-1.5">
                  <Network className="size-3.5 text-indigo-500" />
                  Daftar Divisi yang Berpartisipasi
                </Label>
                <span className="text-3xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
                  {participatingDivisionIds.length} divisi dipilih
                </span>
              </div>
              <p className="text-2xs text-muted-foreground">
                Centang divisi mana saja yang terlibat dalam inisiatif lintas divisi ini:
              </p>
              <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl border border-border/80 bg-muted/20 max-h-48 overflow-y-auto">
                {divisions.map((div) => {
                  const isChecked = participatingDivisionIds.includes(div.id);
                  const isTarget = div.id === request.toDivisionId;
                  const isOrigin = div.id === request.fromDivisionId;

                  return (
                    <label
                      key={div.id}
                      className="flex items-center gap-2 text-xs font-medium cursor-pointer p-1.5 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleDivision(div.id)}
                        className="size-3.5 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="truncate">
                        {div.name}
                        {isTarget && ' (Tujuan)'}
                        {isOrigin && ' (Pemohon)'}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="epicTitle">Judul Inisiatif / Epic</Label>
            <Input
              id="epicTitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="epicDescription">Deskripsi &amp; Sasaran Inisiatif</Label>
            <NotionEditor
              value={description}
              onChange={setDescription}
              placeholder="Jelaskan tujuan dan sasaran besar inisiatif ini... (Ketik '/' untuk opsi format blok)"
              minHeight="min-h-[140px]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Target Date */}
            <div className="space-y-1.5">
              <Label htmlFor="epicTargetDate">Target Selesai</Label>
              <DatePicker
                id="epicTargetDate"
                value={targetDate}
                onChange={(v) => setTargetDate(v || '')}
              />
            </div>

            {/* Proker Tag */}
            <div className="space-y-1.5">
              <Label htmlFor="epicProkerTag">Tag Proker (Opsional)</Label>
              <Input
                id="epicProkerTag"
                placeholder="Misal: EXPO, KKN"
                value={prokerTag}
                onChange={(e) => setProkerTag(e.target.value)}
              />
            </div>
          </div>

          {/* Initial Story Checkbox */}
          <div className="flex items-center gap-2 pt-1 border-t">
            <input
              type="checkbox"
              id="createInitialStoryCheck"
              checked={createInitialStory}
              onChange={(e) => setCreateInitialStory(e.target.checked)}
              className="size-4 rounded border-input text-primary focus:ring-primary"
            />
            <label htmlFor="createInitialStoryCheck" className="text-xs font-medium text-foreground cursor-pointer">
              Buat Deliverable Story &amp; Task awal secara otomatis di Kanban
            </label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={mutation.isPending}
            className="gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Target className="size-3.5" />
            {mutation.isPending ? 'Mengonversi...' : 'Buat Inisiatif / Epic'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── 5. DELIVER DIALOG ───────────────────────────────────────────────────────
export function DeliverDialog({
  request,
  open,
  onOpenChange,
}: {
  request: RequestDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [attachments, setAttachments] = useState<{ title: string; url: string }[]>([
    { title: '', url: '' },
  ]);
  const mutation = useDeliverRequest(request.id);

  const handleAddAttachment = () => {
    setAttachments([...attachments, { title: '', url: '' }]);
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleAttachmentChange = (
    index: number,
    field: 'title' | 'url',
    val: string
  ) => {
    const updated = [...attachments];
    updated[index][field] = val;
    setAttachments(updated);
  };

  const handleSubmit = async () => {
    if (!deliveryNotes.trim()) {
      toast.error('Catatan pengiriman hasil wajib diisi');
      return;
    }

    const validAttachments = attachments.filter(
      (a) => a.title.trim() && a.url.trim()
    );

    if (validAttachments.length === 0) {
      toast.error('Minimal harus ada 1 lampiran hasil kerja');
      return;
    }

    await mutation.mutateAsync({
      deliveryNotes: deliveryNotes.trim(),
      deliveryAttachments: validAttachments,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-130">
        <DialogHeader>
          <DialogTitle>Kirim Hasil Pengerjaan</DialogTitle>
          <DialogDescription>
            Kirim berkas, tautan Google Drive, dan catatan penyelesaian hasil kerja kepada {request.requesterName}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="deliveryNotes">Catatan Pengiriman <span className="text-destructive">*</span></Label>
            <Textarea
              id="deliveryNotes"
              rows={3}
              placeholder="Jelaskan hasil pengerjaan atau detail berkas yang dikirim..."
              value={deliveryNotes}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDeliveryNotes(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Tautan / Berkas Hasil <span className="text-destructive">*</span></Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleAddAttachment}
                className="h-7 text-xs gap-1"
              >
                <Plus className="h-3.5 w-3.5" />
                Tambah Tautan
              </Button>
            </div>

            <div className="space-y-2 max-h-50 overflow-y-auto">
              {attachments.map((att, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Input
                    placeholder="Judul (e.g. Poster Final A3)"
                    value={att.title}
                    onChange={(e) =>
                      handleAttachmentChange(idx, 'title', e.target.value)
                    }
                    className="flex-1"
                  />
                  <Input
                    placeholder="https://drive.google.com/..."
                    value={att.url}
                    onChange={(e) =>
                      handleAttachmentChange(idx, 'url', e.target.value)
                    }
                    className="flex-1"
                  />
                  {attachments.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveAttachment(idx)}
                      className="h-8 w-8 text-destructive shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={handleSubmit} disabled={mutation.isPending}>
            {mutation.isPending ? 'Mengirim...' : 'Kirim Hasil Kerja'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── 6. CONFIRM / REVISION DIALOG ────────────────────────────────────────────
export function ConfirmDialog({
  request,
  open,
  onOpenChange,
}: {
  request: RequestDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [action, setAction] = useState<'CONFIRM' | 'REVISION'>('CONFIRM');
  const [reason, setReason] = useState('');
  const mutation = useConfirmRequest(request.id);

  const handleSubmit = async () => {
    if (action === 'REVISION' && !hasMeaningfulContent(reason)) {
      toast.error('Catatan atau alasan revisi wajib dicantumkan');
      return;
    }

    await mutation.mutateAsync({
      action,
      reason: hasMeaningfulContent(reason) ? reason : undefined,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-120">
        <DialogHeader>
          <DialogTitle>Konfirmasi Hasil Permohonan</DialogTitle>
          <DialogDescription>
            Tinjau hasil kerja yang dikirimkan oleh {request.toDivisionName}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={action === 'CONFIRM' ? 'default' : 'outline'}
              className="gap-2"
              onClick={() => setAction('CONFIRM')}
            >
              <CheckCircle2 className="h-4 w-4" />
              Setujui & Selesai
            </Button>
            <Button
              type="button"
              variant={action === 'REVISION' ? 'destructive' : 'outline'}
              className="gap-2"
              onClick={() => setAction('REVISION')}
            >
              <XCircle className="h-4 w-4" />
              Ajukan Revisi
            </Button>
          </div>

          {action === 'REVISION' && (
            <div className="space-y-1.5">
              <Label htmlFor="revisionReason">Catatan Revisi <span className="text-destructive">*</span></Label>
              <NotionEditor
                value={reason}
                onChange={setReason}
                placeholder="Jelaskan bagian apa yang perlu diperbaiki atau disesuaikan... (Ketik '/' untuk opsi format blok, bisa sisipkan gambar)"
                minHeight="min-h-[140px]"
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={handleSubmit} disabled={mutation.isPending}>
            {mutation.isPending ? 'Memproses...' : 'Kirim Konfirmasi'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── 7. SUBMIT DRAFT DIALOG ──────────────────────────────────────────────────
export function SubmitDraftDialog({
  request,
  open,
  onOpenChange,
}: {
  request: RequestDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const mutation = useSubmitDraft(request.id);

  const handleSubmit = async () => {
    await mutation.mutateAsync();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-120">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-primary" />
            Ajukan Permohonan Sekarang
          </DialogTitle>
          <DialogDescription>
            Permohonan draft &quot;{request.title}&quot; akan resmi diajukan ke divisi {request.toDivisionName}.
          </DialogDescription>
        </DialogHeader>

        <div className="py-2 text-sm text-muted-foreground space-y-2">
          <p>
            Setelah diajukan, status permohonan akan diproses oleh koordinator atau tim divisi tujuan sesuai alur persetujuan.
          </p>
          <p className="text-xs bg-muted/50 p-2.5 rounded-lg border">
            Pastikan seluruh rincian dan brief permohonan Anda sudah tepat sebelum melanjutkan.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={handleSubmit} disabled={mutation.isPending} className="gap-2">
            <Send className="h-4 w-4" />
            {mutation.isPending ? 'Mengajukan...' : 'Ya, Ajukan Permohonan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── 8b. START REVISION DIALOG ───────────────────────────────────────────────
export function StartRevisionDialog({
  request,
  open,
  onOpenChange,
}: {
  request: RequestDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const mutation = useStartRevision(request.id);

  const handleSubmit = async () => {
    await mutation.mutateAsync();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-120">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5 text-rose-600 dark:text-rose-400" />
            Mulai Pengerjaan Ulang Revisi
          </DialogTitle>
          <DialogDescription>
            Permohonan &quot;{request.title}&quot; akan dikembalikan ke status sedang
            dikerjakan (IN_PROGRESS) berdasarkan catatan revisi dari pemohon.
          </DialogDescription>
        </DialogHeader>

        <div className="py-2 text-sm text-muted-foreground space-y-2">
          <p>
            Task pada Story terkait <strong>tidak dibuka ulang secara otomatis</strong> —
            silakan atur sendiri task mana yang perlu dikerjakan ulang lewat board Kanban
            sebelum atau sesudah ini.
          </p>
          <p className="text-xs bg-muted/50 p-2.5 rounded-lg border">
            Setelah siap, Anda dapat mengirimkan kembali hasil pengerjaan melalui tombol
            &quot;Kirim Hasil Kerja&quot;.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={mutation.isPending}
            className="gap-2 bg-rose-600 hover:bg-rose-700 text-white"
          >
            <RotateCcw className="h-4 w-4" />
            {mutation.isPending ? 'Memproses...' : 'Ya, Mulai Revisi'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── 8. EDIT DRAFT DIALOG ────────────────────────────────────────────────────
export function EditDraftDialog({
  request,
  template,
  open,
  onOpenChange,
}: {
  request: RequestDetail;
  template?: RequestTemplate;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [title, setTitle] = useState(request.title);
  const [deadline, setDeadline] = useState(
    request.deadline ? request.deadline.split('T')[0] : ''
  );
  const [brief, setBrief] = useState<Record<string, unknown>>(request.brief || {});
  const mutation = useUpdateDraft(request.id);

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error('Judul permohonan wajib diisi');
      return;
    }

    await mutation.mutateAsync({
      title: title.trim(),
      deadline: deadline || undefined,
      brief,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-137.5 max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Edit Draft Permohonan
          </DialogTitle>
          <DialogDescription>
            Perbarui rincian atau brief permohonan sebelum resmi diajukan.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="editDraftTitle">Judul Permohonan <span className="text-destructive">*</span></Label>
            <Input
              id="editDraftTitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="editDraftDeadline">Target Deadline (Opsional)</Label>
            <DatePicker
              id="editDraftDeadline"
              value={deadline}
              onChange={(v) => setDeadline(v || '')}
            />
          </div>

          {template?.fields && template.fields.length > 0 ? (
            <div className="space-y-3 pt-2 border-t">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Brief: {template.name}
              </Label>
              <DynamicFormRenderer
                fields={template.fields}
                values={brief}
                onChange={setBrief}
              />
            </div>
          ) : (
            <div className="space-y-1.5 pt-2 border-t">
              <Label htmlFor="editDraftDeskripsi">Deskripsi Kebutuhan Brief</Label>
              <NotionEditor
                value={typeof brief.deskripsi === 'string' ? brief.deskripsi : ''}
                onChange={(html) => setBrief({ ...brief, deskripsi: html })}
                placeholder="Perbarui rincian kebutuhan... (Ketik '/' untuk opsi format blok)"
                minHeight="min-h-[180px]"
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={handleSubmit} disabled={mutation.isPending}>
            {mutation.isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

