'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  FolderKanban,
  Bookmark,
  Search,
  Filter,
  Layers,
  Sparkles,
  ShieldAlert,
  Columns,
  X,
  Plus,
  Award,
} from 'lucide-react';
import { useDivisions } from '@/features/divisions/api/use-queries';
import { useCurrentUser } from '@/features/auth/api/use-queries';
import { useDivisionBoard } from '../api/use-queries';
import { KanbanBoard } from './kanban-board';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import type { SwimlaneMode } from '../types';

interface DivisionBoardContentProps {
  divisionSlug: string;
}

export function DivisionBoardContent({ divisionSlug }: DivisionBoardContentProps) {
  const { data: user } = useCurrentUser();
  const { data: divisions = [], isLoading: isDivisionsLoading } = useDivisions();

  const division = useMemo(() => {
    return divisions.find((d) => d.slug === divisionSlug);
  }, [divisions, divisionSlug]);

  const divisionId = division?.id;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');
  const [onlyBlocked, setOnlyBlocked] = useState(false);
  const [swimlaneMode, setSwimlaneMode] = useState<SwimlaneMode>('NONE');

  // Query board with filters
  const { data: board, isLoading: isBoardLoading, error } = useDivisionBoard(
    divisionId || '',
    {
      priority: selectedPriority !== 'ALL' ? (selectedPriority as any) : undefined,
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
    <div className="space-y-6">
      {/* Top Header & View Switcher */}
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
                Papan Kerja Kanban Interaktif • {totalTasks} Total Task
              </p>
            </div>
          </div>
        </div>

        {/* View Switcher: Stories vs Kanban */}
        <div className="flex items-center rounded-lg border bg-muted/40 p-1 text-xs font-medium shrink-0">
          <Link
            href={`/d/${divisionSlug}/stories`}
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

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-card p-3 rounded-xl border border-border/80 shadow-2xs">
        {/* Search */}
        <div className="relative flex-1 min-w-60">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari task di papan..."
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
          {/* Priority Selector */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="h-9 rounded-lg border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="ALL">Semua Prioritas</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>

          {/* Swimlane Selector */}
          <select
            value={swimlaneMode}
            onChange={(e) => setSwimlaneMode(e.target.value as SwimlaneMode)}
            className="h-9 rounded-lg border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="NONE">Swimlane: Tanpa Grup</option>
            <option value="STORY">Swimlane: Per Story</option>
            <option value="ASSIGNEE">Swimlane: Per Assignee</option>
          </select>

          {/* Blocked Only Toggle */}
          <button
            onClick={() => setOnlyBlocked(!onlyBlocked)}
            className={`flex items-center gap-1.5 h-9 px-3 rounded-lg border text-xs font-medium transition-colors ${
              onlyBlocked
                ? 'bg-rose-50 border-rose-300 text-rose-700 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300'
                : 'bg-background text-muted-foreground hover:text-foreground'
            }`}
          >
            <ShieldAlert className="size-3.5" />
            Terkendala Saja
          </button>
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
