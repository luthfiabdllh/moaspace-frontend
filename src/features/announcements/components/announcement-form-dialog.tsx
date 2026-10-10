'use client';

import * as React from 'react';
import { Loader2, Pin, Calendar, MapPin, Users, AlertCircle, Mail } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { NotionEditor } from '@/components/ui/notion-editor';
import { useDivisions } from '@/features/divisions/api/use-queries';
import { useSubunits } from '@/features/subunits/api/use-queries';
import { useCurrentUser } from '@/features/auth/api/use-queries';
import { useAnnouncementPermissions } from '../api/use-queries';
import {
  useCreateAnnouncement,
  useUpdateAnnouncement,
} from '../api/use-mutations';
import type { Announcement, AnnouncementCategory, AnnouncementTarget, AcademicCluster } from '../types';

interface AnnouncementFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  announcement?: Announcement | null; // If provided, edit mode
}

// Helper to format Date to datetime-local string (YYYY-MM-DDTHH:mm)
function toDateTimeLocal(dateStr: string | null | undefined) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const tzOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
}

export function AnnouncementFormDialog({
  open,
  onOpenChange,
  announcement,
}: AnnouncementFormDialogProps) {
  const { data: divisions = [] } = useDivisions();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 gap-0">
        {/* Radix unmounts this subtree on close, so remounting on reopen
            naturally re-derives form state from `announcement` below —
            no effect needed to sync it. */}
        <AnnouncementFormBody
          key={open ? announcement?.id ?? 'new' : 'closed'}
          announcement={announcement}
          divisions={divisions}
          onOpenChange={onOpenChange}
        />
      </DialogContent>
    </Dialog>
  );
}

interface AnnouncementFormBodyProps {
  announcement?: Announcement | null;
  divisions: Array<{ id: string; name: string }>;
  onOpenChange: (open: boolean) => void;
}

const CLUSTERS: Array<{ value: AcademicCluster; label: string }> = [
  { value: 'SAINTEK', label: 'Sains & Teknologi (Saintek)' },
  { value: 'SOSHUM', label: 'Sosial Humaniora (Soshum)' },
  { value: 'MEDIKA', label: 'Kesehatan / Medika' },
  { value: 'AGRO', label: 'Pertanian / Agro' },
];

