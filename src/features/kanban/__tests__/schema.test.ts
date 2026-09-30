import { describe, it, expect } from 'vitest';
import {
  moveTaskSchema,
  blockTaskSchema,
  queryBoardSchema,
} from '../types';

describe('Kanban Schemas', () => {
  describe('moveTaskSchema', () => {
    it('validates a valid move payload', () => {
      const res = moveTaskSchema.safeParse({
        status: 'IN_PROGRESS',
        position: 'a1',
      });
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.status).toBe('IN_PROGRESS');
        expect(res.data.position).toBe('a1');
      }
    });

    it('rejects invalid column status', () => {
      const res = moveTaskSchema.safeParse({
        status: 'UNKNOWN_STATUS',
        position: 'a0',
      });
      expect(res.success).toBe(false);
    });

    it('rejects empty position', () => {
      const res = moveTaskSchema.safeParse({
        status: 'TODO',
        position: '',
      });
      expect(res.success).toBe(false);
      expect(res.error?.issues[0].message).toContain('Posisi tidak boleh kosong.');
    });
  });

  describe('blockTaskSchema', () => {
    it('validates valid block reason', () => {
      const res = blockTaskSchema.safeParse({
        reason: 'Menunggu revisi copy teks dari klien',
      });
      expect(res.success).toBe(true);
    });

    it('rejects empty reason', () => {
      const res = blockTaskSchema.safeParse({
        reason: '   ',
      });
      expect(res.success).toBe(false);
      expect(res.error?.issues[0].message).toContain('Alasan kendala wajib diisi.');
    });
  });

  describe('queryBoardSchema', () => {
    it('validates valid board filter params', () => {
      const res = queryBoardSchema.safeParse({
        priority: 'URGENT',
        isBlocked: true,
        search: 'desain',
      });
      expect(res.success).toBe(true);
    });
  });
});
