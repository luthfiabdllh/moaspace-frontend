import { describe, it, expect, vi, beforeEach } from 'vitest';
import { cn, formatDate, safeJsonParse, absoluteUrl } from '@/lib/utils';

describe('cn()', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('handles conditional classes', () => {
    expect(cn('base', false && 'skipped', 'included')).toBe('base included');
  });

  it('merges conflicting Tailwind classes (last wins)', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4');
  });

  it('handles undefined and null gracefully', () => {
    expect(cn('base', undefined, null, 'end')).toBe('base end');
  });
});

describe('formatDate()', () => {
  it('formats a Date object to a readable string', () => {
    const date = new Date('2024-01-15T00:00:00Z');
    const result = formatDate(date, 'en-US');
    expect(result).toContain('2024');
  });

  it('formats a date string', () => {
    const result = formatDate('2024-06-01', 'en-US');
    expect(result).toContain('2024');
  });
});

describe('safeJsonParse()', () => {
  it('parses valid JSON', () => {
    const result = safeJsonParse<{ key: string }>('{"key":"value"}');
    expect(result).toEqual({ key: 'value' });
  });

  it('returns null for invalid JSON', () => {
    const result = safeJsonParse('not-json{{{');
    expect(result).toBeNull();
  });

  it('returns null for empty string', () => {
    const result = safeJsonParse('');
    expect(result).toBeNull();
  });
});

describe('absoluteUrl()', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://example.com');
  });

  it('prepends the base URL to a path', () => {
    const result = absoluteUrl('/api/health');
    expect(result).toBe('https://example.com/api/health');
  });

  it('handles paths without leading slash', () => {
    const result = absoluteUrl('dashboard');
    expect(result).toBe('https://example.com/dashboard');
  });
});
