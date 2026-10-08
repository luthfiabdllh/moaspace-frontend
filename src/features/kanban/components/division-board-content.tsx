'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  FolderKanban,
  Bookmark,
  Search,
  Layers,
  ShieldAlert,
  Columns,
  X,
  Award,
  RotateCcw,
} from 'lucide-react';
import { useDivisions } from '@/features/divisions/api/use-queries';
import { useCurrentUser } from '@/features/auth/api/use-queries';
import { useEpics } from '@/features/epics/api/use-queries';
import { useDivisionBoard } from '../api/use-queries';
import { KanbanBoard } from './kanban-board';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { SwimlaneMode } from '../types';

interface DivisionBoardContentProps {
  divisionSlug: string;
  hideHeader?: boolean;
}

export function DivisionBoardContent({
  divisionSlug,
  hideHeader = false,
}: DivisionBoardContentProps) {
  const { data: user } = useCurrentUser();
  const { data: divisions = [], isLoading: isDivisionsLoading } = useDivisions();

  const division = useMemo(() => {
    return divisions.find((d) => d.slug === divisionSlug);
  }, [divisions, divisionSlug]);

  const divisionId = division?.id;

  const { data: epics = [] } = useEpics(
    divisionId ? { divisionId } : undefined
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');
  const [selectedEpicId, setSelectedEpicId] = useState<string>('ALL');
  const [onlyBlocked, setOnlyBlocked] = useState(false);
  const [swimlaneMode, setSwimlaneMode] = useState<SwimlaneMode>('NONE');

  // Query board with filters
  const { data: board, isLoading: isBoardLoading, error } = useDivisionBoard(
    divisionId || '',
    {
      priority:
        selectedPriority !== 'ALL'
          ? (selectedPriority as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT')
          : undefined,
      epicId: selectedEpicId !== 'ALL' ? selectedEpicId : undefined,
      isBlocked: onlyBlocked ? true : undefined,
      search: searchQuery.trim() || undefined,
    },
    Boolean(divisionId)
  );

  const isGlobalAdmin = Boolean(user?.isSuperAdmin || user?.isKormanit);
  const isCoordinator = Boolean(
    isGlobalAdmin ||
      user?.divisions.some(
        (d) => d.divisionId === divisionId && d.role === 'COORDINATOR'
      )
  );

  const hasActiveFilters = Boolean(
    searchQuery.trim() ||
      selectedPriority !== 'ALL' ||
      selectedEpicId !== 'ALL' ||
      onlyBlocked ||
      swimlaneMode !== 'NONE'
  );

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedPriority('ALL');
    setSelectedEpicId('ALL');
    setOnlyBlocked(false);
    setSwimlaneMode('NONE');
  };

  if (isDivisionsLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-64 bg-muted rounded" />
        <div className="h-96 w-full bg-muted rounded-xl" />
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

  const totalTasks = board
    ? Object.values(board).reduce((acc, tasks) => acc + tasks.length, 0)
    : 0;

  return (
    <div className="space-y-4">
      {/* Top Header & View Switcher (Only shown when not embedded) */}
      {!hideHeader && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-2xs">
                <FolderKanban className="size-5" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                  {division.name}
                  {isCoordinator && (
                    <Badge variant="outline" className="text-2xs text-amber-600 border-amber-300 gap-1 font-normal">
                      <Award className="size-3 text-amber-500" />
                      Koordinator
                    </Badge>
                  )}
                </h1>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Papan Kerja Kanban Interaktif • {totalTasks} Total Task
                </p>
              </div>
            </div>
          </div>

          {/* View Switcher: Stories vs Kanban */}
          <div className="flex items-center rounded-lg border bg-muted/40 p-1 text-xs font-medium shrink-0">
            <Link
              href={`/board?division=${divisionSlug}&tab=stories`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground transition-colors"
            >
              <Bookmark className="size-3.5" />
              Deliverable Stories
            </Link>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-background text-foreground shadow-2xs font-semibold">
              <Columns className="size-3.5 text-primary" />
              Papan Kanban
            </div>
          </div>
        </div>
      )}

      {/* Modern Filter and Search Bar */}
      <div className="flex flex-col gap-3 p-3 rounded-xl border border-border/80 bg-card shadow-2xs">
        <div className="flex flex-col md:flex-row gap-2.5 items-stretch md:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1 min-w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari task di papan..."
              className="pl-9 pr-8 h-9 text-xs sm:text-sm bg-background/70 focus-visible:bg-background"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded"
                title="Hapus pencarian"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Filter Controls Group */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Epic Filter */}
            <Select value={selectedEpicId} onValueChange={setSelectedEpicId}>
              <SelectTrigger className="h-9 min-w-36 max-w-52 text-xs bg-background">
                <SelectValue placeholder="Semua Epic" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Semua Epic</SelectItem>
                {epics.map((epic) => (
                  <SelectItem key={epic.id} value={epic.id}>
                    {epic.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Priority Filter */}
            <Select value={selectedPriority} onValueChange={setSelectedPriority}>
              <SelectTrigger className="h-9 min-w-32 text-xs bg-background">
                <SelectValue placeholder="Semua Prioritas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Semua Prioritas</SelectItem>
                <SelectItem value="LOW">
                  <div className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-slate-400" />
                    <span>Low</span>
                  </div>
                </SelectItem>
                <SelectItem value="MEDIUM">
                  <div className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-sky-500" />
                    <span>Medium</span>
                  </div>
                </SelectItem>
                <SelectItem value="HIGH">
                  <div className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-orange-500" />
                    <span>High</span>
                  </div>
                </SelectItem>
                <SelectItem value="URGENT">
                  <div className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-rose-500" />
                    <span>Urgent</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Swimlane Filter */}
            <Select
              value={swimlaneMode}
              onValueChange={(val) => setSwimlaneMode(val as SwimlaneMode)}
            >
              <SelectTrigger className="h-9 min-w-36 text-xs bg-background">
                <SelectValue placeholder="Swimlane" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NONE">Tanpa Grup (Standar)</SelectItem>
                <SelectItem value="EPIC">Grup: Per Inisiatif / Epic</SelectItem>
                <SelectItem value="STORY">Grup: Per Deliverable Story</SelectItem>
                <SelectItem value="ASSIGNEE">Grup: Per Anggota</SelectItem>
              </SelectContent>
            </Select>

            {/* Blocked Only Toggle */}
            <Button
              type="button"
              variant={onlyBlocked ? 'destructive' : 'outline'}
              size="sm"
              onClick={() => setOnlyBlocked(!onlyBlocked)}
              className={cn(
                'h-9 gap-1.5 text-xs font-medium transition-all shadow-2xs',
                onlyBlocked
                  ? 'bg-destructive/15 text-destructive border-destructive/40 hover:bg-destructive/25'
                  : 'text-muted-foreground hover:text-foreground bg-background'
              )}
            >
              <ShieldAlert className="size-3.5" />
              <span>Terkendala</span>
              {onlyBlocked && (
                <span className="size-1.5 rounded-full bg-destructive animate-pulse" />
              )}
            </Button>

            {/* Reset Filters Button */}
            {hasActiveFilters && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="h-9 text-xs text-muted-foreground hover:text-foreground gap-1 px-2.5"
                title="Reset semua filter"
              >
                <RotateCcw className="size-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </Button>
            )}

            {/* Total Task Count Pill */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-muted/60 border text-3xs font-mono text-muted-foreground shrink-0 ml-auto">
              <span>{totalTasks} Task</span>
            </div>
          </div>
        </div>
      </div>

      {/* Board Canvas */}
      {isBoardLoading ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex-1 min-w-67.5 h-96 rounded-xl border border-border/60 bg-card p-4 animate-pulse space-y-3"
            >
              <div className="h-4 w-24 bg-muted rounded" />
              <div className="h-28 w-full bg-muted rounded-lg" />
              <div className="h-28 w-full bg-muted rounded-lg" />
            </div>
          ))}
        </div>
      ) : error || !board ? (
        <div className="p-8 text-center rounded-xl border border-destructive/20 bg-destructive/5">
          <p className="text-sm font-medium text-destructive">
            Gagal memuat papan Kanban divisi.
          </p>
        </div>
      ) : (
        <KanbanBoard
          columns={board}
          divisionId={division.id}
          isCoordinatorOrAdmin={isCoordinator}
          swimlaneMode={swimlaneMode}
        />
      )}
    </div>
  );
}
