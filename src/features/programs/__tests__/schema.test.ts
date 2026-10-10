import { describe, it, expect } from 'vitest';
import {
  createProgramSchema,
  updateProgramSchema,
  reviewProgramSchema,
} from '../types';

describe('Programs Schemas', () => {
  describe('createProgramSchema', () => {
    it('accepts valid program data', () => {
      const res = createProgramSchema.safeParse({
        title: 'Edukasi Sanitasi Lingkungan Dusun',
        scope: 'SUBUNIT',
        subunitId: 'sub-1',
        cluster: 'MEDIKA',
        primaryPicId: 'user-pic',
        description: 'Penyuluhan dan pembagian sabun cuci tangan.',
      });
      expect(res.success).toBe(true);
    });

    it('rejects empty title', () => {
      const res = createProgramSchema.safeParse({
        title: '',
        scope: 'UNIT',
        cluster: 'UNIT_SHARED',
        primaryPicId: 'user-pic',
      });
      expect(res.success).toBe(false);
      expect(res.error?.issues[0].message).toBe('Judul program kerja wajib diisi.');
    });

    it('rejects empty primaryPicId', () => {
      const res = createProgramSchema.safeParse({
        title: 'Program Tanpa PIC',
        scope: 'UNIT',
        cluster: 'UNIT_SHARED',
        primaryPicId: '',
      });
      expect(res.success).toBe(false);
      expect(res.error?.issues[0].message).toBe('PIC Utama wajib dipilih.');
    });
  });

  describe('updateProgramSchema', () => {
    it('accepts partial program updates', () => {
      const res = updateProgramSchema.safeParse({
        status: 'ACTIVE',
        description: 'Deskripsi diperbarui.',
      });
      expect(res.success).toBe(true);
    });
  });

  describe('reviewProgramSchema', () => {
    it('accepts APPROVED decision without reason', () => {
      const res = reviewProgramSchema.safeParse({
        decision: 'APPROVED',
      });
      expect(res.success).toBe(true);
    });

    it('accepts REJECTED decision with reason', () => {
      const res = reviewProgramSchema.safeParse({
        decision: 'REJECTED',
        reason: 'Perlu revisi timeline agar tidak bentrok dengan ujian dusun.',
      });
      expect(res.success).toBe(true);
    });

    it('rejects invalid decision value', () => {
      const res = reviewProgramSchema.safeParse({
        decision: 'MAYBE',
      });
      expect(res.success).toBe(false);
    });
  });
});
