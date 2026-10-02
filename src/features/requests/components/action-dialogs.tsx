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
  useDeliverRequest,
  useConfirmRequest,
  useUpdateDraft,
  useSubmitDraft,
} from '../api/use-mutations';
import { DynamicFormRenderer } from './dynamic-form-renderer';
import type { RequestDetail, RequestTemplate } from '../types';
import { Plus, Trash2, CheckCircle2, XCircle, HelpCircle, Sparkles, Send, FileEdit, FileCheck } from 'lucide-react';
import { toast } from 'sonner';

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
      <DialogContent className="sm:max-w-[480px]">
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
      <DialogContent className="sm:max-w-[500px]">
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
  const [brief, setBrief] = useState<Record<string, any>>(request.brief || {});
  const [note, setNote] = useState('');
  const mutation = useRespondInfo(request.id);

  const handleSubmit = async () => {
    await mutation.mutateAsync({ brief, note: note.trim() || undefined });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[85vh] overflow-y-auto">
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
              <Textarea
                id="generalBrief"
                rows={4}
                value={brief.deskripsi || ''}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setBrief({ ...brief, deskripsi: e.target.value })
                }
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
  const [doneCriteria, setDoneCriteria] = useState('');
  const [targetDate, setTargetDate] = useState(
    request.deadline ? request.deadline.split('T')[0] : ''
  );
  const [prokerTag, setProkerTag] = useState('');
  const mutation = useConvertToStory(request.id);

  const handleSubmit = async () => {
    await mutation.mutateAsync({
      title: title.trim() || request.title,
      doneCriteria: doneCriteria.trim() || undefined,
      targetDate: targetDate || undefined,
      prokerTag: prokerTag.trim() || undefined,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
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
            <Input
              id="targetDate"
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
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
      <DialogContent className="sm:max-w-[520px]">
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

            <div className="space-y-2 max-h-[200px] overflow-y-auto">
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
    if (action === 'REVISION' && !reason.trim()) {
      toast.error('Catatan atau alasan revisi wajib dicantumkan');
      return;
    }

    await mutation.mutateAsync({
      action,
      reason: reason.trim() || undefined,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
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
              <Textarea
                id="revisionReason"
                rows={3}
                placeholder="Jelaskan bagian apa yang perlu diperbaiki atau disesuaikan..."
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
      <DialogContent className="sm:max-w-[480px]">
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
  const [brief, setBrief] = useState<Record<string, any>>(request.brief || {});
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
      <DialogContent className="sm:max-w-[550px] max-h-[85vh] overflow-y-auto">
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
            <Input
              id="editDraftDeadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
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
              <Textarea
                id="editDraftDeskripsi"
                rows={4}
                value={brief.deskripsi || ''}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setBrief({ ...brief, deskripsi: e.target.value })
                }
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

