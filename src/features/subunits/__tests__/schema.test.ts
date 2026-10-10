import { describe, it, expect } from 'vitest';
import {
  createSubunitSchema,
  updateSubunitSchema,
  addSubunitMemberSchema,
} from '../types';

describe('Subunits schemas', () => {
  describe('createSubunitSchema', () => {
    it('accepts valid subunit creation data', () => {
      const res = createSubunitSchema.safeParse({
        name: 'Subunit 1 - Karangrejo',
        location: 'Balai Dusun',
        description: 'Fokus program pemberdayaan UMKM',
      });
      expect(res.success).toBe(true);
    });

    it('rejects empty name', () => {
      const res = createSubunitSchema.safeParse({
        name: '',
      });
      expect(res.success).toBe(false);
      expect(res.error?.issues[0].message).toBe('Nama subunit posko wajib diisi.');
    });
  });

  describe('updateSubunitSchema', () => {
    it('accepts partial update data', () => {
      const res = updateSubunitSchema.safeParse({
        location: 'Posko Baru RT 04',
      });
      expect(res.success).toBe(true);
    });
  });

  describe('addSubunitMemberSchema', () => {
    it('accepts valid member placement data', () => {
      const res = addSubunitMemberSchema.safeParse({
        userId: 'user-123',
        role: 'COORDINATOR',
      });
      expect(res.success).toBe(true);
    });

    it('defaults role to MEMBER if omitted', () => {
      const res = addSubunitMemberSchema.safeParse({
        userId: 'user-123',
      });
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.role).toBe('MEMBER');
      }
    });

    it('rejects empty userId', () => {
      const res = addSubunitMemberSchema.safeParse({
        userId: '',
        role: 'MEMBER',
      });
      expect(res.success).toBe(false);
    });
  });
});
