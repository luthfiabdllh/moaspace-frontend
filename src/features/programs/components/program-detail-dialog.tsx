'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle2,
  Clock,
  Layers,
  Plus,
  Trash2,
  UserPlus,
  Users,
  XCircle,
  ExternalLink,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useProgramDetail } from '../api/use-queries';
import { useAddProgramMember, useRemoveProgramMember } from '../api/use-mutations';
import { useCurrentUser } from '@/features/auth/api/use-queries';
import { useUsers } from '@/features/users/api/use-queries';
import {
  ProgramStatusBadge,
  ProgramScopeBadge,
  ProgramClusterBadge,
} from './program-status-badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ProgramDetailDialogProps {
  programId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenCreateEpic?: (programId: string) => void;
}

export function ProgramDetailDialog({
  programId,
  open,
  onOpenChange,
  onOpenCreateEpic,
}: ProgramDetailDialogProps) {
  const { data: program, isLoading } = useProgramDetail(programId || '');
  const { data: currentUser } = useCurrentUser();
  const { data: allUsers = [] } = useUsers();

  const addMemberMutation = useAddProgramMember();
  const removeMemberMutation = useRemoveProgramMember();

  const [isAddingMember, setIsAddingMember] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState<'CO_PIC' | 'MEMBER'>('MEMBER');

  if (!programId) return null;

  const isPicOrAdmin =
    Boolean(currentUser?.isSuperAdmin) ||
    program?.primaryPicId === currentUser?.id ||
    program?.members.some((m) => m.userId === currentUser?.id && m.role === 'CO_PIC');

  const existingMemberIds = new Set([
    program?.primaryPicId,
    ...(program?.members.map((m) => m.userId) || []),
  ]);

  const availableUsers = allUsers.filter(
    (u) => u.status === 'ACTIVE' && !existingMemberIds.has(u.id),
  );

  const handleAddMember = async () => {
    if (!selectedUserId || !program) return;
    try {
      await addMemberMutation.mutateAsync({
        programId: program.id,
        userId: selectedUserId,
        role: selectedRole,
      });
      setSelectedUserId('');
      setIsAddingMember(false);
    } catch {
      // handled
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!program) return;
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        {isLoading || !program ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <div className="size-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <p className="text-sm">Memuat detail program kerja...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header */}
            <DialogHeader className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <ProgramScopeBadge
                  scope={program.scope}
                  subunitName={program.subunit?.name}
                />
                <ProgramClusterBadge cluster={program.cluster} />
                <ProgramStatusBadge status={program.status} />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold leading-tight">
                  {program.title}
                </DialogTitle>
                <DialogDescription className="text-sm mt-1">
                  Diusulkan pada {new Date(program.createdAt).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </DialogDescription>
              </div>
            </DialogHeader>

            {/* Kotak Approval Paralel */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Review Keilmuan (Kormater) */}
              <div className="p-3.5 rounded-xl border bg-card/60 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                    <Sparkles className="size-3.5 text-indigo-500" />
                    <span>Aspek Keilmuan (Kormater)</span>
                  </div>
                  {program.clusterApprovalStatus === 'APPROVED' ? (
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[11px] gap-1">
                      <CheckCircle2 className="size-3" /> Disetujui
                    </Badge>
                  ) : program.clusterApprovalStatus === 'REJECTED' ? (
                    <Badge variant="outline" className="bg-rose-500/10 text-rose-600 border-rose-500/20 text-[11px] gap-1">
                      <XCircle className="size-3" /> Ditolak / Revisi
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[11px] gap-1">
                      <Clock className="size-3" /> Menunggu Review
                    </Badge>
                  )}
                </div>
                {program.clusterApprovedBy && (
                  <p className="text-xs text-muted-foreground">
                    Direview oleh: <span className="font-medium text-foreground">{program.clusterApprovedBy.name}</span>
                  </p>
                )}
                {program.clusterRejectionReason && (
                  <p className="text-xs text-rose-600 dark:text-rose-400 bg-rose-500/10 p-2 rounded border border-rose-500/20">
                    Catatan: {program.clusterRejectionReason}
                  </p>
                )}
              </div>

              {/* Review Tata Kelola (Kormasit / Kormanit) */}
              <div className="p-3.5 rounded-xl border bg-card/60 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                    <ShieldCheck className="size-3.5 text-emerald-500" />
                    <span>
                      {program.scope === 'UNIT' ? 'Tata Kelola Unit (Kormanit)' : 'Tata Kelola Posko (Kormasit)'}
                    </span>
                  </div>
                  {program.governanceApprovalStatus === 'APPROVED' ? (
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[11px] gap-1">
                      <CheckCircle2 className="size-3" /> Disetujui
                    </Badge>
                  ) : program.governanceApprovalStatus === 'REJECTED' ? (
                    <Badge variant="outline" className="bg-rose-500/10 text-rose-600 border-rose-500/20 text-[11px] gap-1">
                      <XCircle className="size-3" /> Ditolak / Revisi
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[11px] gap-1">
                      <Clock className="size-3" /> Menunggu Review
                    </Badge>
                  )}
                </div>
                {program.governanceApprovedBy && (
                  <p className="text-xs text-muted-foreground">
                    Direview oleh: <span className="font-medium text-foreground">{program.governanceApprovedBy.name}</span>
                  </p>
                )}
                {program.governanceRejectionReason && (
                  <p className="text-xs text-rose-600 dark:text-rose-400 bg-rose-500/10 p-2 rounded border border-rose-500/20">
                    Catatan: {program.governanceRejectionReason}
                  </p>
                )}
              </div>
            </div>

            {/* Metrik & Progres Kanban */}
            <div className="p-4 rounded-xl border bg-muted/30 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-foreground flex items-center gap-2">
                  <Layers className="size-4 text-primary" />
                  Progres Agregat Eksekusi Kanban
                </span>
                <span className="font-bold text-primary">
                  {program.metrics.progressPercentage}% Selesai
                </span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.max(0, program.metrics.progressPercentage))}%` }}
                />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-1 text-center text-xs">
                <div className="p-2 rounded bg-background border">
                  <p className="text-muted-foreground">Total Epic</p>
                  <p className="font-bold text-base text-foreground mt-0.5">
                    {program.metrics.totalEpics}
                  </p>
                </div>
                <div className="p-2 rounded bg-background border">
                  <p className="text-muted-foreground">Epic Selesai</p>
                  <p className="font-bold text-base text-emerald-600 mt-0.5">
                    {program.metrics.completedEpics}
                  </p>
                </div>
                <div className="p-2 rounded bg-background border">
                  <p className="text-muted-foreground">Tugas Selesai</p>
                  <p className="font-bold text-base text-primary mt-0.5">
                    {program.metrics.completedTasks} / {program.metrics.totalTasks}
                  </p>
                </div>
                <div className="p-2 rounded bg-background border">
                  <p className="text-muted-foreground">Story Points</p>
                  <p className="font-bold text-base text-violet-600 mt-0.5">
                    {program.metrics.completedPoints} / {program.metrics.totalPoints}
                  </p>
                </div>
              </div>
            </div>

            {/* Deskripsi */}
            {program.description && (
              <div className="space-y-1.5">
                <h4 className="text-sm font-semibold text-foreground">Deskripsi & Tujuan</h4>
                <div className="p-3.5 rounded-lg border bg-card text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
                  {program.description}
                </div>
              </div>
            )}

            {/* PIC & Tim Pelaksana */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Users className="size-4 text-primary" />
                  Penanggung Jawab & Tim Pelaksana
                </h4>
                {isPicOrAdmin && !isAddingMember && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs gap-1"
                    onClick={() => setIsAddingMember(true)}
                  >
                    <UserPlus className="size-3.5" />
                    Tambah Tim
                  </Button>
                )}
              </div>

              {/* Form tambah tim */}
              {isAddingMember && (
                <div className="p-3 rounded-lg border bg-muted/40 space-y-3 animate-in fade-in-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Pilih mahasiswa..." />
                      </SelectTrigger>
                      <SelectContent>
                        {availableUsers.map((u) => (
                          <SelectItem key={u.id} value={u.id} className="text-xs">
                            {u.name} {u.cluster ? `(${u.cluster})` : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select
                      value={selectedRole}
                      onValueChange={(val: 'CO_PIC' | 'MEMBER') => setSelectedRole(val)}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MEMBER" className="text-xs">Anggota Tim Pelaksana</SelectItem>
                        <SelectItem value="CO_PIC" className="text-xs">Co-PIC (Wakil Penanggung Jawab)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs"
                      onClick={() => setIsAddingMember(false)}
                    >
                      Batal
                    </Button>
                    <Button
                      size="sm"
                      className="h-7 text-xs gap-1"
                      onClick={handleAddMember}
                      disabled={!selectedUserId || addMemberMutation.isPending}
                    >
                      <Plus className="size-3" />
                      Tambahkan
                    </Button>
                  </div>
                </div>
              )}

              {/* List anggota */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* Primary PIC */}
                <div className="p-2.5 rounded-lg border bg-card flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="size-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs shrink-0">
                      {program.primaryPic?.name?.charAt(0) || 'P'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold truncate">{program.primaryPic?.name}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{program.primaryPic?.email}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary shrink-0">
                    PIC Utama
                  </Badge>
                </div>

                {/* Co-PIC & Members */}
                {program.members.map((m) => (
                  <div
                    key={m.id}
                    className="p-2.5 rounded-lg border bg-card flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="size-8 rounded-full bg-muted text-muted-foreground font-semibold flex items-center justify-center text-xs shrink-0">
                        {m.user?.name?.charAt(0) || 'U'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium truncate">{m.user?.name}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{m.user?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Badge variant="outline" className="text-[10px]">
                        {m.role === 'CO_PIC' ? 'Co-PIC' : 'Anggota'}
                      </Badge>
                      {isPicOrAdmin && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-6 text-muted-foreground hover:text-destructive"
                          onClick={() => handleRemoveMember(m.userId)}
                          disabled={removeMemberMutation.isPending}
                        >
                          <Trash2 className="size-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Epics Terhubung */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Layers className="size-4 text-primary" />
                  Daftar Epic Terkait ({program.epics?.length || 0})
                </h4>
                {isPicOrAdmin && onOpenCreateEpic && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs gap-1"
                    onClick={() => onOpenCreateEpic(program.id)}
                  >
                    <Plus className="size-3.5" />
                    Buat Epic
                  </Button>
                )}
              </div>

              {program.epics && program.epics.length > 0 ? (
                <div className="space-y-2">
                  {program.epics.map((ep) => (
                    <div
                      key={ep.id}
                      className="p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors flex items-center justify-between text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-foreground text-sm">{ep.title}</p>
                          {ep.closedAt ? (
                            <Badge variant="outline" className="text-[10px] text-emerald-600 bg-emerald-500/10">
                              Selesai
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px] text-sky-600 bg-sky-500/10">
                              Berjalan
                            </Badge>
                          )}
                        </div>
                        {ep.description && (
                          <p className="text-muted-foreground line-clamp-1">{ep.description}</p>
                        )}
                      </div>

                      <Link
                        href={`/epics`}
                        className="text-primary hover:underline flex items-center gap-1 font-medium shrink-0"
                      >
                        Buka Epic <ExternalLink className="size-3" />
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 rounded-lg border border-dashed text-center text-xs text-muted-foreground">
                  Belum ada Epic yang ditautkan ke program kerja ini.
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
