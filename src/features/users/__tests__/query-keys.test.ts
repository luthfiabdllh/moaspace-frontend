import { describe, it, expect } from 'vitest';
import { userKeys, divisionKeys } from '@/features/users/api/query-keys';

describe('userKeys query factory', () => {
  it('userKeys.all is ["users"]', () => {
    expect(userKeys.all).toEqual(['users']);
  });

  it('userKeys.list() starts with userKeys.all', () => {
    const key = userKeys.list();
    expect(key[0]).toBe('users');
    expect(key).toContain('list');
  });

  it('userKeys.detail(id) contains id', () => {
    const key = userKeys.detail('user-123');
    expect(key).toEqual(['users', 'detail', 'user-123']);
  });
});

describe('divisionKeys query factory', () => {
  it('divisionKeys.all is ["divisions"]', () => {
    expect(divisionKeys.all).toEqual(['divisions']);
  });
});
