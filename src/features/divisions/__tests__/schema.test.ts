import { describe, it, expect } from 'vitest';
import {
  createDivisionSchema,
  updateDivisionSchema,
  divisionItemSchema,
} from '../types';

describe('Division Schemas', () => {
  describe('createDivisionSchema', () => {
    it('accepts valid division data with slug', () => {
      const res = createDivisionSchema.safeParse({
        name: 'Media Kreatif',
        slug: 'media-kreatif',
        requestApprovalEnabled: true,
      });
      expect(res.success).toBe(true);
    });

    it('accepts valid division data without slug (optional or empty)', () => {
      const res = createDivisionSchema.safeParse({
        name: 'Sponsorship & Donatur',
        slug: '',
        requestApprovalEnabled: false,
      });
      expect(res.success).toBe(true);
    });

    it('rejects empty division name', () => {
      const res = createDivisionSchema.safeParse({
        name: '',
      });
      expect(res.success).toBe(false);
      expect(res.error?.issues[0].message).toBe('Nama divisi tidak boleh kosong.');
    });

    it('rejects invalid slug format with spaces or capitals', () => {
      const res = createDivisionSchema.safeParse({
        name: 'Valid Name',
        slug: 'Invalid Slug With Spaces',
      });
      expect(res.success).toBe(false);
      expect(res.error?.issues[0].message).toContain('Slug hanya boleh memuat huruf kecil');
    });
  });

  describe('updateDivisionSchema', () => {
    it('accepts partial update of division name', () => {
      const res = updateDivisionSchema.safeParse({
        name: 'Nama Divisi Baru',
      });
      expect(res.success).toBe(true);
    });

    it('accepts update of requestApprovalEnabled toggle', () => {
      const res = updateDivisionSchema.safeParse({
        requestApprovalEnabled: true,
      });
      expect(res.success).toBe(true);
    });
  });

  describe('divisionItemSchema', () => {
    it('parses valid division item from API', () => {
      const res = divisionItemSchema.safeParse({
        id: 'div-123',
        name: 'Operasional',
        slug: 'operasional',
        requestApprovalEnabled: false,
        memberCount: 5,
        coordinators: [
          {
            id: 'u-1',
            name: 'Koordinator Operasional',
            email: 'koor.ops@moaspace.com',
          },
        ],
      });
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.memberCount).toBe(5);
        expect(res.data.coordinators).toHaveLength(1);
      }
    });
  });
});
