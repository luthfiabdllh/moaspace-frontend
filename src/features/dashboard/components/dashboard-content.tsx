'use client';

import { useMemo } from 'react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { useCurrentUser } from '@/features/auth/api/use-queries';
import { MyTasksWidget } from './my-tasks-widget';
import { MyCapacityWidget } from './my-capacity-widget';
import { DivisionSummaryWidget } from './division-summary-widget';
import { IncomingActionsWidget } from './incoming-actions-widget';
import { OrgOverviewWidget } from './org-overview-widget';
import { ActivityFeedWidget } from './activity-feed-widget';
import { DashboardAnnouncementsWidget } from './dashboard-announcements-widget';

export function DashboardContent() {
  const { data: user } = useCurrentUser();

  const coordinatedDivisionIds = useMemo(
    () => user?.divisions?.filter((d) => d.role === 'COORDINATOR').map((d) => d.divisionId) ?? [],
    [user]
  );
  const isOrgAdmin = Boolean(user?.isSuperAdmin || user?.isKormanit);
  const isCoordinator = coordinatedDivisionIds.length > 0;

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Welcome Banner */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Halo, {user?.name ?? 'Pengguna'}!
        </h1>
        <p className="text-muted-foreground mt-1 text-sm capitalize">
          {format(new Date(), 'EEEE, d MMMM yyyy', { locale: idLocale })}
        </p>
      </div>

      {/* Announcements & Agenda Widget */}
      <DashboardAnnouncementsWidget />

      {/* Personal Section */}
      <div className="grid gap-4 md:grid-cols-2">
        <MyTasksWidget />
        <MyCapacityWidget />
      </div>

      {/* Coordinator Section */}
      {isCoordinator && (
        <div className="grid gap-4 md:grid-cols-2">
          <DivisionSummaryWidget divisionIds={coordinatedDivisionIds} />
          <IncomingActionsWidget />
        </div>
      )}

      {/* Org Admin Section */}
      {isOrgAdmin && (
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <OrgOverviewWidget />
          </div>
          <ActivityFeedWidget />
        </div>
      )}
    </div>
  );
}
