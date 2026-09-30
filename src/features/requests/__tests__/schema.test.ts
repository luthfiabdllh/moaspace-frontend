import { describe, it, expect } from 'vitest';
import {
  createRequestSchema,
  originApprovalSchema,
  triageRequestSchema,
  deliverRequestSchema,
  confirmRequestSchema,
} from '../types';

describe('Requests Schemas', () => {
  describe('createRequestSchema', () => {
    it('accepts valid cross-division request', () => {
      const payload = {
        fromDivisionId: 'div-1',
        toDivisionId: 'div-2',
        title: 'Desain Banner Expo KKN',
        brief: {
          ukuran: 'A3',
          warna: 'Biru dan Kuning',
        },
        deadline: '2026-10-15',
      };

      const res = createRequestSchema.safeParse(payload);
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.title).toBe('Desain Banner Expo KKN');
        expect(res.data.fromDivisionId).toBe('div-1');
      }
    });

    it('rejects empty title', () => {
      const payload = {
        fromDivisionId: 'div-1',
        toDivisionId: 'div-2',
        title: '',
        brief: {},
      };

      const res = createRequestSchema.safeParse(payload);
      expect(res.success).toBe(false);
      expect(res.error?.issues[0].message).toContain('Judul permohonan minimal 3 karakter');
    });

    it('rejects missing origin or target division', () => {
      const payload = {
        fromDivisionId: '',
        toDivisionId: 'div-2',
        title: 'Valid Title',
        brief: {},
      };

      const res = createRequestSchema.safeParse(payload);
      expect(res.success).toBe(false);
      expect(res.error?.issues[0].message).toContain('Divisi asal wajib dipilih');
    });
  });

  describe('originApprovalSchema', () => {
    it('accepts APPROVE without reason', () => {
      const res = originApprovalSchema.safeParse({ action: 'APPROVE' });
      expect(res.success).toBe(true);
    });

    it('accepts REJECT with reason', () => {
      const res = originApprovalSchema.safeParse({
        action: 'REJECT',
        reason: 'Belum ada anggaran untuk kebutuhan ini',
      });
      expect(res.success).toBe(true);
    });
  });

  describe('triageRequestSchema', () => {
    it('accepts ACCEPT action', () => {
      const res = triageRequestSchema.safeParse({ action: 'ACCEPT' });
      expect(res.success).toBe(true);
    });

    it('accepts NEED_INFO with reason', () => {
      const res = triageRequestSchema.safeParse({
        action: 'NEED_INFO',
        reason: 'Mohon cantumkan ukuran resolusi gambar',
      });
      expect(res.success).toBe(true);
    });
  });

  describe('deliverRequestSchema', () => {
    it('accepts valid delivery with notes and attachments', () => {
      const payload = {
        deliveryNotes: 'Semua desain sudah selesai',
        deliveryAttachments: [
          {
            title: 'Poster A3 Final',
            url: 'https://drive.google.com/file/d/xyz',
          },
        ],
      };

      const res = deliverRequestSchema.safeParse(payload);
      expect(res.success).toBe(true);
    });

    it('rejects empty attachments array', () => {
      const payload = {
        deliveryNotes: 'Semua desain sudah selesai',
        deliveryAttachments: [],
      };

      const res = deliverRequestSchema.safeParse(payload);
      expect(res.success).toBe(false);
      expect(res.error?.issues[0].message).toContain('Minimal harus ada 1 lampiran hasil kerja');
    });
  });

  describe('confirmRequestSchema', () => {
    it('accepts CONFIRM action', () => {
      const res = confirmRequestSchema.safeParse({ action: 'CONFIRM' });
      expect(res.success).toBe(true);
    });

    it('accepts REVISION action with reason', () => {
      const res = confirmRequestSchema.safeParse({
        action: 'REVISION',
        reason: 'Tolong ganti logo sponsor dengan logo terbaru',
      });
      expect(res.success).toBe(true);
    });
  });
});
