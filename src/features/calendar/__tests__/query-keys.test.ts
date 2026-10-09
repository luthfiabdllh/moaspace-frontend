import { describe, it, expect } from 'vitest';
import { calendarKeys } from '../api/query-keys';

describe('calendarKeys', () => {
  it('generates correct query keys for calendar integration', () => {
    expect(calendarKeys.all).toEqual(['calendar']);
    expect(calendarKeys.status()).toEqual(['calendar', 'status']);
  });
});
