import { describe, it, expect } from 'vitest';
import {
  createStorySchema,
  updateStorySchema,
  storyItemSchema,
} from '../types';

describe('Story Schemas', () => {
  describe('createStorySchema', () => {
    it('accepts valid story data with epic link', () => {
      const payload = {
        divisionId: 'div-1',
        epicId: 'epic-1',
        title: 'Desain Banner Utama & Feed Instagram',
        doneCriteria: 'Resolusi 1080x1080 dan disetujui koordinator',
        targetDate: '2026-10-15T00:00:00.000Z',
        prokerTag: 'publikasi-ig',
      };

      const res = createStorySchema.safeParse(payload);
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.title).toBe('Desain Banner Utama & Feed Instagram');
        expect(res.data.epicId).toBe('epic-1');
      }
    });

    it('accepts valid story data without epic link (routine work)', () => {
      const payload = {
        divisionId: 'div-1',
        title: 'Pembersihan Arsip Media Rutin',
      };

      const res = createStorySchema.safeParse(payload);
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.epicId).toBeUndefined();
      }
    });

    it('rejects empty title', () => {
      const payload = {
        divisionId: 'div-1',
        title: '  ',
      };

      const res = createStorySchema.safeParse(payload);
      expect(res.success).toBe(false);
      expect(res.error?.issues[0].message).toContain('Judul story tidak boleh kosong.');
    });

    it('rejects missing divisionId', () => {
      const payload = {
        divisionId: '',
        title: 'Valid Title',
      };

      const res = createStorySchema.safeParse(payload);
      expect(res.success).toBe(false);
      expect(res.error?.issues[0].message).toContain('Divisi wajib dipilih.');
    });
  });

  describe('updateStorySchema', () => {
    it('validates partial update', () => {
      const res = updateStorySchema.safeParse({
        title: 'Judul Baru Story',
        isClosed: true,
      });

      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.isClosed).toBe(true);
      }
    });
  });

  describe('storyItemSchema', () => {
    it('parses a full story item with defaults', () => {
      const raw = {
        id: 'story-1',
        divisionId: 'div-1',
        title: 'Story Satu',
        isClosed: false,
        totalTasks: 4,
        doneTasks: 2,
        progressPercentage: 50,
      };

      const res = storyItemSchema.safeParse(raw);
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.progressPercentage).toBe(50);
      }
    });
  });
});
