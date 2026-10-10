import { describe, it, expect } from 'vitest';
import { announcementKeys } from '../api/query-keys';

describe('announcementKeys', () => {
  it('generates proper query keys for announcements', () => {
    expect(announcementKeys.all).toEqual(['announcements']);
    expect(announcementKeys.lists()).toEqual(['announcements', 'list']);
    expect(announcementKeys.list({ category: 'MEETING' })).toEqual([
      'announcements',
      'list',
      { category: 'MEETING' },
    ]);
    expect(announcementKeys.details()).toEqual(['announcements', 'detail']);
    expect(announcementKeys.detail('ann-1')).toEqual(['announcements', 'detail', 'ann-1']);
    expect(announcementKeys.permissions()).toEqual(['announcements', 'permissions']);
  });
});
