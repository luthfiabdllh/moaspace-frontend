import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RequestStatusBadge } from './request-status-badge';
import type { RequestEventItem } from '../types';

interface RequestTimelineProps {
  events: RequestEventItem[];
}

export function RequestTimeline({ events }: RequestTimelineProps) {
  if (!events || events.length === 0) {
    return (
      <div className="py-6 text-center text-sm text-muted-foreground">
        Belum ada riwayat aktivitas pada permohonan ini.
      </div>
    );
  }

  const formatTimestamp = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(d);
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-muted">
      {events.map((ev, index) => {
        const initials = ev.actorName
          ? ev.actorName
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2)
          : 'U';

        return (
          <div key={ev.id || index} className="relative group">
            {/* Timeline dot */}
            <div className="absolute -left-[27px] top-1 h-3.5 w-3.5 rounded-full border-2 border-background bg-primary ring-2 ring-primary/20" />

            <div className="flex flex-col gap-1 rounded-lg border bg-card p-3 shadow-xs">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={ev.actorAvatar || ''} />
                    <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-semibold text-foreground">
                    {ev.actorName}
                  </span>
                </div>
                <span className="text-[11px] text-muted-foreground">
                  {formatTimestamp(ev.createdAt)}
                </span>
              </div>

              <div className="flex items-center gap-1.5 pt-1">
                <span className="text-xs text-muted-foreground">Status beralih ke:</span>
                <RequestStatusBadge status={ev.toStatus} />
              </div>

              {ev.note && (
                <p className="mt-1 text-xs text-muted-foreground bg-muted/40 p-2 rounded border border-border/40 whitespace-pre-wrap">
                  {ev.note}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
