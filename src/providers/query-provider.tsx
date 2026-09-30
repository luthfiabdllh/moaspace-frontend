'use client';

import { useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { getQueryClient } from '@/lib/get-query-client';

interface QueryProviderProps {
  children: React.ReactNode;
}

/**
 * TanStack Query Provider for Client Components.
 *
 * Uses `useState` to ensure the QueryClient is only created once per
 * client-side render, not on every re-render.
 */
export function QueryProvider({ children }: QueryProviderProps) {
  // NOTE: Do NOT use getQueryClient() here. That's for Server Components.
  // On the client, we need a stable instance via useState.
  const [queryClient] = useState(
    () =>
      getQueryClient() // Safe to call — returns a new instance on the client
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
