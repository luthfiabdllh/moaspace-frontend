import { describe, it, expect } from 'vitest';
import {
  createEpicSchema,
  updateEpicSchema,
  epicItemSchema,
} from '../types';

describe('Epic Schemas', () => {
  describe('createEpicSchema', () => {
    it('validates a valid DIVISION epic payload', () => {
      const payload = {
        title: 'Pengembangan Desain Maskot',
        description: 'Maskot Moa untuk merchandise',
        scope: 'DIVISION',
        ownerDivisionId: 'div-1',
        prokerTag: 'maskot-2026',
        participatingDivisionIds: [],
      };

      const res = createEpicSchema.safeParse(payload);
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.title).toBe('Pengembangan Desain Maskot');
        expect(res.data.scope).toBe('DIVISION');
      }
    });

    it('validates a valid CROSS epic payload with participating divisions', () => {
      const payload = {
        title: 'Festival Kolaborasi Kampus',
        description: 'Inisiatif gabungan seluruh divisi',
        scope: 'CROSS',
        participatingDivisionIds: ['div-1', 'div-2', 'div-3'],
      };

      const res = createEpicSchema.safeParse(payload);
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.scope).toBe('CROSS');
        expect(res.data.participatingDivisionIds).toHaveLength(3);
      }
    });

    it('rejects empty title', () => {
      const payload = {
        title: '   ',
        scope: 'DIVISION',
      };

      const res = createEpicSchema.safeParse(payload);
      expect(res.success).toBe(false);
      expect(res.error?.issues[0].message).toContain('Judul epic tidak boleh kosong.');
    });

    it('rejects title longer than 255 characters', () => {
      const payload = {
        title: 'a'.repeat(256),
        scope: 'DIVISION',
      };

      const res = createEpicSchema.safeParse(payload);
      expect(res.success).toBe(false);
      expect(res.error?.issues[0].message).toContain('Judul epic maksimal 255 karakter.');
    });
  });

  describe('updateEpicSchema', () => {
    it('allows partial update of fields', () => {
      const res = updateEpicSchema.safeParse({
        title: 'Judul Diperbarui',
        isClosed: true,
      });

      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.title).toBe('Judul Diperbarui');
        expect(res.data.isClosed).toBe(true);
      }
    });
  });

  describe('epicItemSchema', () => {
    it('parses a full epic item with defaults', () => {
      const raw = {
        id: 'epic-1',
        title: 'Epic Satu',
        scope: 'DIVISION',
        createdById: 'user-1',
        isClosed: false,
        participatingDivisions: [],
        storyCount: 2,
        totalTasks: 5,
        doneTasks: 3,
        progressPercentage: 60,
      };

      const res = epicItemSchema.safeParse(raw);
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.progressPercentage).toBe(60);
      }
    });
  });
});
