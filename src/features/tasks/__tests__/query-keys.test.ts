import { describe, it, expect } from 'vitest';
import { taskKeys } from '../api/query-keys';

describe('taskKeys', () => {
  it('generates the base all key', () => {
    expect(taskKeys.all).toEqual(['tasks']);
  });

  it('generates the lists key', () => {
    expect(taskKeys.lists()).toEqual(['tasks', 'list']);
  });

  it('generates the list key with params', () => {
    const params = { storyId: 'story-1', status: 'IN_PROGRESS' as const };
    expect(taskKeys.list(params)).toEqual(['tasks', 'list', params]);
  });

  it('generates the detail key', () => {
    expect(taskKeys.detail('task-123')).toEqual(['tasks', 'detail', 'task-123']);
  });
});
