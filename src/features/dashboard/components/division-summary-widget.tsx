'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { FolderKanban, Users, ArrowRight } from 'lucide-react';
import { useCoordinatorOverview } from '../api/use-coordinator-overview';
import { TASK_STATUS_CONFIG } from '../lib/task-status-config';
import { StackedBar } from './stacked-bar';

export function DivisionSummaryWidget({ divisionIds }: { divisionIds: string[] }) {
  const { board, overcapacityCount, isLoading } = useCoordinatorOverview(divisionIds);

  const segments = useMemo(
    () =>
      TASK_STATUS_CONFIG.map((c) => ({
        key: c.status,
        value: board[c.status]?.length ?? 0,
        colorClass: c.bar,
        label: c.label,
      })),
    [board]
  );

  const total = segments.reduce((sum, s) => sum + s.value, 0);

  return (
    <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-2xs">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            <FolderKanban className="size-4" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">
            {divisionIds.length > 1 ? 'Ringkasan Divisi Saya' : 'Ringkasan Divisi'}
          </h3>
        </div>
        <Link
          href="/board?tab=kanban"
          className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Lihat papan <ArrowRight className="size-3" />
        </Link>
      </div>

      {isLoading ? (
        <div className="mt-4 space-y-2 animate-pulse">
          <div className="h-2.5 w-full rounded-full bg-muted" />
          <div className="h-8 w-full rounded-lg bg-muted" />
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          <StackedBar segments={segments} />
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-2xs text-muted-foreground">
            {TASK_STATUS_CONFIG.map((c) => (
              <span key={c.status} className="flex items-center gap-1">
                <span className={`size-1.5 rounded-full ${c.dot}`} />
                {c.label}: {board[c.status]?.length ?? 0}
              </span>
            ))}
          </div>
          <div className="flex items-center justify-between border-t border-border/60 pt-2.5">
            <span className="text-xs text-muted-foreground">{total} task aktif & selesai</span>
            {overcapacityCount > 0 ? (
              <Link
                href="/board?tab=CAPACITY"
                className="flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-2xs font-medium text-rose-600 dark:text-rose-400"
              >
                <Users className="size-3" />
                {overcapacityCount} anggota overload
              </Link>
            ) : (
              <span className="flex items-center gap-1.5 text-2xs text-muted-foreground">
                <Users className="size-3" />
                Kapasitas tim normal
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
