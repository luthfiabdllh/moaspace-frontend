import { describe, it, expect } from 'vitest';
import { divisionKeys } from '../api/query-keys';

describe('divisionKeys', () => {
  it('generates correct base all key', () => {
    expect(divisionKeys.all).toEqual(['divisions']);
  });

  it('generates correct lists key', () => {
    expect(divisionKeys.lists()).toEqual(['divisions', 'list']);
  });

  it('generates correct detail key with id', () => {
    expect(divisionKeys.detail('div-123')).toEqual([
      'divisions',
      'detail',
      'div-123',
    ]);
  });
});
