'use client';

import { Activity } from 'lucide-react';
import { useActivityLogs } from '@/features/users/api/use-queries';
import { formatRelativeTime, prettifyActionLabel } from '../lib/relative-time';

export function ActivityFeedWidget() {
  const { data: logs = [], isLoading } = useActivityLogs();
  const recentLogs = logs.slice(0, 8);

  return (
    <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-2xs">
      <div className="flex items-center gap-2">
        <div className="flex size-8 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">
          <Activity className="size-4" />
        </div>
        <h3 className="text-sm font-semibold text-foreground">Aktivitas Terbaru</h3>
      </div>

      <div className="mt-3 space-y-1">
        {isLoading ? (
          <div className="space-y-2 animate-pulse">
            <div className="h-9 w-full rounded-lg bg-muted" />
            <div className="h-9 w-full rounded-lg bg-muted" />
            <div className="h-9 w-full rounded-lg bg-muted" />
          </div>
        ) : recentLogs.length === 0 ? (
          <p className="py-4 text-center text-xs text-muted-foreground">Belum ada aktivitas tercatat.</p>
        ) : (
          recentLogs.map((log) => (
            <div key={log.id} className="flex items-center justify-between gap-2 rounded-lg px-1.5 py-1.5 hover:bg-muted/30">
              <p className="min-w-0 truncate text-xs text-foreground">
                <span className="font-medium">{log.actorName || 'Sistem'}</span>
                <span className="text-muted-foreground"> · {prettifyActionLabel(log.action)}</span>
              </p>
              <span className="shrink-0 text-2xs text-muted-foreground">{formatRelativeTime(log.createdAt)}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
