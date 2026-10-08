'use client';

import { useState } from 'react';
import { CheckSquare, Search, Filter, ShieldAlert, Sparkles, Layers } from 'lucide-react';
import { useCurrentUser } from '@/features/auth/api/use-queries';
import { useMeTasks } from '@/features/kanban/api/use-queries';
import { KanbanBoard } from '@/features/kanban/components/kanban-board';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import type { TaskItem } from '@/features/tasks/types';

export default function MyTasksPage() {
  const { data: user } = useCurrentUser();
  const { data: board, isLoading, error } = useMeTasks();

  const [searchQuery, setSearchQuery] = useState('');
  const [onlyBlocked, setOnlyBlocked] = useState(false);

  const filteredBoard = board
    ? {
        BACKLOG: board.BACKLOG.filter(filterTask),
        TODO: board.TODO.filter(filterTask),
        IN_PROGRESS: board.IN_PROGRESS.filter(filterTask),
        REVIEW: board.REVIEW.filter(filterTask),
        DONE: board.DONE.filter(filterTask),
      }
    : null;

  function filterTask(t: TaskItem) {
    if (onlyBlocked && !t.isBlocked) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchStory = t.storyTitle?.toLowerCase().includes(q);
      if (!matchTitle && !matchStory) return false;
    }
    return true;
  }

  const totalTasks = board
    ? Object.values(board).reduce((acc, tasks) => acc + tasks.length, 0)
    : 0;

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <CheckSquare className="size-6 text-primary" />
              Tugas Saya
            </h1>
            <Badge variant="outline" className="font-mono text-xs">
              {totalTasks} Task Ditugaskan
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Papan Kanban pribadi lintas seluruh divisi yang Anda ikuti. Geser kartu untuk memperbarui status pengerjaan.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-card p-3 rounded-xl border border-border/80 shadow-2xs">
        <div className="relative flex-1 min-w-60">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari tugas saya..."
            className="pl-9 h-9 text-sm"
          />
        </div>

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

      {/* Board Canvas */}
      {isLoading ? (
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
      ) : error || !filteredBoard ? (
        <div className="p-8 text-center rounded-xl border border-destructive/20 bg-destructive/5">
          <p className="text-sm font-medium text-destructive">
            Gagal memuat tugas saya.
          </p>
        </div>
      ) : (
        <KanbanBoard
          columns={filteredBoard}
          isCoordinatorOrAdmin={false}
          swimlaneMode="STORY"
        />
      )}
    </div>
  );
}
