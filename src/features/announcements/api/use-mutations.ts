'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';
import { apiClient } from '@/lib/api-client';
import { announcementKeys } from './query-keys';
import { calendarKeys } from '@/features/calendar/api/query-keys';
import type {
  Announcement,
  CreateAnnouncementDTO,
  UpdateAnnouncementDTO,
} from '../types';

export const useCreateAnnouncement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: CreateAnnouncementDTO): Promise<Announcement> => {
      const { data } = await apiClient.post<Announcement>('/announcements', dto);
      return data;
    },
    onSuccess: (created) => {
      toast.success('Pengumuman berhasil dipublikasikan!');
      queryClient.invalidateQueries({ queryKey: announcementKeys.lists() });
      if (created.eventStartDate) {
        queryClient.invalidateQueries({ queryKey: calendarKeys.status() });
      }
    },
    onError: (error) => {
      let msg = 'Gagal mempublikasikan pengumuman.';
      if (isAxiosError(error) && error.response?.data?.message) {
        msg = error.response.data.message;
      }
      toast.error(msg);
    },
  });
};

export const useUpdateAnnouncement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      dto,
    }: {
      id: string;
      dto: UpdateAnnouncementDTO;
    }): Promise<Announcement> => {
      const { data } = await apiClient.patch<Announcement>(`/announcements/${id}`, dto);
      return data;
    },
    onSuccess: (updated) => {
      toast.success('Pengumuman berhasil diperbarui!');
      queryClient.invalidateQueries({ queryKey: announcementKeys.lists() });
      queryClient.invalidateQueries({ queryKey: announcementKeys.detail(updated.id) });
      if (updated.eventStartDate) {
        queryClient.invalidateQueries({ queryKey: calendarKeys.status() });
      }
    },
    onError: (error) => {
      let msg = 'Gagal memperbarui pengumuman.';
      if (isAxiosError(error) && error.response?.data?.message) {
        msg = error.response.data.message;
      }
      toast.error(msg);
    },
  });
};

export const useDeleteAnnouncement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await apiClient.delete(`/announcements/${id}`);
    },
    onSuccess: () => {
      toast.success('Pengumuman berhasil dihapus.');
      queryClient.invalidateQueries({ queryKey: announcementKeys.lists() });
      queryClient.invalidateQueries({ queryKey: calendarKeys.status() });
    },
    onError: (error) => {
      let msg = 'Gagal menghapus pengumuman.';
      if (isAxiosError(error) && error.response?.data?.message) {
        msg = error.response.data.message;
      }
      toast.error(msg);
    },
  });
};
