import type { QueryAnnouncementsParams } from '../types';

export const announcementKeys = {
  all: ['announcements'] as const,
  lists: () => [...announcementKeys.all, 'list'] as const,
  list: (params?: QueryAnnouncementsParams) => [...announcementKeys.lists(), params] as const,
  details: () => [...announcementKeys.all, 'detail'] as const,
  detail: (id: string) => [...announcementKeys.details(), id] as const,
  permissions: () => [...announcementKeys.all, 'permissions'] as const,
};
