import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/get-query-client';
import { verifySession } from '@/lib/verify-session';
import { authKeys } from '@/features/auth/api/query-keys';
import { getCurrentUserServer } from '@/features/auth/api/server-fetch';
import { DashboardHeader } from '@/components/layouts/dashboard-header';
import { DashboardSidebar } from '@/components/layouts/dashboard-sidebar';

export default async function DashboardPage() {
  const [session, queryClient] = await Promise.all([
    verifySession(),
    Promise.resolve(getQueryClient()),
  ]);

  const userName = typeof session?.name === 'string' ? session.name : 'User';

  // Prefetch the current user data so the client gets it without a loading state
  await queryClient.prefetchQuery({
    queryKey: authKeys.currentUser(),
    queryFn: getCurrentUserServer,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="flex h-screen overflow-hidden">
        <DashboardSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <DashboardHeader userName={userName} />
          <main
            id="main-content"
            className="flex-1 overflow-y-auto p-6"
            aria-label="Dashboard main content"
          >
            {/* Welcome Banner */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight">
                Welcome back, {userName}!
              </h1>
              <p className="text-muted-foreground mt-1">
                {new Intl.DateTimeFormat('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                }).format(new Date())}
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[
                { label: 'Total Users', value: '—', change: '+12%' },
                { label: 'Active Sessions', value: '—', change: '+4%' },
                { label: 'Requests Today', value: '—', change: '+8%' },
                { label: 'Error Rate', value: '—', change: '-2%' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-card text-card-foreground rounded-lg border p-5 shadow-sm"
                >
                  <p className="text-muted-foreground text-sm font-medium">
                    {stat.label}
                  </p>
                  <p className="mt-1 text-2xl font-bold">{stat.value}</p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    {stat.change} from last period
                  </p>
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>
    </HydrationBoundary>
  );
}
