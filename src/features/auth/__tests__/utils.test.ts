import { describe, expect, it } from 'vitest';
import { getPostLoginRedirect } from '../utils';
import type { User } from '../types';

describe('getPostLoginRedirect', () => {
  it('should redirect super admin to /dashboard', () => {
    const adminUser: User = {
      id: 'admin-1',
      email: 'admin@moaspace.com',
      name: 'Super Admin',
      isSuperAdmin: true,
      status: 'ACTIVE',
      role: 'admin',
      divisions: [],
    };

    expect(getPostLoginRedirect(adminUser)).toBe('/dashboard');
  });

  it('should redirect division coordinator to their division board', () => {
    const coordinatorUser: User = {
      id: 'coord-1',
      email: 'coord@moaspace.com',
      name: 'Koordinator Sponsorship',
      isSuperAdmin: false,
      status: 'ACTIVE',
      role: 'user',
      divisions: [
        {
          divisionId: 'div-1',
          divisionName: 'Sponsorship',
          divisionSlug: 'sponsorship',
          role: 'COORDINATOR',
        },
      ],
    };

    expect(getPostLoginRedirect(coordinatorUser)).toBe('/d/sponsorship/board');
  });

  it('should redirect member to /me (Tugas Saya)', () => {
    const memberUser: User = {
      id: 'mem-1',
      email: 'member@moaspace.com',
      name: 'Member Media Kreatif',
      isSuperAdmin: false,
      status: 'ACTIVE',
      role: 'user',
      divisions: [
        {
          divisionId: 'div-2',
          divisionName: 'Media Kreatif',
          divisionSlug: 'media-kreatif',
          role: 'MEMBER',
        },
      ],
    };

    expect(getPostLoginRedirect(memberUser)).toBe('/me');
  });

  it('should fallback to /dashboard if user has no divisions', () => {
    const userWithoutDivs: User = {
      id: 'u-1',
      email: 'user@moaspace.com',
      name: 'Unassigned User',
      isSuperAdmin: false,
      status: 'ACTIVE',
      role: 'user',
      divisions: [],
    };

    expect(getPostLoginRedirect(userWithoutDivs)).toBe('/dashboard');
  });
});
