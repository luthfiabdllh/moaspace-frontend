import axios from 'axios';

/**
 * Shared "in-flight" refresh promise.
 *
 * When multiple requests get 401 simultaneously, only ONE refresh request is
 * made. All other 401 responses wait on the same promise instead of
 * triggering parallel refresh calls (race condition guard).
 */
let refreshPromise: Promise<void> | null = null;

/**
 * Calls the /api/auth/refresh Route Handler to refresh the access token.
 * The Route Handler sets a new httpOnly cookie — no token is returned to JS.
 */
async function refreshAccessToken(): Promise<void> {
  await axios.post('/api/auth/refresh', null, {
    // Prevent the interceptor from catching this call's 401 in an infinite loop
    headers: { 'X-Refresh-Request': '1' },
  });
}

/**
 * Central Axios instance for all Client Component API calls.
 *
 * STRICT RULES (from PRD):
 * - Use ONLY in Client Components and TanStack Query hooks
 * - NEVER use in Server Components or Route Handlers (use native fetch there)
 * - Base URL points to the Next.js BFF layer (/api/...), not the backend directly
 */
export const apiClient = axios.create({
  baseURL: typeof window !== 'undefined'
    ? `${window.location.origin}/api`
    : process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Required so httpOnly cookies are sent
});

// ─── Request Interceptor ───────────────────────────────────────────────────
apiClient.interceptors.request.use((config) => {
  // Tokens are in httpOnly cookies — no Authorization header needed for browser requests.
  // The BFF Route Handler reads the cookie via next/headers and forwards to backend.
  return config;
});

// ─── Response Interceptor (Refresh Token Flow) ────────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only attempt refresh once per request, and not for refresh requests themselves
    const isRefreshRequest = originalRequest?.headers?.['X-Refresh-Request'];
    if (
      error.response?.status === 401 &&
      !originalRequest?._retry &&
      !isRefreshRequest
    ) {
      originalRequest._retry = true;

      // Share the refresh promise across concurrent 401 responses
      refreshPromise ??= refreshAccessToken().finally(() => {
        refreshPromise = null;
      });

      try {
        await refreshPromise;
        // Retry the original request — the new cookie is now set
        return apiClient(originalRequest);
      } catch {
        // Refresh failed — redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);
