'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { authKeys } from './query-keys';
import { toast } from 'sonner';
import type { LoginDTO, User, AuthResponse } from '../types';

// ─── Login ────────────────────────────────────────────────────────────────

/**
 * Login mutation — calls the BFF Route Handler which sets the httpOnly cookie.
 * On success, populates the currentUser cache.
 */
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: LoginDTO): Promise<AuthResponse> => {
      const { data } = await apiClient.post<AuthResponse>('/auth/login', credentials);
      return data;
    },
    onSuccess: (response) => {
      if (response.success && response.data?.user) {
        // Populate the cache immediately — no extra round trip needed
        queryClient.setQueryData<User>(authKeys.currentUser(), response.data.user);
      }
    },
    onError: () => {
      // Error display is handled by the form component via mutation state
    },
  });
};

// ─── Logout ────────────────────────────────────────────────────────────────

/**
 * Logout mutation — calls the BFF Route Handler which clears httpOnly cookies.
 * On success, invalidates all auth-related cache entries.
 */
export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<void> => {
      await apiClient.post('/auth/logout');
    },
    onSuccess: () => {
      // Clear all auth-related queries from cache
      queryClient.removeQueries({ queryKey: authKeys.all });
      toast.success('You have been signed out.');

      // Redirect to login
      window.location.href = '/login';
    },
    onError: () => {
      toast.error('Failed to sign out. Please try again.');
    },
  });
};
