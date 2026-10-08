import { describe, it, expect } from 'vitest';
import { friendlyTaskErrorMessage } from '../lib/task-error-messages';

describe('friendlyTaskErrorMessage', () => {
  it('simplifies the "Story Point wajib diisi" backend message (BACKLOG -> TODO)', () => {
    expect(
      friendlyTaskErrorMessage(
        'Estimasi Story Point (skala 1, 2, 3, 5, 8) wajib diisi sebelum memindahkan task ke To Do.'
      )
    ).toBe('Atur Story Point terlebih dahulu sebelum memindahkan task ini.');
  });

  it('simplifies the "Story Point wajib diisi" backend message for multi-stage jumps (Transisi H)', () => {
    expect(
      friendlyTaskErrorMessage(
        'Estimasi Story Point (skala 1, 2, 3, 5, 8) wajib diisi sebelum memindahkan task melewati To Do.'
      )
    ).toBe('Atur Story Point terlebih dahulu sebelum memindahkan task ini.');
  });

  it('simplifies the "Assignee wajib ditentukan" backend message', () => {
    expect(
      friendlyTaskErrorMessage('Assignee wajib ditentukan sebelum memindahkan task ke To Do.')
    ).toBe('Tentukan Assignee terlebih dahulu sebelum memindahkan task ini.');
  });

  it('passes through unrelated error messages unchanged', () => {
    const msg = 'Hanya Koordinator yang dapat memindahkan task dari Backlog ke To Do.';
    expect(friendlyTaskErrorMessage(msg)).toBe(msg);
  });

  it('falls back to a generic message for empty input', () => {
    expect(friendlyTaskErrorMessage('')).toBe('Gagal memindahkan task.');
  });
});
