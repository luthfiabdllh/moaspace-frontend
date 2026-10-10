'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { announcementKeys } from './query-keys';
import type {
  Announcement,
  AnnouncementPermissionsResponse,
  QueryAnnouncementsParams,
} from '../types';

export const useAnnouncements = (params?: QueryAnnouncementsParams) => {
  return useQuery({
    queryKey: announcementKeys.list(params),
    queryFn: async (): Promise<Announcement[]> => {
      const { data } = await apiClient.get<Announcement[]>('/announcements', {
        params,
      });
      return data;
    },
    staleTime: 1000 * 30, // 30 seconds
  });
};

export const useAnnouncement = (id: string, enabled = true) => {
  return useQuery({
    queryKey: announcementKeys.detail(id),
    queryFn: async (): Promise<Announcement> => {
      const { data } = await apiClient.get<Announcement>(`/announcements/${id}`);
      return data;
    },
    enabled: Boolean(id) && enabled,
    staleTime: 1000 * 60,
  });
};

export const useAnnouncementPermissions = () => {
  return useQuery({
    queryKey: announcementKeys.permissions(),
    queryFn: async (): Promise<AnnouncementPermissionsResponse> => {
      const { data } = await apiClient.get<AnnouncementPermissionsResponse>(
        '/announcements/permissions'
      );
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
