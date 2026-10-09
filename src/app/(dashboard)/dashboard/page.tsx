import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/get-query-client';
import { authKeys } from '@/features/auth/api/query-keys';
import { getCurrentUserServer } from '@/features/auth/api/server-fetch';
import { DashboardContent } from '@/features/dashboard/components/dashboard-content';

export default async function DashboardPage() {
  const queryClient = getQueryClient();

  // Prefetch the current user data so the client gets it without a loading state
  await queryClient.prefetchQuery({
    queryKey: authKeys.currentUser(),
    queryFn: getCurrentUserServer,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DashboardContent />
    </HydrationBoundary>
  );
}
