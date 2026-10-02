'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Bookmark,
  Plus,
  Search,
  Filter,
  Layers,
  CheckCircle2,
  Clock,
  Sparkles,
  BarChart3,
  X,
  Target,
  FolderKanban,
  Award,
  Columns,
} from 'lucide-react';
import { useDivisions } from '@/features/divisions/api/use-queries';
import { useCurrentUser } from '@/features/auth/api/use-queries';
import { useStories } from '../api/use-queries';
import { useEpics } from '@/features/epics/api/use-queries';
import { StoryCard } from './story-card';
import { CreateStoryDialog } from './create-story-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface DivisionStoriesContentProps {
  divisionSlug: string;
  hideHeader?: boolean;
}

export function DivisionStoriesContent({
  divisionSlug,
  hideHeader = false,
}: DivisionStoriesContentProps) {
  const { data: user } = useCurrentUser();
  const { data: divisions = [], isLoading: isDivisionsLoading } = useDivisions();

  const division = useMemo(() => {
    return divisions.find((d) => d.slug === divisionSlug);
  }, [divisions, divisionSlug]);

  const divisionId = division?.id;

  const { data: stories = [], isLoading: isStoriesLoading, error } = useStories(
    divisionId ? { divisionId } : undefined
  );

  const { data: epics = [] } = useEpics(
    divisionId ? { divisionId } : undefined
  );

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'ACTIVE' | 'CLOSED'>('ALL');
  const [selectedEpicId, setSelectedEpicId] = useState<string>('ALL');

  // Permissions: Super Admin, Kormanit, or Coordinator of this division
  const isGlobalAdmin = Boolean(user?.isSuperAdmin || user?.isKormanit);
  const isCoordinator = Boolean(
    isGlobalAdmin ||
      user?.divisions.some(
        (d) => d.divisionId === divisionId && d.role === 'COORDINATOR'
      )
  );

  // Filtered stories
  const filteredStories = useMemo(() => {
    return stories.filter((story) => {
      // Status filter
      if (selectedStatus === 'ACTIVE' && story.isClosed) return false;
      if (selectedStatus === 'CLOSED' && !story.isClosed) return false;

      // Epic filter
      if (selectedEpicId !== 'ALL') {
        if (selectedEpicId === 'NONE' && story.epicId) return false;
        if (selectedEpicId !== 'NONE' && story.epicId !== selectedEpicId) return false;
      }

      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = story.title.toLowerCase().includes(q);
        const matchesTag = story.prokerTag?.toLowerCase().includes(q);
        const matchesDoD = story.doneCriteria?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesTag && !matchesDoD) return false;
      }

      return true;
    });
  }, [stories, selectedStatus, selectedEpicId, searchQuery]);

  // Metrics
  const metrics = useMemo(() => {
    const total = stories.length;
    const active = stories.filter((s) => !s.isClosed).length;
    const closed = stories.filter((s) => s.isClosed).length;
    const totalTasks = stories.reduce((acc, s) => acc + s.totalTasks, 0);
    const doneTasks = stories.reduce((acc, s) => acc + s.doneTasks, 0);
    const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

    return { total, active, closed, totalTasks, doneTasks, progress };
  }, [stories]);

  if (isDivisionsLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-64 bg-muted rounded" />
        <div className="h-24 w-full bg-muted rounded-xl" />
      </div>
    );
  }

  if (!division) {
    return (
      <div className="p-12 text-center rounded-2xl border border-destructive/20 bg-destructive/5 space-y-3">
        <Layers className="size-8 text-destructive mx-auto" />
        <h3 className="font-semibold text-lg text-foreground">Divisi Tidak Ditemukan</h3>
        <p className="text-xs text-muted-foreground">
          Divisi dengan slug &quot;{divisionSlug}&quot; tidak terdaftar di sistem.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header (Only shown when not embedded) */}
      {!hideHeader && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <FolderKanban className="size-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                  {division.name}
                  {isCoordinator && (
                    <Badge variant="outline" className="text-2xs text-amber-600 border-amber-300 gap-1 font-normal">
                      <Award className="size-3 text-amber-500" />
                      Koordinator
                    </Badge>
                  )}
                </h1>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Deliverable Stories & Breakdown Unit Kerja Task
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* View Switcher: Stories vs Kanban */}
            <div className="flex items-center rounded-lg border bg-muted/40 p-1 text-xs font-medium shrink-0">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-background text-foreground shadow-2xs font-semibold">
                <Bookmark className="size-3.5 text-primary" />
                Deliverable Stories
              </div>
              <Link
                href={`/d/${divisionSlug}/board`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground transition-colors"
              >
                <Columns className="size-3.5" />
                Papan Kanban
              </Link>
            </div>

            {isCoordinator && (
              <Button
                onClick={() => setCreateDialogOpen(true)}
                className="gap-2 shadow-xs shrink-0"
              >
                <Plus className="size-4" />
                Story Baru
              </Button>
            )}
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="shadow-2xs">
          <CardContent className="p-4 space-y-1">
            <p className="text-xs text-muted-foreground font-medium flex items-center justify-between">
              Total Stories
              <Bookmark className="size-4 text-muted-foreground/60" />
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
              Total Unit Task
              <BarChart3 className="size-4 text-indigo-500" />
            </p>
            <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {metrics.totalTasks}
            </p>
            <p className="text-2xs text-muted-foreground">
              {metrics.doneTasks} task terselesaikan
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-2xs">
          <CardContent className="p-4 space-y-1">
            <p className="text-xs text-muted-foreground font-medium flex items-center justify-between">
              Progres Divisi
              <Sparkles className="size-4 text-primary" />
            </p>
            <p className="text-2xl font-bold text-foreground">{metrics.progress}%</p>
            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden mt-1.5">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${metrics.progress}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-2xs">
          <CardContent className="p-4 space-y-1">
            <p className="text-xs text-muted-foreground font-medium flex items-center justify-between">
              Story Tuntas
              <CheckCircle2 className="size-4 text-emerald-500" />
            </p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {metrics.closed}
            </p>
            <p className="text-2xs text-muted-foreground">Deliverable selesai</p>
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
            placeholder="Cari deliverable story atau #tag proker..."
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

          {/* Epic Filter Selector */}
          <select
            value={selectedEpicId}
            onChange={(e) => setSelectedEpicId(e.target.value)}
            className="h-9 rounded-lg border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary max-w-45 truncate"
          >
            <option value="ALL">Semua Inisiatif / Epic</option>
            <option value="NONE">Hanya Pekerjaan Rutin</option>
            {epics.map((epic) => (
              <option key={epic.id} value={epic.id}>
                {epic.title}
              </option>
            ))}
          </select>

          {hideHeader && isCoordinator && (
            <Button
              onClick={() => setCreateDialogOpen(true)}
              size="sm"
              className="gap-1.5 h-9 shadow-xs shrink-0 text-xs"
            >
              <Plus className="size-3.5" />
              Story Baru
            </Button>
          )}
        </div>
      </div>

      {/* Stories List */}
      {isStoriesLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-32 rounded-xl border border-border/60 bg-card p-5 animate-pulse space-y-3"
            >
              <div className="h-4 w-32 bg-muted rounded" />
              <div className="h-6 w-1/2 bg-muted rounded" />
              <div className="h-2 w-full bg-muted rounded mt-4" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="p-8 text-center rounded-xl border border-destructive/20 bg-destructive/5">
          <p className="text-sm font-medium text-destructive">
            Gagal memuat deliverable stories divisi.
          </p>
        </div>
      ) : filteredStories.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-border bg-card/50 flex flex-col items-center justify-center space-y-3">
          <div className="p-3 rounded-full bg-primary/10 text-primary">
            <Bookmark className="size-6" />
          </div>
          <div className="space-y-1 max-w-sm">
            <h3 className="font-semibold text-base text-foreground">
              Tidak Ada Deliverable Story
            </h3>
            <p className="text-xs text-muted-foreground">
              {searchQuery || selectedStatus !== 'ALL' || selectedEpicId !== 'ALL'
                ? 'Tidak ada story yang cocok dengan filter yang dipilih.'
                : 'Divisi ini belum menyusun deliverable story.'}
            </p>
          </div>
          {isCoordinator && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCreateDialogOpen(true)}
              className="gap-2 mt-2"
            >
              <Plus className="size-4" />
              Buat Story Pertama
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredStories.map((story) => (
            <StoryCard
              key={story.id}
              story={story}
              isCoordinatorOrAdmin={isCoordinator}
            />
          ))}
        </div>
      )}

      {/* Create Story Dialog */}
      <CreateStoryDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        defaultDivisionId={division.id}
      />
    </div>
  );
}
