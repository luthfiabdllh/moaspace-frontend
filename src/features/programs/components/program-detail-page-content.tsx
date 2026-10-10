'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowLeft,
  Briefcase,
  Calendar as CalendarIcon,
  Clock,
  Edit,
  Layers,
  MoreVertical,
  Plus,
  Save,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserPlus,
  Users,
  X,
  XCircle,
  FolderKanban,
  Target,
} from 'lucide-react';
import {
  useProgramDetail,
} from '../api/use-queries';
import {
  useUpdateProgram,
  useDeleteProgram,
  useAddProgramMember,
  useRemoveProgramMember,
} from '../api/use-mutations';
import { useCurrentUser } from '@/features/auth/api/use-queries';
import { useSubunits } from '@/features/subunits/api/use-queries';
import { useUsers } from '@/features/users/api/use-queries';
import {
  updateProgramSchema,
  type UpdateProgramDTO,
  type ProgramStatus,
  type ProgramScope,
  type ProgramCluster,
} from '../types';
import {
  ProgramStatusBadge,
  ProgramScopeBadge,
  ProgramClusterBadge,
  DualApprovalStatusBadge,
} from './program-status-badge';
import { ReviewProgramDialog } from './review-program-dialog';
import { CreateEpicDialog } from '@/features/epics/components/create-epic-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ProgramDetailPageContentProps {
  programId: string;
}

