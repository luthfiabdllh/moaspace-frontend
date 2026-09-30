import 'server-only';
import { cookies } from 'next/headers';
import type { User } from '../types';

const BACKEND_API_URL = process.env.BACKEND_API_URL ?? 'http://localhost:8000';

/**
 * Fetches the current user from the backend.
 *
 * STRICT RULE: Use ONLY in Server Components and RSC prefetchers.
 * For Client Components, use `useCurrentUser` hook from `use-queries.ts`.
 *
 * Uses native `fetch` (not Axios) to leverage Next.js data cache and deduplication.
 */
export async function getCurrentUserServer(): Promise<User | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;

  if (!token) return null;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

    const response = await fetch(`${BACKEND_API_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // User data should always be fresh
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) return null;

    const data = await response.json();
    return data as User;
  } catch {
    return null;
  }
}
