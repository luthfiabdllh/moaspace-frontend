import type { User } from './types';

/**
 * Determines redirect route post-login:
 * All authenticated users (Super Admin, Koordinator, and Members) redirect to /dashboard.
 */
export function getPostLoginRedirect(_user?: User): string {
  return '/dashboard';
}