export function ProgramDetailPageContent({ programId }: ProgramDetailPageContentProps) {
  const router = useRouter();
  const { data: program, isLoading, isError } = useProgramDetail(programId);
  const { data: currentUser } = useCurrentUser();
  const { data: subunits = [] } = useSubunits();
  const { data: allUsers = [] } = useUsers();

  const activeUsers = allUsers.filter((u) => u.status === 'ACTIVE');

  const updateMutation = useUpdateProgram();
  const deleteMutation = useDeleteProgram();
  const addMemberMutation = useAddProgramMember();
  const removeMemberMutation = useRemoveProgramMember();

  const [isEditMode, setIsEditMode] = useState(false);
  const [isCreateEpicOpen, setIsCreateEpicOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [reviewType, setReviewType] = useState<'CLUSTER' | 'GOVERNANCE'>('CLUSTER');

  // Modal Tambah Anggota Tim
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedMemberRole, setSelectedMemberRole] = useState<'CO_PIC' | 'MEMBER'>('MEMBER');

  // Form Edit
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { isSubmitting },
  } = useForm<UpdateProgramDTO>({
    resolver: zodResolver(updateProgramSchema),
  });

  const editScope = useWatch({ control, name: 'scope' });
  const editCluster = useWatch({ control, name: 'cluster' });
  const editSubunitId = useWatch({ control, name: 'subunitId' });
  const editPicId = useWatch({ control, name: 'primaryPicId' });
  const editStatus = useWatch({ control, name: 'status' });
  const editStartDate = useWatch({ control, name: 'startDate' });
  const editEndDate = useWatch({ control, name: 'endDate' });

  // Sinkronisasi data form saat program selesai di-fetch atau saat edit mode diaktifkan
  useEffect(() => {
    if (program) {
      reset({
        title: program.title,
        description: program.description || '',
        scope: program.scope,
        subunitId: program.subunitId || '',
        cluster: program.cluster,
        primaryPicId: program.primaryPicId,
        status: program.status,
        startDate: program.startDate ? program.startDate.split('T')[0] : '',
        endDate: program.endDate ? program.endDate.split('T')[0] : '',
      });
    }
  }, [program, reset]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3 text-muted-foreground p-6">
        <div className="size-9 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <p className="text-sm font-medium">Memuat detail program kerja...</p>
      </div>
    );
  }

  if (isError || !program) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 p-6 text-center">
        <div className="size-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
          <XCircle className="size-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-foreground">Program Kerja Tidak Ditemukan</h2>
          <p className="text-sm text-muted-foreground max-w-md">
            Program kerja yang Anda cari mungkin telah dihapus atau URL tidak valid.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/programs">
            <ArrowLeft className="size-4 mr-2" />
            Kembali ke Daftar Program
          </Link>
        </Button>
      </div>
    );
  }

  const isPicOrAdmin =
    Boolean(currentUser?.isSuperAdmin) ||
    program.primaryPicId === currentUser?.id ||
    program.members?.some((m) => m.userId === currentUser?.id && m.role === 'CO_PIC');

  // Hak review Kormater
  const canReviewCluster =
    Boolean(currentUser?.isSuperAdmin) ||
    (Boolean(currentUser?.isClusterCoordinator) &&
      (currentUser?.cluster === program.cluster || program.cluster === 'UNIT_SHARED'));

  // Hak review Kormasit / Kormanit
  const canReviewGovernance =
    Boolean(currentUser?.isSuperAdmin) ||
    (program.scope === 'SUBUNIT' &&
      currentUser?.subunits?.some(
        (s) => s.subunitId === program.subunitId && s.role === 'COORDINATOR',
      ));

  const existingMemberIds = new Set([
    program.primaryPicId,
    ...(program.members?.map((m) => m.userId) || []),
  ]);

  const availableUsersForMember = activeUsers.filter(
    (u) => !existingMemberIds.has(u.id),
  );

  const handleSaveEdit = async (data: UpdateProgramDTO) => {
    try {
      await updateMutation.mutateAsync({
        id: program.id,
        payload: {
          ...data,
          subunitId: data.scope === 'SUBUNIT' ? data.subunitId : undefined,
        },
      });
      setIsEditMode(false);
    } catch {
      // handled in mutation
    }
  };

  const handleDelete = async () => {
    if (confirm(`Apakah Anda yakin ingin menghapus program "${program.title}"?`)) {
      try {
        await deleteMutation.mutateAsync(program.id);
        router.push('/programs');
      } catch {
        // handled in mutation
      }
    }
  };

  const handleAddMember = async () => {
    if (!selectedUserId) return;
    try {
      await addMemberMutation.mutateAsync({
        programId: program.id,
        userId: selectedUserId,
        role: selectedMemberRole,
      });
      setSelectedUserId('');
      setIsAddMemberOpen(false);
    } catch {
      // handled
    }
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      await removeMemberMutation.mutateAsync({
        programId: program.id,
        userId,
      });
    } catch {
      // handled
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 mx-auto w-full max-w-6xl">
      {/* ─── Breadcrumb / Navigasi Atas ───────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4">
        <Button asChild variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground">
          <Link href="/programs">
            <ArrowLeft className="size-4" />
            <span>Kembali ke Program Kerja</span>
          </Link>
        </Button>

        <div className="flex items-center gap-2">
          {isPicOrAdmin && !isEditMode && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditMode(true)}
              className="gap-1.5"
            >
              <Edit className="size-3.5" />
              <span>Edit Program</span>
            </Button>
          )}

          {isPicOrAdmin && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8">
                  <MoreVertical className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={handleDelete}
                >
                  <Trash2 className="size-4 mr-2" />
                  Hapus Program
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* ─── Card Header Utama Program ────────────────────────────────────────── */}
      <Card className="border-border/80 shadow-xs overflow-hidden">
        <div className="p-6 md:p-8 space-y-6">
          {/* Header Baris 1: Badges & Aksi Review */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <ProgramStatusBadge status={program.status} />
              <ProgramScopeBadge
                scope={program.scope}
                subunitName={program.subunit?.name}
              />
              <ProgramClusterBadge cluster={program.cluster} />
            </div>

            {/* Tombol aksi review jika berwenang */}
            <div className="flex items-center gap-2">
              {canReviewCluster && program.clusterApprovalStatus === 'PENDING' && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs gap-1.5 border-indigo-500/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-500/10"
                  onClick={() => {
                    setReviewType('CLUSTER');
                    setIsReviewOpen(true);
                  }}
                >
                  <Sparkles className="size-3.5" />
                  Review Kormater
                </Button>
              )}
              {canReviewGovernance && program.governanceApprovalStatus === 'PENDING' && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs gap-1.5 border-emerald-500/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10"
                  onClick={() => {
                    setReviewType('GOVERNANCE');
                    setIsReviewOpen(true);
                  }}
                >
                  <ShieldCheck className="size-3.5" />
                  Review Tata Kelola
                </Button>
              )}
            </div>
          </div>

          {/* Konten Utama: Mode Baca vs Mode Edit Inline */}
          {isEditMode ? (
            <form onSubmit={handleSubmit(handleSaveEdit)} className="space-y-6 pt-2 border-t">
              <div className="flex items-center justify-between pb-2 border-b">
                <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                  <Edit className="size-4" />
                  <span>Mode Edit Program Kerja</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditMode(false)}
                    className="gap-1 text-xs"
                  >
                    <X className="size-3.5" />
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isSubmitting}
                    className="gap-1.5 text-xs shadow-xs"
                  >
                    <Save className="size-3.5" />
                    Simpan Perubahan
                  </Button>
                </div>
              </div>

              {/* Input Judul */}
              <div className="space-y-1.5">
                <Label htmlFor="edit-title">Judul Program Kerja</Label>
                <Input id="edit-title" {...register('title')} />
              </div>

              {/* Input Deskripsi */}
              <div className="space-y-1.5">
                <Label htmlFor="edit-desc">Deskripsi & Ruang Lingkup Program</Label>
                <Textarea
                  id="edit-desc"
                  rows={4}
                  placeholder="Jelaskan tujuan makro, target luaran, dan sasaran..."
                  {...register('description')}
                />
              </div>

              {/* Grid Scope & Subunit */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Lingkup Pelaksanaan</Label>
                  <Select
                    value={editScope}
                    onValueChange={(val: ProgramScope) => setValue('scope', val)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SUBUNIT">Tingkat Subunit (Posko Dusun)</SelectItem>
                      <SelectItem value="UNIT">Tingkat Unit (Seluruh KKN)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {editScope === 'SUBUNIT' ? (
                  <div className="space-y-1.5">
                    <Label>Subunit Posko Dusun</Label>
                    <Select
                      value={editSubunitId || undefined}
                      onValueChange={(val) => setValue('subunitId', val)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih subunit posko" />
                      </SelectTrigger>
                      <SelectContent>
                        {subunits.map((sub) => (
                          <SelectItem key={sub.id} value={sub.id}>
                            {sub.name} {sub.location ? `(${sub.location})` : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <Label className="text-muted-foreground">Posko Dusun</Label>
                    <Input disabled value="Berlaku lintas unit KKN" className="bg-muted text-xs" />
                  </div>
                )}
              </div>

              {/* Grid Klaster, PIC, Status */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label>Rumpun Klaster Keilmuan</Label>
                  <Select
                    value={editCluster}
                    onValueChange={(val: ProgramCluster) => setValue('cluster', val)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SAINTEK">🔵 Saintek</SelectItem>
                      <SelectItem value="SOSHUM">🟢 Soshum</SelectItem>
                      <SelectItem value="MEDIKA">🔴 Medika</SelectItem>
                      <SelectItem value="AGRO">🟡 Agro</SelectItem>
                      <SelectItem value="UNIT_SHARED">🟣 Lintas Klaster</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label>PIC Utama</Label>
                  <Select
                    value={editPicId || undefined}
                    onValueChange={(val) => setValue('primaryPicId', val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih PIC" />
                    </SelectTrigger>
                    <SelectContent>
                      {activeUsers.map((u) => {
                        const metaParts: string[] = [];
                        if (u.cluster) metaParts.push(u.cluster);
                        if (u.subunit?.name) metaParts.push(u.subunit.name);
                        const metaText = metaParts.length > 0 ? ` (${metaParts.join(' • ')})` : '';
                        return (
                          <SelectItem key={u.id} value={u.id}>
                            {u.name}{metaText}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label>Status Siklus</Label>
                  <Select
                    value={editStatus}
                    onValueChange={(val: ProgramStatus) => setValue('status', val)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PROPOSED">Usulan (Proposed)</SelectItem>
                      <SelectItem value="ACTIVE">Aktif (Active)</SelectItem>
                      <SelectItem value="COMPLETED">Selesai (Completed)</SelectItem>
                      <SelectItem value="CANCELLED">Dibatalkan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Tanggal Pelaksanaan */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5">
                    <CalendarIcon className="size-3.5 text-muted-foreground" />
                    Tanggal Mulai
                  </Label>
                  <DatePicker
                    value={editStartDate || undefined}
                    onChange={(val) => setValue('startDate', val || '')}
                    placeholder="Pilih tanggal mulai"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5">
                    <CalendarIcon className="size-3.5 text-muted-foreground" />
                    Target Selesai
                  </Label>
                  <DatePicker
                    value={editEndDate || undefined}
                    onChange={(val) => setValue('endDate', val || '')}
                    placeholder="Pilih target selesai"
                  />
                </div>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground leading-tight">
                  {program.title}
                </h1>
                {program.description ? (
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed whitespace-pre-line">
                    {program.description}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground italic mt-2">
                    Belum ada deskripsi yang ditambahkan untuk program kerja ini.
                  </p>
                )}
              </div>

              {/* Timeline tanggal & Subunit */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
                {(program.startDate || program.endDate) && (
                  <div className="flex items-center gap-1.5 bg-muted/50 px-2.5 py-1 rounded-md">
                    <CalendarIcon className="size-3.5 text-primary" />
                    <span>
                      {program.startDate
                        ? new Date(program.startDate).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : 'Mulai belum ditentukan'}{' '}
                      —{' '}
                      {program.endDate
                        ? new Date(program.endDate).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : 'Selesai belum ditentukan'}
                    </span>
                  </div>
                )}

                {program.subunit && (
                  <div className="flex items-center gap-1.5 bg-muted/50 px-2.5 py-1 rounded-md">
                    <Briefcase className="size-3.5 text-primary" />
                    <span>
                      Posko: <strong>{program.subunit.name}</strong>{' '}
                      {program.subunit.location && `(${program.subunit.location})`}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Ringkasan Status Approval & Progres */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            {/* Status Persetujuan Paralel */}
            <div className="p-4 rounded-xl bg-muted/30 border border-border/60 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="size-4 text-primary" />
                  Status Persetujuan Paralel
                </span>
                <DualApprovalStatusBadge
                  clusterStatus={program.clusterApprovalStatus}
                  governanceStatus={program.governanceApprovalStatus}
                  scope={program.scope}
                />
              </div>

              <div className="space-y-1.5 text-xs text-muted-foreground pt-1">
                <div className="flex items-center justify-between">
                  <span>Aspek Keilmuan (Kormater):</span>
                  <span className="font-medium text-foreground">
                    {program.clusterApprovalStatus === 'APPROVED'
                      ? `Disetujui ${program.clusterApprovedBy?.name ? `oleh ${program.clusterApprovedBy.name}` : ''}`
                      : program.clusterApprovalStatus === 'REJECTED'
                        ? `Ditolak (${program.clusterRejectionReason || 'Ada catatan'})`
                        : 'Menunggu Review'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Tata Kelola ({program.scope === 'UNIT' ? 'Kormanit' : 'Kormasit'}):</span>
                  <span className="font-medium text-foreground">
                    {program.governanceApprovalStatus === 'APPROVED'
                      ? `Disetujui ${program.governanceApprovedBy?.name ? `oleh ${program.governanceApprovedBy.name}` : ''}`
                      : program.governanceApprovalStatus === 'REJECTED'
                        ? `Ditolak (${program.governanceRejectionReason || 'Ada catatan'})`
                        : 'Menunggu Review'}
                  </span>
                </div>
              </div>
            </div>

            {/* Metrik Eksekusi Kanban */}
            <div className="p-4 rounded-xl bg-muted/30 border border-border/60 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <Layers className="size-4 text-primary" />
                  Progres Pelaksanaan
                </span>
                <span className="font-bold text-primary text-sm">
                  {program.metrics.progressPercentage}%
                </span>
              </div>

              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(100, Math.max(0, program.metrics.progressPercentage))}%`,
                  }}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground pt-0.5">
                <span>{program.metrics.totalEpics} Epic Tertaut</span>
                <span>
                  {program.metrics.completedTasks} dari {program.metrics.totalTasks} Task Selesai
                </span>
              </div>
            </div>
          </div>

          {/* Tim Pelaksana (PIC & Members) */}
          <div className="pt-4 border-t space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Users className="size-3.5" />
                <span>Tim Pelaksana Program Kerja</span>
              </h3>

              {isPicOrAdmin && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsAddMemberOpen(true)}
                  className="h-7 text-xs gap-1"
                >
                  <UserPlus className="size-3" />
                  Tambah Anggota
                </Button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* PIC Utama Badge */}
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 px-3 py-1.5 rounded-lg text-xs font-medium">
                <div className="size-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                  {program.primaryPic?.name?.charAt(0) || 'P'}
                </div>
                <span>
                  {program.primaryPic?.name} (<strong>PIC Utama</strong>)
                </span>
              </div>

              {/* Anggota Lainnya */}
              {program.members?.map((m) => (
                <div
                  key={m.id}
                  className="inline-flex items-center gap-2 bg-muted/60 text-foreground border border-border/60 px-3 py-1.5 rounded-lg text-xs"
                >
                  <div className="size-5 rounded-full bg-muted-foreground/20 text-muted-foreground text-[10px] font-semibold flex items-center justify-center">
                    {m.user?.name?.charAt(0) || 'U'}
                  </div>
                  <span>
                    {m.user?.name} •{' '}
                    <span className="text-muted-foreground text-[11px]">
                      {m.role === 'CO_PIC' ? 'Co-PIC' : 'Pelaksana'}
                    </span>
                  </span>
                  {isPicOrAdmin && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(m.userId)}
                      className="text-muted-foreground hover:text-destructive transition-colors ml-1"
                      title="Keluarkan dari tim"
                    >
                      <X className="size-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* ─── Section Epics Program Kerja ───────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <FolderKanban className="size-5 text-primary" />
              <span>Epics Program Kerja</span>
            </h2>
            <p className="text-xs text-muted-foreground">
              Inisiatif taktis yang memayungi User Stories dan Task Kanban dalam pelaksanaan program ini.
            </p>
          </div>

          <Button
            onClick={() => setIsCreateEpicOpen(true)}
            className="gap-2 shrink-0 shadow-xs font-semibold"
          >
            <Plus className="size-4" />
            Tambah Epic Baru
          </Button>
        </div>

        {/* Daftar Kartu Epics */}
        {program.epics && program.epics.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {program.epics.map((epic) => (
              <Card
                key={epic.id}
                className="group border-border/80 hover:border-primary/40 hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden"
              >
                <CardHeader className="p-4 space-y-2 pb-3">
                  <div className="flex items-center justify-between gap-2">
                    <Badge
                      variant="outline"
                      className="bg-primary/5 text-primary border-primary/20 text-[11px]"
                    >
                      {epic.scope === 'DIVISION' ? 'Divisi' : 'Lintas Divisi'}
                    </Badge>
                    {epic.closedAt ? (
                      <Badge
                        variant="outline"
                        className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px]"
                      >
                        Selesai
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[10px]"
                      >
                        Aktif
                      </Badge>
                    )}
                  </div>

                  <CardTitle className="text-base font-bold text-foreground leading-snug line-clamp-2">
                    {epic.title}
                  </CardTitle>

                  {epic.prokerTag && (
                    <span className="text-[11px] font-mono bg-muted text-muted-foreground px-2 py-0.5 rounded w-fit">
                      #{epic.prokerTag}
                    </span>
                  )}

                  {epic.description && (
                    <CardDescription className="text-xs line-clamp-2 leading-relaxed">
                      {epic.description}
                    </CardDescription>
                  )}
                </CardHeader>

                <CardContent className="p-4 pt-0 space-y-3">
                  {epic.ownerDivisionName && (
                    <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Target className="size-3.5 text-primary" />
                      <span>Divisi: <strong>{epic.ownerDivisionName}</strong></span>
                    </div>
                  )}

                  {(epic.startDate || epic.endDate) && (
                    <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Clock className="size-3" />
                      <span>
                        {epic.startDate ? new Date(epic.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : ''}
                        {' - '}
                        {epic.endDate ? new Date(epic.endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : ''}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-dashed p-8 text-center flex flex-col items-center justify-center gap-3">
            <div className="size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <FolderKanban className="size-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-foreground">Belum Ada Epic Terdaftar</h3>
              <p className="text-xs text-muted-foreground max-w-md">
                Program kerja ini belum memiliki Epic. Buat Epic pertama untuk mulai mengorganisasi pekerjaan ke Kanban task board.
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => setIsCreateEpicOpen(true)}
              className="gap-1.5 mt-2"
            >
              <Plus className="size-4" />
              Buat Epic Pertama
            </Button>
          </Card>
        )}
      </div>

      {/* ─── Modal Tambah Anggota Tim ─────────────────────────────────────────── */}
      <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              Tambah Anggota Tim Pelaksana
            </DialogTitle>
            <DialogDescription className="text-xs">
              Pilih anggota tim KKN untuk dilibatkan dalam pelaksanaan program kerja ini.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Pilih Anggota</Label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih mahasiswa..." />
                </SelectTrigger>
                <SelectContent>
                  {availableUsersForMember.map((u) => {
                    const metaParts: string[] = [];
                    if (u.cluster) metaParts.push(u.cluster);
                    if (u.subunit?.name) metaParts.push(u.subunit.name);
                    const metaText = metaParts.length > 0 ? ` (${metaParts.join(' • ')})` : '';
                    return (
                      <SelectItem key={u.id} value={u.id}>
                        {u.name}{metaText}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Peran dalam Tim</Label>
              <Select
                value={selectedMemberRole}
                onValueChange={(val: 'CO_PIC' | 'MEMBER') => setSelectedMemberRole(val)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MEMBER">Pelaksana / Anggota</SelectItem>
                  <SelectItem value="CO_PIC">Co-PIC (Pendamping)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsAddMemberOpen(false)}>
              Batal
            </Button>
            <Button
              disabled={!selectedUserId || addMemberMutation.isPending}
              onClick={handleAddMember}
            >
              Tambahkan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Modal Review Approval ────────────────────────────────────────────── */}
      {isReviewOpen && (
        <ReviewProgramDialog
          program={program}
          reviewType={reviewType}
          open={isReviewOpen}
          onOpenChange={setIsReviewOpen}
        />
      )}

      {/* ─── Modal Tambah Epic Terkait ────────────────────────────────────────── */}
      {isCreateEpicOpen && (
        <CreateEpicDialog
          open={isCreateEpicOpen}
          onOpenChange={setIsCreateEpicOpen}
          defaultProgramId={program.id}
        />
      )}
    </div>
  );
}
