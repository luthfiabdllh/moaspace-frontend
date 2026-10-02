'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Target,
  Plus,
  Search,
  Filter,
  Layers,
  Network,
  CheckCircle2,
  Clock,
  Sparkles,
  BarChart3,
  X,
} from 'lucide-react';
import { useEpics } from '../api/use-queries';
import { EpicCard } from './epic-card';
import { CreateEpicDialog } from './create-epic-dialog';
import { EpicDetailSheet } from './epic-detail-sheet';
import { useCurrentUser } from '@/features/auth/api/use-queries';
import { useDivisions } from '@/features/divisions/api/use-queries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { EpicItem } from '../types';

export function EpicsPageContent() {
  const searchParams = useSearchParams();
  const urlEpicId = searchParams.get('epicId');

  const { data: user } = useCurrentUser();
  const { data: divisions = [] } = useDivisions();
  const { data: epics = [], isLoading, error } = useEpics();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedEpic, setSelectedEpic] = useState<EpicItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedScope, setSelectedScope] = useState<'ALL' | 'DIVISION' | 'CROSS'>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'ACTIVE' | 'CLOSED'>('ALL');
  const [selectedDivisionId, setSelectedDivisionId] = useState<string>('ALL');

  // Auto-open epic if epicId query param exists
  useEffect(() => {
    if (urlEpicId && epics.length > 0) {
      const found = epics.find((e) => e.id === urlEpicId);
      if (found) {
        setSelectedEpic(found);
      }
    }
  }, [urlEpicId, epics]);

  // Can the user create epics?
  // Superadmin, kormanit, or coordinator of any division
  const canCreateEpic = Boolean(
    user?.isSuperAdmin ||
      user?.isKormanit ||
      user?.divisions.some((d) => d.role === 'COORDINATOR')
  );

  // Filtered epics
  const filteredEpics = useMemo(() => {
    return epics.filter((epic) => {
      // Scope filter
      if (selectedScope !== 'ALL' && epic.scope !== selectedScope) {
        return false;
      }

      // Status filter
      if (selectedStatus === 'ACTIVE' && epic.isClosed) {
        return false;
      }
      if (selectedStatus === 'CLOSED' && !epic.isClosed) {
        return false;
      }

      // Division filter
      if (selectedDivisionId !== 'ALL') {
        const matchesOwner = epic.ownerDivisionId === selectedDivisionId;
        const matchesParticipating = epic.participatingDivisions.some(
          (p) => p.id === selectedDivisionId
        );
        if (!matchesOwner && !matchesParticipating) {
          return false;
        }
      }

      // Search query filter (title, description, prokerTag)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = epic.title.toLowerCase().includes(query);
        const matchesDesc = epic.description?.toLowerCase().includes(query);
        const matchesTag = epic.prokerTag?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc && !matchesTag) {
          return false;
        }
      }

      return true;
    });
  }, [epics, selectedScope, selectedStatus, selectedDivisionId, searchQuery]);

  // Summary Metrics
  const metrics = useMemo(() => {
    const total = epics.length;
    const crossDiv = epics.filter((e) => e.scope === 'CROSS').length;
    const active = epics.filter((e) => !e.isClosed).length;
    const closed = epics.filter((e) => e.isClosed).length;

    const totalTasksAll = epics.reduce((acc, e) => acc + e.totalTasks, 0);
    const doneTasksAll = epics.reduce((acc, e) => acc + e.doneTasks, 0);
    const avgProgress =
      totalTasksAll > 0 ? Math.round((doneTasksAll / totalTasksAll) * 100) : 0;

    return { total, crossDiv, active, closed, avgProgress };
  }, [epics]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Target className="size-6 text-primary" />
              Inisiatif & Epic
            </h1>
            <Badge variant="outline" className="font-mono text-xs">
              {epics.length} Total
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Pantau dan kelola inisiatif strategis divisi serta kolaborasi lintas divisi.
          </p>
        </div>

        {canCreateEpic && (
          <Button
            onClick={() => setCreateDialogOpen(true)}
            className="gap-2 shadow-xs shrink-0"
          >
            <Plus className="size-4" />
            Inisiatif Baru
          </Button>
        )}
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="shadow-2xs">
          <CardContent className="p-4 space-y-1">
            <p className="text-xs text-muted-foreground font-medium flex items-center justify-between">
              Total Inisiatif
              <Target className="size-4 text-muted-foreground/60" />
            </p>
            <p className="text-2xl font-bold text-foreground">{metrics.total}</p>
            <p className="text-2xs text-muted-foreground">
              {metrics.active} aktif • {metrics.closed} selesai
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-2xs">
          <CardContent className="p-4 space-y-1">
            <p className="text-xs text-muted-foreground font-medium flex items-center justify-between">
              Lintas Divisi
              <Network className="size-4 text-indigo-500" />
            </p>
            <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {metrics.crossDiv}
            </p>
            <p className="text-2xs text-muted-foreground">Kolaborasi multi-divisi</p>
          </CardContent>
        </Card>

        <Card className="shadow-2xs">
          <CardContent className="p-4 space-y-1">
            <p className="text-xs text-muted-foreground font-medium flex items-center justify-between">
              Rata-rata Progres
              <BarChart3 className="size-4 text-primary" />
            </p>
            <p className="text-2xl font-bold text-foreground">{metrics.avgProgress}%</p>
            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden mt-1.5">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${metrics.avgProgress}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-2xs">
          <CardContent className="p-4 space-y-1">
            <p className="text-xs text-muted-foreground font-medium flex items-center justify-between">
              Terselesaikan
              <CheckCircle2 className="size-4 text-emerald-500" />
            </p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {metrics.closed}
            </p>
            <p className="text-2xs text-muted-foreground">Arsip inisiatif tuntas</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-card p-3 rounded-xl border border-border/80 shadow-2xs">
        {/* Search */}
        <div className="relative flex-1 min-w-60">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari inisiatif atau #tag proker..."
            className="pl-9 h-9 text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Scope Selector */}
          <div className="flex items-center rounded-lg border bg-muted/40 p-0.5 text-xs font-medium">
            <button
              onClick={() => setSelectedScope('ALL')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                selectedScope === 'ALL'
                  ? 'bg-background text-foreground shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Semua Scope
            </button>
            <button
              onClick={() => setSelectedScope('DIVISION')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                selectedScope === 'DIVISION'
                  ? 'bg-background text-foreground shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Divisi
            </button>
            <button
              onClick={() => setSelectedScope('CROSS')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                selectedScope === 'CROSS'
                  ? 'bg-background text-foreground shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Lintas Divisi
            </button>
          </div>

          {/* Status Selector */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            className="h-9 rounded-lg border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="ALL">Semua Status</option>
            <option value="ACTIVE">Aktif Saja</option>
            <option value="CLOSED">Selesai/Tutup</option>
          </select>

          {/* Division Selector */}
          <select
            value={selectedDivisionId}
            onChange={(e) => setSelectedDivisionId(e.target.value)}
            className="h-9 rounded-lg border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary max-w-45 truncate"
          >
            <option value="ALL">Semua Divisi</option>
            {divisions.map((div) => (
              <option key={div.id} value={div.id}>
                {div.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Epics Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-44 rounded-xl border border-border/60 bg-card p-5 animate-pulse space-y-3"
            >
              <div className="h-4 w-28 bg-muted rounded" />
              <div className="h-6 w-3/4 bg-muted rounded" />
              <div className="h-4 w-full bg-muted rounded" />
              <div className="h-2 w-full bg-muted rounded mt-4" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="p-8 text-center rounded-xl border border-destructive/20 bg-destructive/5">
          <p className="text-sm font-medium text-destructive">
            Gagal memuat daftar inisiatif / epic.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Pastikan Anda memiliki koneksi yang stabil dan terautentikasi.
          </p>
        </div>
      ) : filteredEpics.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-border bg-card/50 flex flex-col items-center justify-center space-y-3">
          <div className="p-3 rounded-full bg-primary/10 text-primary">
            <Target className="size-6" />
          </div>
          <div className="space-y-1 max-w-sm">
            <h3 className="font-semibold text-base text-foreground">
              Tidak Ada Inisiatif / Epic
            </h3>
            <p className="text-xs text-muted-foreground">
              {searchQuery || selectedScope !== 'ALL' || selectedStatus !== 'ALL'
                ? 'Tidak ada inisiatif yang cocok dengan filter yang dipilih.'
                : 'Belum ada inisiatif kerja atau program kerja besar yang terdaftar.'}
            </p>
          </div>
          {canCreateEpic && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCreateDialogOpen(true)}
              className="gap-2 mt-2"
            >
              <Plus className="size-4" />
              Mulai Inisiatif Pertama
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEpics.map((epic) => (
            <EpicCard
              key={epic.id}
              epic={epic}
              onSelect={(selected) => setSelectedEpic(selected)}
            />
          ))}
        </div>
      )}

      {/* Create Epic Dialog */}
      <CreateEpicDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      {/* Epic Detail & Hierarchy Breakdown Sheet */}
      <EpicDetailSheet
        epic={selectedEpic}
        open={Boolean(selectedEpic)}
        onOpenChange={(open) => !open && setSelectedEpic(null)}
      />
    </div>
  );
}
