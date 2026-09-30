'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { authKeys } from './query-keys';
import type { User } from '../types';

/**
 * Fetches the currently authenticated user.
 *
 * Data is pre-populated via RSC prefetch + HydrationBoundary in the dashboard layout.
 * On client, uses the BFF Route Handler `/api/auth/me` (not the backend directly).
 */
export const useCurrentUser = () => {
  return useQuery({
    queryKey: authKeys.currentUser(),
    queryFn: async (): Promise<User | null> => {
      try {
        const { data } = await apiClient.get<{ data: User }>('/auth/me');
        return data.data;
      } catch {
        return null;
      }
    },
    // Don't refetch too aggressively for user profile data
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
