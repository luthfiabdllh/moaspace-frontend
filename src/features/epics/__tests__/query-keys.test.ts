import { describe, it, expect } from 'vitest';
import { epicKeys } from '../api/query-keys';

describe('epicKeys', () => {
  it('generates the base all key', () => {
    expect(epicKeys.all).toEqual(['epics']);
  });

  it('generates the lists key', () => {
    expect(epicKeys.lists()).toEqual(['epics', 'list']);
  });

  it('generates the list key with params', () => {
    const params = { scope: 'CROSS', divisionId: 'div-1' };
    expect(epicKeys.list(params)).toEqual(['epics', 'list', params]);
  });

  it('generates the detail key', () => {
    expect(epicKeys.detail('epic-123')).toEqual(['epics', 'detail', 'epic-123']);
  });
});
