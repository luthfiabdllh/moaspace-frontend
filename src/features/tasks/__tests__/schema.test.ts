import { describe, it, expect } from 'vitest';
import {
  createTaskSchema,
  updateTaskSchema,
  taskItemSchema,
  taskDetailSchema,
} from '../types';

describe('Task Schemas', () => {
  describe('createTaskSchema', () => {
    it('accepts valid task data with optional status and priority', () => {
      const payload = {
        storyId: 'story-1',
        title: 'Buat ilustrasi maskot Moa',
        priority: 'HIGH' as const,
      };

      const res = createTaskSchema.safeParse(payload);
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.title).toBe('Buat ilustrasi maskot Moa');
        expect(res.data.priority).toBe('HIGH');
      }
    });

    it('rejects empty title', () => {
      const payload = {
        storyId: 'story-1',
        title: '',
      };

      const res = createTaskSchema.safeParse(payload);
      expect(res.success).toBe(false);
      expect(res.error?.issues[0].message).toContain('Judul task tidak boleh kosong.');
    });

    it('rejects missing storyId', () => {
      const payload = {
        storyId: '',
        title: 'Valid Task Title',
      };

      const res = createTaskSchema.safeParse(payload);
      expect(res.success).toBe(false);
      expect(res.error?.issues[0].message).toContain('Story wajib dipilih.');
    });
  });

  describe('updateTaskSchema', () => {
    it('validates partial update of status and isBlocked', () => {
      const res = updateTaskSchema.safeParse({
        status: 'IN_PROGRESS',
        isBlocked: true,
        blockedReason: 'Menunggu asset logo dari tim kreatif',
      });

      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.status).toBe('IN_PROGRESS');
        expect(res.data.isBlocked).toBe(true);
      }
    });
  });

  describe('taskDetailSchema', () => {
    it('parses full task detail with activity logs', () => {
      const raw = {
        id: 'task-1',
        storyId: 'story-1',
        title: 'Task Alpha',
        status: 'TODO',
        priority: 'MEDIUM',
        isBlocked: false,
        revisionCount: 0,
        activityLogs: [
          {
            id: 'act-1',
            entityType: 'TASK',
            entityId: 'task-1',
            action: 'TASK_CREATED',
            createdAt: '2026-09-30T10:00:00.000Z',
          },
        ],
      };

      const res = taskDetailSchema.safeParse(raw);
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.activityLogs).toHaveLength(1);
      }
    });
  });
});
