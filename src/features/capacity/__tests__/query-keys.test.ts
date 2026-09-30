import { describe, it, expect } from 'vitest';
import { capacityKeys } from '../api/query-keys';

describe('capacityKeys', () => {
  it('generates consistent hierarchical query keys', () => {
    expect(capacityKeys.all).toEqual(['capacity']);
    expect(capacityKeys.me()).toEqual(['capacity', 'me']);
    expect(capacityKeys.division('div-1')).toEqual(['capacity', 'division', 'div-1', { weekStart: undefined }]);
    expect(capacityKeys.division('div-1', '2026-09-28')).toEqual(['capacity', 'division', 'div-1', { weekStart: '2026-09-28' }]);
  });
});
