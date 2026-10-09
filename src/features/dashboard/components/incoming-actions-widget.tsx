'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { GitPullRequest, ArrowRight } from 'lucide-react';
import { useRequests } from '@/features/requests/api/use-queries';
import { RequestStatusBadge } from '@/features/requests/components/request-status-badge';
import { formatRelativeTime } from '../lib/relative-time';
import type { RequestListItem, RequestStatus } from '@/features/requests/types';

const INCOMING_ACTIONABLE: RequestStatus[] = ['SUBMITTED', 'ACCEPTED', 'IN_PROGRESS'];
const OUTGOING_ACTIONABLE: RequestStatus[] = ['WAITING_ORIGIN_APPROVAL', 'NEED_INFO', 'DELIVERED'];

export function IncomingActionsWidget() {
  const { data: incoming = [], isLoading: isIncomingLoading } = useRequests({ direction: 'incoming' });
  const { data: outgoing = [], isLoading: isOutgoingLoading } = useRequests({ direction: 'outgoing' });

  const actionable = useMemo(() => {
    const items: RequestListItem[] = [
      ...incoming.filter((r) => INCOMING_ACTIONABLE.includes(r.status)),
      ...outgoing.filter((r) => OUTGOING_ACTIONABLE.includes(r.status)),
    ];
    return items.sort(
      (a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
    );
  }, [incoming, outgoing]);

  const isLoading = isIncomingLoading || isOutgoingLoading;

  return (
    <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-2xs">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <GitPullRequest className="size-4" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">Request Perlu Aksi</h3>
          {actionable.length > 0 && (
            <span className="flex size-5 items-center justify-center rounded-full bg-rose-500 text-2xs font-bold text-white">
              {actionable.length}
            </span>
          )}
        </div>
        <Link
          href="/requests"
          className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Lihat semua <ArrowRight className="size-3" />
        </Link>
      </div>

      <div className="mt-3 space-y-1.5">
        {isLoading ? (
          <div className="space-y-2 animate-pulse">
            <div className="h-11 w-full rounded-lg bg-muted" />
            <div className="h-11 w-full rounded-lg bg-muted" />
          </div>
        ) : actionable.length === 0 ? (
          <p className="py-4 text-center text-xs text-muted-foreground">
            Tidak ada request yang menunggu aksi Anda.
          </p>
        ) : (
          actionable.slice(0, 5).map((r) => (
            <Link
              key={r.id}
              href={`/requests/${r.id}`}
              className="flex items-center justify-between gap-2 rounded-lg border border-border/60 bg-muted/20 p-2.5 hover:bg-muted/40 transition-colors"
            >
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-foreground">{r.title}</p>
                <p className="truncate text-2xs text-muted-foreground">
                  {r.fromDivisionName} → {r.toDivisionName} · {formatRelativeTime(r.updatedAt)}
                </p>
              </div>
              <RequestStatusBadge status={r.status} className="shrink-0 text-2xs" />
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
