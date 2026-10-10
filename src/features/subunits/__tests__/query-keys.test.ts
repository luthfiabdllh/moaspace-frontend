import { describe, it, expect } from 'vitest';
import { subunitKeys } from '../api/query-keys';

describe('subunitKeys', () => {
  it('generates correct base all key', () => {
    expect(subunitKeys.all).toEqual(['subunits']);
  });

  it('generates correct lists key', () => {
    expect(subunitKeys.lists()).toEqual(['subunits', 'list']);
  });

  it('generates correct detail key with id or slug', () => {
    expect(subunitKeys.detail('subunit-1')).toEqual([
      'subunits',
      'detail',
      'subunit-1',
    ]);
  });
});
