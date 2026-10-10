import { describe, it, expect } from 'vitest';
import { programKeys } from '../api/query-keys';

describe('programKeys', () => {
  it('generates correct base all key', () => {
    expect(programKeys.all).toEqual(['programs']);
  });

  it('generates correct lists key', () => {
    expect(programKeys.lists()).toEqual(['programs', 'list']);
  });

  it('generates correct list key with filters', () => {
    expect(programKeys.list({ scope: 'UNIT', cluster: 'SAINTEK' })).toEqual([
      'programs',
      'list',
      { scope: 'UNIT', cluster: 'SAINTEK' },
    ]);
  });

  it('generates correct detail key with id', () => {
    expect(programKeys.detail('prog-123')).toEqual([
      'programs',
      'detail',
      'prog-123',
    ]);
  });
});
