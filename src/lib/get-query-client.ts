import { QueryClient, defaultShouldDehydrateQuery } from '@tanstack/react-query';
import { cache } from 'react';

/**
 * Creates a new QueryClient with enterprise-grade defaults.
 *
 * Key defaults:
 * - staleTime: 60s — prevents refetch on every component mount
 * - dehydrate.shouldDehydrateQuery: also includes pending queries so RSC
 *   prefetching works correctly with Suspense streaming
 */
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // With SSR, set a staleTime above 0 to avoid refetching immediately on the client
        staleTime: 60 * 1000,
        // Disable retries during SSR to fail fast
        retry: false,
      },
      dehydrate: {
        // Include pending queries in dehydrated state so Suspense boundaries work
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) || query.state.status === 'pending',
      },
    },
  });
}

/**
 * Returns a singleton QueryClient per React request tree.
 *
 * Wrapped with React `cache()` to ensure only one instance is created per
 * server request (not per component render). This prevents duplicate
 * QueryClient instances and race conditions in SSR.
 *
 * IMPORTANT: Never call `new QueryClient()` directly in a Server Component.
 * Always use this function.
 */
export const getQueryClient = cache(makeQueryClient);
