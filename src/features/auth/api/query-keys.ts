/**
 * Auth Query Key Factory — single source of truth for all auth-related query keys.
 *
 * Import this in BOTH server-side prefetchers AND client-side hooks to ensure
 * they share the same cache entry.
 *
 * Usage:
 * ```ts
 * // Server (RSC prefetch):
 * await queryClient.prefetchQuery({ queryKey: authKeys.currentUser(), ... })
 *
 * // Client (hook):
 * useQuery({ queryKey: authKeys.currentUser(), ... })
 * ```
 */
export const authKeys = {
  all: ['auth'] as const,

  /**
   * Current authenticated user
   */
  currentUser: () => [...authKeys.all, 'current-user'] as const,

  /**
   * Auth session status (used for checking if user is logged in)
   */
  session: () => [...authKeys.all, 'session'] as const,
} as const;