function AnnouncementFormBody({
  announcement,
  divisions,
  onOpenChange,
}: AnnouncementFormBodyProps) {
  const isEdit = Boolean(announcement);

  const { data: user } = useCurrentUser();
  const { data: permissions } = useAnnouncementPermissions();
  const { data: subunits = [] } = useSubunits();

  const isGlobalManager = Boolean(
    user?.isSuperAdmin || user?.isKormanit || permissions?.isGlobalManager
  );
  const coordinatedDivisionIds = permissions?.coordinatedDivisionIds ?? [];
  const coordinatedSubunitIds = permissions?.coordinatedSubunitIds ?? [];
  const isClusterCoordinator = Boolean(permissions?.isClusterCoordinator);
  const coordinatedCluster = permissions?.coordinatedCluster as AcademicCluster | null | undefined;

  const selectableDivisions = isGlobalManager
    ? divisions
    : divisions.filter((d) => coordinatedDivisionIds.includes(d.id));

  const selectableSubunits = isGlobalManager
    ? subunits
    : subunits.filter((s) => coordinatedSubunitIds.includes(s.id));

  const selectableClusters = isGlobalManager
    ? CLUSTERS
    : CLUSTERS.filter((c) => c.value === coordinatedCluster);

  const createMutation = useCreateAnnouncement();
  const updateMutation = useUpdateAnnouncement();

  const [title, setTitle] = React.useState(announcement?.title ?? '');
  const [contentHtml, setContentHtml] = React.useState(() => {
    const content = announcement?.content;
    return typeof content === 'object' && content !== null
      ? (content.html as string) || ''
      : '';
  });
  const [category, setCategory] = React.useState<AnnouncementCategory>(
    announcement?.category ?? 'INFO'
  );
  const [targetType, setTargetType] = React.useState<AnnouncementTarget>(() => {
    if (announcement?.targetType) return announcement.targetType;
    if (isGlobalManager) return 'ALL';
    if (coordinatedDivisionIds.length > 0) return 'DIVISION';
    if (coordinatedSubunitIds.length > 0) return 'SUBUNIT';
    if (isClusterCoordinator) return 'CLUSTER';
    return 'ALL';
  });
  const [targetDivisionId, setTargetDivisionId] = React.useState<string>(() => {
    if (announcement?.targetDivisionId) return announcement.targetDivisionId;
    if (!isGlobalManager && selectableDivisions.length > 0) {
      return selectableDivisions[0].id;
    }
    return '';
  });
  const [targetSubunitId, setTargetSubunitId] = React.useState<string>(() => {
    if (announcement?.targetSubunitId) return announcement.targetSubunitId;
    if (!isGlobalManager && selectableSubunits.length > 0) {
      return selectableSubunits[0].id;
    }
    return '';
  });
  const [targetCluster, setTargetCluster] = React.useState<AcademicCluster | ''>(() => {
    if (announcement?.targetCluster) return announcement.targetCluster;
    if (!isGlobalManager && coordinatedCluster) {
      return coordinatedCluster;
    }
    return '';
  });
  const [isPinned, setIsPinned] = React.useState(announcement?.isPinned ?? false);
  const [sendEmail, setSendEmail] = React.useState(!isEdit);

  // Agenda / schedule
  const [hasEventSchedule, setHasEventSchedule] = React.useState(
    Boolean(announcement?.eventStartDate)
  );
  const [eventStartDate, setEventStartDate] = React.useState(() =>
    toDateTimeLocal(announcement?.eventStartDate)
  );
  const [eventEndDate, setEventEndDate] = React.useState(() =>
    toDateTimeLocal(announcement?.eventEndDate)
  );
  const [location, setLocation] = React.useState(announcement?.location || '');

  const [validationError, setValidationError] = React.useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!title.trim()) {
      setValidationError('Judul pengumuman wajib diisi.');
      return;
    }

    if (!contentHtml.trim() || contentHtml === '<p></p>') {
      setValidationError('Konten pengumuman wajib diisi.');
      return;
    }

    if (targetType === 'DIVISION' && !targetDivisionId) {
      setValidationError('Silakan pilih divisi target penerima pengumuman.');
      return;
    }

    if (targetType === 'SUBUNIT' && !targetSubunitId) {
      setValidationError('Silakan pilih posko / subunit target penerima pengumuman.');
      return;
    }

    if (targetType === 'CLUSTER' && !targetCluster) {
      setValidationError('Silakan pilih klaster target penerima pengumuman.');
      return;
    }

    if (hasEventSchedule && !eventStartDate) {
      setValidationError('Waktu mulai agenda wajib ditentukan.');
      return;
    }

    if (hasEventSchedule && eventStartDate && eventEndDate) {
      if (new Date(eventEndDate) < new Date(eventStartDate)) {
        setValidationError('Waktu selesai agenda tidak boleh lebih awal dari waktu mulai.');
        return;
      }
    }

    const payload = {
      title: title.trim(),
      content: { html: contentHtml },
      category,
      targetType,
      targetDivisionId: targetType === 'DIVISION' ? targetDivisionId : undefined,
      targetSubunitId: targetType === 'SUBUNIT' ? targetSubunitId : undefined,
      targetCluster: targetType === 'CLUSTER' && targetCluster ? targetCluster : undefined,
      isPinned,
      eventStartDate: hasEventSchedule && eventStartDate ? new Date(eventStartDate).toISOString() : undefined,
      eventEndDate: hasEventSchedule && eventEndDate ? new Date(eventEndDate).toISOString() : undefined,
      location: hasEventSchedule && location.trim() ? location.trim() : undefined,
      sendEmail,
    };

    if (isEdit && announcement) {
      updateMutation.mutate(
        { id: announcement.id, dto: payload },
        {
          onSuccess: () => {
            onOpenChange(false);
          },
        }
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          onOpenChange(false);
        },
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader className="p-6 pb-4 border-b border-border/60">
        <DialogTitle className="text-lg font-bold">
          {isEdit ? 'Edit Pengumuman' : 'Buat Pengumuman Baru'}
        </DialogTitle>
        <p className="text-xs text-muted-foreground mt-0.5">
          Bagikan pengumuman atau agendakan kegiatan penting bersama seluruh tim KKN.
        </p>
      </DialogHeader>

      <div className="p-6 space-y-5 text-xs">
        {validationError && (
          <div className="p-3 rounded-lg bg-destructive/10 text-destructive border border-destructive/20 flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Title */}
        <div className="space-y-1.5">
          <Label htmlFor="announcement-title" className="text-xs font-semibold">
            Judul Pengumuman <span className="text-destructive">*</span>
          </Label>
          <Input
            id="announcement-title"
            placeholder="Contoh: Briefing Program Kerja Mingguan Tim KKN"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isPending}
            className="text-xs font-medium"
          />
        </div>

        {/* Category & Target Audience Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Category */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Kategori Pengumuman</Label>
            <Select
              value={category}
              onValueChange={(val: AnnouncementCategory) => setCategory(val)}
              disabled={isPending}
            >
              <SelectTrigger className="w-full text-xs">
                <SelectValue placeholder="Pilih Kategori" />
              </SelectTrigger>
              <SelectContent className="text-xs">
                <SelectItem value="INFO">Informasi Umum</SelectItem>
                <SelectItem value="MEETING">Rapat / Briefing</SelectItem>
                <SelectItem value="ACTIVITY">Kegiatan Lapangan</SelectItem>
                <SelectItem value="URGENT">Penting / Mendesak</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Target Audience */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Target Penerima</Label>
            <Select
              value={targetType}
              onValueChange={(val: AnnouncementTarget) => setTargetType(val)}
              disabled={isPending}
            >
              <SelectTrigger className="w-full text-xs">
                <SelectValue placeholder="Pilih Target Penerima" />
              </SelectTrigger>
              <SelectContent className="text-xs">
                {isGlobalManager && (
                  <SelectItem value="ALL">Semua Tim KKN (Publik)</SelectItem>
                )}
                {(isGlobalManager || coordinatedDivisionIds.length > 0) && (
                  <SelectItem value="DIVISION">
                    {isGlobalManager ? 'Divisi Tertentu' : 'Divisi Anda (Koordinator)'}
                  </SelectItem>
                )}
                {(isGlobalManager || coordinatedSubunitIds.length > 0) && (
                  <SelectItem value="SUBUNIT">
                    {isGlobalManager ? 'Posko / Subunit Tertentu' : 'Posko / Subunit Anda (Kormasit)'}
                  </SelectItem>
                )}
                {(isGlobalManager || isClusterCoordinator) && (
                  <SelectItem value="CLUSTER">
                    {isGlobalManager ? 'Klaster Tertentu' : `Klaster ${coordinatedCluster || ''} (Kormater)`}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {!isGlobalManager && (
              <p className="text-[11px] text-muted-foreground">
                Pilihan target pengumuman disesuaikan dengan tanggung jawab koordinasi Anda.
              </p>
            )}
          </div>
        </div>

        {/* Target Division Select (if DIVISION) */}
        {targetType === 'DIVISION' && (
          <div className="space-y-1.5 bg-muted/20 p-3 rounded-lg border border-border/60">
            <Label className="text-xs font-semibold flex items-center gap-1.5">
              <Users className="size-3.5 text-primary" />
              Pilih Divisi Target <span className="text-destructive">*</span>
            </Label>
            <Select
              value={targetDivisionId}
              onValueChange={setTargetDivisionId}
              disabled={isPending || (!isGlobalManager && selectableDivisions.length <= 1)}
            >
              <SelectTrigger className="w-full text-xs">
                <SelectValue placeholder="Pilih Divisi" />
              </SelectTrigger>
              <SelectContent className="text-xs">
                {selectableDivisions.map((div) => (
                  <SelectItem key={div.id} value={div.id}>
                    {div.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Target Subunit Select (if SUBUNIT) */}
        {targetType === 'SUBUNIT' && (
          <div className="space-y-1.5 bg-muted/20 p-3 rounded-lg border border-border/60">
            <Label className="text-xs font-semibold flex items-center gap-1.5">
              <Users className="size-3.5 text-primary" />
              Pilih Posko / Subunit Target <span className="text-destructive">*</span>
            </Label>
            <Select
              value={targetSubunitId}
              onValueChange={setTargetSubunitId}
              disabled={isPending || (!isGlobalManager && selectableSubunits.length <= 1)}
            >
              <SelectTrigger className="w-full text-xs">
                <SelectValue placeholder="Pilih Posko / Subunit" />
              </SelectTrigger>
              <SelectContent className="text-xs">
                {selectableSubunits.map((sub) => (
                  <SelectItem key={sub.id} value={sub.id}>
                    {sub.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Target Cluster Select (if CLUSTER) */}
        {targetType === 'CLUSTER' && (
          <div className="space-y-1.5 bg-muted/20 p-3 rounded-lg border border-border/60">
            <Label className="text-xs font-semibold flex items-center gap-1.5">
              <Users className="size-3.5 text-primary" />
              Pilih Klaster Target <span className="text-destructive">*</span>
            </Label>
            <Select
              value={targetCluster}
              onValueChange={(val: AcademicCluster) => setTargetCluster(val)}
              disabled={isPending || (!isGlobalManager && selectableClusters.length <= 1)}
            >
              <SelectTrigger className="w-full text-xs">
                <SelectValue placeholder="Pilih Klaster" />
              </SelectTrigger>
              <SelectContent className="text-xs">
                {selectableClusters.map((cls) => (
                  <SelectItem key={cls.value} value={cls.value}>
                    {cls.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Pin Switch */}
        <div className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-card/60">
          <div className="space-y-0.5">
            <Label htmlFor="pin-switch" className="text-xs font-semibold flex items-center gap-1.5 cursor-pointer">
              <Pin className="size-3.5 text-amber-500" />
              Sematkan Pengumuman (Pin)
            </Label>
            <p className="text-[11px] text-muted-foreground">
              Pengumuman yang disematkan akan selalu berada di urutan teratas.
            </p>
          </div>
          <Switch
            id="pin-switch"
            checked={isPinned}
            onCheckedChange={setIsPinned}
            disabled={isPending}
          />
        </div>

        {/* Email Notification Switch */}
        <div className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-card/60">
          <div className="space-y-0.5">
            <Label htmlFor="email-switch" className="text-xs font-semibold flex items-center gap-1.5 cursor-pointer">
              <Mail className="size-3.5 text-primary" />
              Kirim Notifikasi Email
            </Label>
            <p className="text-[11px] text-muted-foreground">
              {isEdit
                ? 'Kirim notifikasi email pembaruan ke anggota target pengumuman.'
                : 'Kirim notifikasi email pengumuman langsung ke anggota target pengumuman.'}
            </p>
          </div>
          <Switch
            id="email-switch"
            checked={sendEmail}
            onCheckedChange={setSendEmail}
            disabled={isPending}
          />
        </div>

        {/* Agenda / Google Calendar Schedule Toggle */}
        <div className="rounded-lg border border-border/60 bg-card/60 overflow-hidden">
          <div className="flex items-center justify-between p-3 bg-muted/15 border-b border-border/40">
            <div className="space-y-0.5">
              <Label htmlFor="schedule-switch" className="text-xs font-semibold flex items-center gap-1.5 cursor-pointer">
                <Calendar className="size-3.5 text-blue-500" />
                Sertakan Jadwal Kegiatan &amp; Sinkronkan ke Google Calendar
              </Label>
              <p className="text-[11px] text-muted-foreground">
                Otomatis membuat jadwal di kalender Google <em>&ldquo;MoaSpace - Tim KKN&rdquo;</em> seluruh target penerima.
              </p>
            </div>
            <Switch
              id="schedule-switch"
              checked={hasEventSchedule}
              onCheckedChange={setHasEventSchedule}
              disabled={isPending}
            />
          </div>

          {hasEventSchedule && (
            <div className="p-3.5 space-y-3 bg-muted/5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="start-date" className="text-xs font-medium">
                    Waktu Mulai <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="start-date"
                    type="datetime-local"
                    value={eventStartDate}
                    onChange={(e) => setEventStartDate(e.target.value)}
                    disabled={isPending}
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="end-date" className="text-xs font-medium">
                    Waktu Selesai (Opsional)
                  </Label>
                  <Input
                    id="end-date"
                    type="datetime-local"
                    value={eventEndDate}
                    onChange={(e) => setEventEndDate(e.target.value)}
                    disabled={isPending}
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="location" className="text-xs font-medium flex items-center gap-1">
                  <MapPin className="size-3 text-destructive" />
                  Lokasi atau Tautan Pertemuan (Opsional)
                </Label>
                <Input
                  id="location"
                  placeholder="Contoh: Posko Utama KKN atau link https://meet.google.com/..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  disabled={isPending}
                  className="text-xs"
                />
              </div>
            </div>
          )}
        </div>

        {/* Rich Text Editor */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">
            Isi Pengumuman <span className="text-destructive">*</span>
          </Label>
          <div className="rounded-xl border border-border/80 overflow-hidden bg-background">
            <NotionEditor
              value={contentHtml}
              onChange={setContentHtml}
              placeholder="Ketik isi pengumuman lengkap di sini... (ketik '/' untuk opsi format atau tempel gambar)"
              minHeight="220px"
              readOnly={isPending}
            />
          </div>
        </div>
      </div>

      <DialogFooter className="p-4 px-6 border-t border-border/60 bg-muted/10 gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => onOpenChange(false)}
          disabled={isPending}
          size="sm"
        >
          Batal
        </Button>
        <Button
          type="submit"
          disabled={isPending}
          size="sm"
          className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {isPending && <Loader2 className="size-3.5 animate-spin" />}
          {isPending ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Terbitkan Pengumuman'}
        </Button>
      </DialogFooter>
    </form>
  );
}
