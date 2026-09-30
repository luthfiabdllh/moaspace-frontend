import { describe, it, expect } from 'vitest';
import { authKeys } from '@/features/auth/api/query-keys';

describe('authKeys query factory', () => {
  it('authKeys.all is ["auth"]', () => {
    expect(authKeys.all).toEqual(['auth']);
  });

  it('authKeys.currentUser() starts with authKeys.all', () => {
    const key = authKeys.currentUser();
    expect(key[0]).toBe('auth');
    expect(key).toContain('current-user');
  });

  it('authKeys.session() starts with authKeys.all', () => {
    const key = authKeys.session();
    expect(key[0]).toBe('auth');
    expect(key).toContain('session');
  });

  it('returns stable (same) arrays each call', () => {
    const key1 = authKeys.currentUser();
    const key2 = authKeys.currentUser();
    expect(key1).toEqual(key2);
  });
});
