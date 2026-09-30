import { describe, it, expect } from 'vitest';
import {
  createCapacityRequestSchema,
  reviewCapacityRequestSchema,
  memberUtilizationSchema,
} from '../types';

describe('Capacity Schemas', () => {
  describe('createCapacityRequestSchema', () => {
    it('accepts valid capacity request payload', () => {
      const payload = {
        requestedSp: 15,
        note: 'Sedang mengerjakan persiapan expo KKN dan butuh alokasi lebih banyak SP',
      };

      const res = createCapacityRequestSchema.safeParse(payload);
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.requestedSp).toBe(15);
        expect(res.data.note).toContain('expo KKN');
      }
    });

    it('rejects requestedSp less than 1', () => {
      const payload = {
        requestedSp: 0,
        note: 'Alasan pengajuan',
      };

      const res = createCapacityRequestSchema.safeParse(payload);
      expect(res.success).toBe(false);
      expect(res.error?.issues[0].message).toContain('Kapasitas minimal 1 SP');
    });

    it('rejects requestedSp greater than 40', () => {
      const payload = {
        requestedSp: 50,
        note: 'Alasan pengajuan',
      };

      const res = createCapacityRequestSchema.safeParse(payload);
      expect(res.success).toBe(false);
      expect(res.error?.issues[0].message).toContain('Kapasitas maksimal 40 SP');
    });

    it('rejects empty or too short note', () => {
      const payload = {
        requestedSp: 8,
        note: 'hi',
      };

      const res = createCapacityRequestSchema.safeParse(payload);
      expect(res.success).toBe(false);
      expect(res.error?.issues[0].message).toContain('Alasan pengajuan minimal 3 karakter');
    });
  });

  describe('reviewCapacityRequestSchema', () => {
    it('accepts APPROVE action with approvedSp', () => {
      const payload = {
        action: 'APPROVE' as const,
        approvedSp: 12,
        note: 'Disetujui untuk minggu ini',
      };

      const res = reviewCapacityRequestSchema.safeParse(payload);
      expect(res.success).toBe(true);
    });

    it('accepts REJECT action', () => {
      const payload = {
        action: 'REJECT' as const,
        note: 'Belum diperlukan saat ini',
      };

      const res = reviewCapacityRequestSchema.safeParse(payload);
      expect(res.success).toBe(true);
    });
  });

  describe('memberUtilizationSchema', () => {
    it('parses valid member utilization data', () => {
      const data = {
        userId: 'usr-1',
        userName: 'Budi Santoso',
        userEmail: 'budi@moaspace.id',
        weekStart: '2026-09-28',
        capacitySp: 10,
        activeSp: 8,
        utilizationPercentage: 80,
        status: 'NORMAL' as const,
        requestStatus: 'NONE' as const,
        capacityId: 'cap-1',
      };

      const res = memberUtilizationSchema.safeParse(data);
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.utilizationPercentage).toBe(80);
        expect(res.data.status).toBe('NORMAL');
      }
    });
  });
});
