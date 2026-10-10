'use client';

import { useMemo } from 'react';
import { Users, Layers, GitPullRequest, Target } from 'lucide-react';
import { useUsers } from '@/features/users/api/use-queries';
import { useDivisions } from '@/features/divisions/api/use-queries';
import { useRequests } from '@/features/requests/api/use-queries';
import { useEpics } from '@/features/epics/api/use-queries';
import { StatCard } from './stat-card';
import { StackedBar } from './stacked-bar';
import { REQUEST_STATUS_BAR_CONFIG, ACTIVE_REQUEST_STATUSES } from '../lib/request-status-config';

export function OrgOverviewWidget() {
  const { data: users = [], isLoading: isUsersLoading } = useUsers();
  const { data: divisions = [], isLoading: isDivisionsLoading } = useDivisions();
  const { data: requests = [], isLoading: isRequestsLoading } = useRequests({ direction: 'all' });
  const { data: epics = [], isLoading: isEpicsLoading } = useEpics({ isClosed: false });

  const isLoading = isUsersLoading || isDivisionsLoading || isRequestsLoading || isEpicsLoading;

  const activeUsers = useMemo(() => users.filter((u) => u.status === 'ACTIVE').length, [users]);
  const activeRequests = useMemo(
    () => requests.filter((r) => ACTIVE_REQUEST_STATUSES.includes(r.status)),
    [requests]
  );
  const requestSegments = useMemo(
    () =>
      REQUEST_STATUS_BAR_CONFIG.map((c) => ({
        key: c.status,
        value: requests.filter((r) => r.status === c.status).length,
        colorClass: c.bar,
        label: c.label,
      })),
    [requests]
  );

  return (
    <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-2xs">
      <h3 className="text-sm font-semibold text-foreground">Ringkasan Organisasi</h3>

      {isLoading ? (
        <div className="mt-4 grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-4 animate-pulse">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-muted" />
          ))}
        </div>
      ) : (
        <>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-4">
            <StatCard icon={Users} label="User Aktif" value={activeUsers} />
            <StatCard icon={Layers} label="Divisi" value={divisions.length} />
            <StatCard icon={GitPullRequest} label="Request Aktif" value={activeRequests.length} tone="warning" />
            <StatCard icon={Target} label="Epic Aktif" value={epics.length} />
          </div>

          <div className="mt-4 space-y-2">
            <StackedBar segments={requestSegments} />
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-2xs text-muted-foreground">
              {REQUEST_STATUS_BAR_CONFIG.map((c) => (
                <span key={c.status} className="flex items-center gap-1">
                  <span className={`size-1.5 rounded-full ${c.bar}`} />
                  {c.label}: {requests.filter((r) => r.status === c.status).length}
                </span>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
