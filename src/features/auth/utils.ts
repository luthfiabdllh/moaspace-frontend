import type { User } from './types';

/**
 * Determines redirect route based on PRD Phase 1 Workflow 1:
 * - Super admin -> Dashboard lintas divisi (/dashboard)
 * - Koordinator divisi -> Board divisinya (/d/[slug]/board)
 * - Member -> Tugas Saya (/me)
 */
export function getPostLoginRedirect(user: User): string {
  if (user.isSuperAdmin || user.isKormanit) {
    return '/dashboard';
  }

  const coordinatorDiv = user.divisions?.find((d) => d.role === 'COORDINATOR');
  if (coordinatorDiv?.divisionSlug) {
    return `/d/${coordinatorDiv.divisionSlug}/board`;
  }

  if (user.divisions && user.divisions.length > 0) {
    return '/me';
  }

  return '/dashboard';
}
