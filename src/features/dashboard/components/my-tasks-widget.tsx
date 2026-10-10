'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { CheckSquare, AlertTriangle, Clock, Ban, ArrowRight } from 'lucide-react';
import { useMeTasks } from '@/features/kanban/api/use-queries';
import { TASK_STATUS_CONFIG } from '../lib/task-status-config';
import { StackedBar } from './stacked-bar';

export function MyTasksWidget() {
  const { data: board, isLoading } = useMeTasks();

  const stats = useMemo(() => {
    if (!board) return null;

    const allTasks = Object.values(board).flat();
    const now = new Date().getTime();
    const soonThreshold = now + 3 * 24 * 60 * 60 * 1000;

    let overdue = 0;
    let dueSoon = 0;
    let blocked = 0;

    for (const task of allTasks) {
      if (task.status !== 'DONE' && task.dueDate) {
        const due = new Date(task.dueDate).getTime();
        if (due < now) overdue++;
        else if (due <= soonThreshold) dueSoon++;
      }
      if (task.isBlocked) blocked++;
    }

    const segments = TASK_STATUS_CONFIG.map((c) => ({
      key: c.status,
      value: board[c.status]?.length ?? 0,
      colorClass: c.bar,
      label: c.label,
    }));

    return { total: allTasks.length, overdue, dueSoon, blocked, segments };
  }, [board]);

  return (
    <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-2xs">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
            <CheckSquare className="size-4" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">Tugas Saya</h3>
        </div>
        <Link
          href="/my-tasks"
          className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Lihat semua <ArrowRight className="size-3" />
        </Link>
      </div>

      {isLoading || !stats ? (
        <div className="mt-4 space-y-2 animate-pulse">
          <div className="h-2.5 w-full rounded-full bg-muted" />
          <div className="h-8 w-full rounded-lg bg-muted" />
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          <StackedBar segments={stats.segments} />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{stats.total} total tugas aktif</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
            <div
              className={
                'flex flex-col items-center gap-0.5 rounded-lg border p-1.5 sm:p-2 text-center min-w-0 ' +
                (stats.overdue > 0
                  ? 'border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400'
                  : 'border-border/60 bg-muted/30 text-muted-foreground')
              }
            >
              <AlertTriangle className="size-3.5" />
              <span className="text-xs sm:text-sm font-bold">{stats.overdue}</span>
              <span className="text-3xs sm:text-2xs truncate max-w-full">Terlambat</span>
            </div>
            <div
              className={
                'flex flex-col items-center gap-0.5 rounded-lg border p-1.5 sm:p-2 text-center min-w-0 ' +
                (stats.dueSoon > 0
                  ? 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                  : 'border-border/60 bg-muted/30 text-muted-foreground')
              }
            >
              <Clock className="size-3.5" />
              <span className="text-xs sm:text-sm font-bold">{stats.dueSoon}</span>
              <span className="text-3xs sm:text-2xs truncate max-w-full">Jatuh Tempo</span>
            </div>
            <div
              className={
                'flex flex-col items-center gap-0.5 rounded-lg border p-1.5 sm:p-2 text-center min-w-0 ' +
                (stats.blocked > 0
                  ? 'border-zinc-500/30 bg-zinc-500/10 text-zinc-600 dark:text-zinc-400'
                  : 'border-border/60 bg-muted/30 text-muted-foreground')
              }
            >
              <Ban className="size-3.5" />
              <span className="text-xs sm:text-sm font-bold">{stats.blocked}</span>
              <span className="text-3xs sm:text-2xs truncate max-w-full">Terblokir</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
