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
      isKormanit: false,
      status: 'ACTIVE',
      role: 'admin',
      divisions: [],
    };

    expect(getPostLoginRedirect(adminUser)).toBe('/dashboard');
  });

  it('should redirect kormanit to /dashboard like super admin', () => {
    const kormanitUser: User = {
      id: 'kormanit-1',
      email: 'kormanit@moaspace.com',
      name: 'Kormanit Unit KKN',
      isSuperAdmin: false,
      isKormanit: true,
      status: 'ACTIVE',
      role: 'kormanit',
      divisions: [],
    };

    expect(getPostLoginRedirect(kormanitUser)).toBe('/dashboard');
  });

  it('should redirect division coordinator to /dashboard', () => {
    const coordinatorUser: User = {
      id: 'coord-1',
      email: 'coord@moaspace.com',
      name: 'Koordinator Sponsorship',
      isSuperAdmin: false,
      isKormanit: false,
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

    expect(getPostLoginRedirect(coordinatorUser)).toBe('/dashboard');
  });

  it('should redirect member to /dashboard', () => {
    const memberUser: User = {
      id: 'mem-1',
      email: 'member@moaspace.com',
      name: 'Member Media Kreatif',
      isSuperAdmin: false,
      isKormanit: false,
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

    expect(getPostLoginRedirect(memberUser)).toBe('/dashboard');
  });

  it('should redirect unassigned user to /dashboard', () => {
    const userWithoutDivs: User = {
      id: 'u-1',
      email: 'user@moaspace.com',
      name: 'Unassigned User',
      isSuperAdmin: false,
      isKormanit: false,
      status: 'ACTIVE',
      role: 'user',
      divisions: [],
    };

    expect(getPostLoginRedirect(userWithoutDivs)).toBe('/dashboard');
  });
});

