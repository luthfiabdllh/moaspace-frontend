'use client';

import React, { useState } from 'react';

import {
  Briefcase,
  Plus,
  Search,
  Filter,
  Layers,
  MoreVertical,
  Edit,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';
import { usePrograms } from '../api/use-queries';
import { useDeleteProgram } from '../api/use-mutations';
import { useCurrentUser } from '@/features/auth/api/use-queries';
import type { ProgramItem, ProgramCluster, ProgramStatus } from '../types';
import {
  ProgramStatusBadge,
  ProgramScopeBadge,
  ProgramClusterBadge,
  DualApprovalStatusBadge,
} from './program-status-badge';
import { CreateProgramDialog } from './create-program-dialog';
import { EditProgramDialog } from './edit-program-dialog';
import { ReviewProgramDialog } from './review-program-dialog';
import { ProgramDetailDialog } from './program-detail-dialog';
import { CreateEpicDialog } from '@/features/epics/components/create-epic-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function ProgramsPageContent() {
  const { data: user } = useCurrentUser();

  const [search, setSearch] = useState('');
  const [clusterFilter, setClusterFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [tabFilter, setTabFilter] = useState<'ALL' | 'UNIT' | 'SUBUNIT' | 'MY_CLUSTER' | 'MY_PROGRAMS'>('ALL');

  const { data: programs = [], isLoading } = usePrograms({
    search: search.trim() || undefined,
    scope: tabFilter === 'UNIT' ? 'UNIT' : tabFilter === 'SUBUNIT' ? 'SUBUNIT' : undefined,
    cluster: clusterFilter !== 'ALL' ? (clusterFilter as ProgramCluster) : undefined,
    status: statusFilter !== 'ALL' ? (statusFilter as ProgramStatus) : undefined,
  });

  const deleteMutation = useDeleteProgram();

  // Modals state
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedProgramForEdit, setSelectedProgramForEdit] = useState<ProgramItem | null>(null);
  const [selectedProgramForReview, setSelectedProgramForReview] = useState<ProgramItem | null>(null);
  const [reviewType, setReviewType] = useState<'CLUSTER' | 'GOVERNANCE' | null>(null);
  const [detailProgramId, setDetailProgramId] = useState<string | null>(null);
  const [createEpicProgramId, setCreateEpicProgramId] = useState<string | null>(null);

  // Filter client-side untuk tab khusus
  const filteredPrograms = programs.filter((prog) => {
    if (tabFilter === 'MY_CLUSTER') {
      if (!user?.cluster) return false;
      return prog.cluster === user.cluster || prog.cluster === 'UNIT_SHARED';
    }
    if (tabFilter === 'MY_PROGRAMS') {
      const isPic = prog.primaryPicId === user?.id;
      const isMember = prog.members?.some((m) => m.userId === user?.id);
      return isPic || isMember;
    }
    return true;
  });

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus program kerja "${title}"?`)) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch {
        // handled
      }
    }
  };

  const handleOpenReview = (prog: ProgramItem, type: 'CLUSTER' | 'GOVERNANCE') => {
    setSelectedProgramForReview(prog);
    setReviewType(type);
  };

  return (
    <div className="flex flex-col gap-6 p-6 mx-auto w-full">
      {/* ─── Hero Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-linear-to-r from-primary/10 via-background to-indigo-500/10 border border-primary/20 shadow-sm">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-primary font-bold text-xs tracking-wider uppercase">
            <Briefcase className="size-4" />
            <span>Portofolio KKN • Manajemen Kerja</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            Program Kerja (Proker)
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Inisiatif makro program KKN dengan sistem persetujuan paralel dari Koordinator Klaster (Kormater)
            dan Koordinator Subunit (Kormasit). Setiap program memayungi Epic dan Task Kanban.
          </p>
        </div>

        <Button
          onClick={() => setCreateOpen(true)}
          className="gap-2 shrink-0 shadow-md font-semibold"
        >
          <Plus className="size-4" />
          Ajukan Program Baru
        </Button>
      </div>

      {/* ─── Filter & Search Bar ──────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 p-1 bg-muted/60 rounded-xl border overflow-x-auto">
            <button
              type="button"
              onClick={() => setTabFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                tabFilter === 'ALL'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Semua
            </button>
            <button
              type="button"
              onClick={() => setTabFilter('UNIT')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                tabFilter === 'UNIT'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Tingkat Unit
            </button>
            <button
              type="button"
              onClick={() => setTabFilter('SUBUNIT')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                tabFilter === 'SUBUNIT'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Posko Dusun
            </button>
            {user?.cluster && (
              <button
                type="button"
                onClick={() => setTabFilter('MY_CLUSTER')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                  tabFilter === 'MY_CLUSTER'
                    ? 'bg-background text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Klaster {user.cluster}
              </button>
            )}
            <button
              type="button"
              onClick={() => setTabFilter('MY_PROGRAMS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                tabFilter === 'MY_PROGRAMS'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Proker Saya
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari program kerja..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1 font-medium text-foreground">
            <Filter className="size-3.5" /> Filter:
          </span>

          {/* Filter Klaster */}
          <Select value={clusterFilter} onValueChange={setClusterFilter}>
            <SelectTrigger className="h-8 text-xs w-36">
              <SelectValue placeholder="Semua Klaster" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua Klaster</SelectItem>
              <SelectItem value="SAINTEK">Saintek</SelectItem>
              <SelectItem value="SOSHUM">Soshum</SelectItem>
              <SelectItem value="MEDIKA">Medika</SelectItem>
              <SelectItem value="AGRO">Agro</SelectItem>
              <SelectItem value="UNIT_SHARED">Lintas Rumpun</SelectItem>
            </SelectContent>
          </Select>

          {/* Filter Status */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-8 text-xs w-36">
              <SelectValue placeholder="Semua Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua Status</SelectItem>
              <SelectItem value="PROPOSED">Usulan (Proposed)</SelectItem>
              <SelectItem value="ACTIVE">Aktif (Active)</SelectItem>
              <SelectItem value="COMPLETED">Selesai (Completed)</SelectItem>
              <SelectItem value="CANCELLED">Dibatalkan</SelectItem>
            </SelectContent>
          </Select>

          {(clusterFilter !== 'ALL' || statusFilter !== 'ALL' || search) && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs"
              onClick={() => {
                setClusterFilter('ALL');
                setStatusFilter('ALL');
                setSearch('');
              }}
            >
              Reset Filter
            </Button>
          )}
        </div>
      </div>

      {/* ─── Grid Program Kerja ───────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-muted-foreground">
          <div className="size-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm">Memuat daftar program kerja...</p>
        </div>
      ) : filteredPrograms.length === 0 ? (
        <div className="py-16 px-4 rounded-xl border border-dashed text-center flex flex-col items-center justify-center gap-3">
          <div className="size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <Briefcase className="size-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-foreground">Tidak Ada Program Kerja</h3>
            <p className="text-xs text-muted-foreground max-w-sm">
              Belum ada program kerja yang cocok dengan filter. Anda dapat mengusulkan program baru sekarang.
            </p>
          </div>
          <Button size="sm" onClick={() => setCreateOpen(true)} className="gap-1.5 mt-2">
            <Plus className="size-4" />
            Ajukan Program Baru
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPrograms.map((prog) => {
            const isPicOrAdmin =
              Boolean(user?.isSuperAdmin) ||
              prog.primaryPicId === user?.id ||
              prog.members?.some((m) => m.userId === user?.id && m.role === 'CO_PIC');

            // Cek apakah user berhak review keilmuan (Kormater)
            const canReviewCluster =
              Boolean(user?.isSuperAdmin) ||
              (Boolean(user?.isClusterCoordinator) &&
                (user?.cluster === prog.cluster || prog.cluster === 'UNIT_SHARED'));

            // Cek apakah user berhak review tata kelola (Kormasit atau Kormanit)
            const canReviewGovernance =
              Boolean(user?.isSuperAdmin) ||
              (prog.scope === 'SUBUNIT' &&
                user?.subunits?.some(
                  (s) => s.subunitId === prog.subunitId && s.role === 'COORDINATOR',
                ));

            return (
              <div
                key={prog.id}
                className="group flex flex-col justify-between rounded-xl border bg-card hover:shadow-md hover:border-primary/40 transition-all duration-200 overflow-hidden"
              >
                <div className="p-5 space-y-3.5">
                  {/* Tag Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <ProgramScopeBadge
                        scope={prog.scope}
                        subunitName={prog.subunit?.name}
                      />
                      <ProgramClusterBadge cluster={prog.cluster} />
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 opacity-70 group-hover:opacity-100"
                        >
                          <MoreVertical className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setDetailProgramId(prog.id)}>
                          <ExternalLink className="size-4 mr-2" />
                          Lihat Detail & Epics
                        </DropdownMenuItem>
                        {isPicOrAdmin && (
                          <>
                            <DropdownMenuItem onClick={() => setSelectedProgramForEdit(prog)}>
                              <Edit className="size-4 mr-2" />
                              Edit Program
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => handleDelete(prog.id, prog.title)}
                            >
                              <Trash2 className="size-4 mr-2" />
                              Hapus Program
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Judul & Status */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <ProgramStatusBadge status={prog.status} />
                    </div>
                    <h3
                      onClick={() => setDetailProgramId(prog.id)}
                      className="font-bold text-base text-foreground leading-snug line-clamp-2 hover:text-primary transition-colors cursor-pointer"
                    >
                      {prog.title}
                    </h3>
                    {prog.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {prog.description}
                      </p>
                    )}
                  </div>

                  {/* Dual Approval Badge & Action Review */}
                  <div className="pt-2 border-t space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground font-medium">Status Approval:</span>
                      <DualApprovalStatusBadge
                        clusterStatus={prog.clusterApprovalStatus}
                        governanceStatus={prog.governanceApprovalStatus}
                        scope={prog.scope}
                      />
                    </div>

                    {/* Tombol review jika user berwenang & belum disetujui */}
                    {(canReviewCluster && prog.clusterApprovalStatus === 'PENDING') ||
                    (canReviewGovernance && prog.governanceApprovalStatus === 'PENDING') ? (
                      <div className="flex gap-2 pt-1">
                        {canReviewCluster && prog.clusterApprovalStatus === 'PENDING' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-[11px] gap-1 w-full border-indigo-500/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-500/10"
                            onClick={() => handleOpenReview(prog, 'CLUSTER')}
                          >
                            <Sparkles className="size-3" />
                            Review Kormater
                          </Button>
                        )}
                        {canReviewGovernance && prog.governanceApprovalStatus === 'PENDING' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-[11px] gap-1 w-full border-emerald-500/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10"
                            onClick={() => handleOpenReview(prog, 'GOVERNANCE')}
                          >
                            <ShieldCheck className="size-3" />
                            Review Tata Kelola
                          </Button>
                        )}
                      </div>
                    ) : null}
                  </div>

                  {/* Progres Kanban */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Layers className="size-3 text-primary" />
                        {prog.metrics.totalEpics} Epic • {prog.metrics.completedTasks}/{prog.metrics.totalTasks} Task
                      </span>
                      <span className="font-semibold text-primary">
                        {prog.metrics.progressPercentage}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, Math.max(0, prog.metrics.progressPercentage))}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Footer Kartu: PIC & Anggota */}
                <div className="px-5 py-3 border-t bg-muted/20 flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="size-6 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-[10px] shrink-0">
                      {prog.primaryPic?.name?.charAt(0) || 'P'}
                    </div>
                    <span className="font-medium text-foreground truncate">
                      PIC: {prog.primaryPic?.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] shrink-0">
                    <Users className="size-3" />
                    <span>+{prog.members?.length || 0} tim</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Modals ───────────────────────────────────────────────────────────── */}
      <CreateProgramDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
      />

      <EditProgramDialog
        program={selectedProgramForEdit}
        open={Boolean(selectedProgramForEdit)}
        onOpenChange={(op) => !op && setSelectedProgramForEdit(null)}
      />

      <ReviewProgramDialog
        program={selectedProgramForReview}
        reviewType={reviewType}
        open={Boolean(selectedProgramForReview)}
        onOpenChange={(op) => {
          if (!op) {
            setSelectedProgramForReview(null);
            setReviewType(null);
          }
        }}
      />

      <ProgramDetailDialog
        programId={detailProgramId}
        open={Boolean(detailProgramId)}
        onOpenChange={(op) => !op && setDetailProgramId(null)}
        onOpenCreateEpic={(progId) => {
          setCreateEpicProgramId(progId);
          setDetailProgramId(null);
        }}
      />

      {createEpicProgramId && (
        <CreateEpicDialog
          open={Boolean(createEpicProgramId)}
          onOpenChange={(op) => !op && setCreateEpicProgramId(null)}
        />
      )}
    </div>
  );
}
