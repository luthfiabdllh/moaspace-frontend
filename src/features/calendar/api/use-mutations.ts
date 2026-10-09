'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';
import { apiClient } from '@/lib/api-client';
import { calendarKeys } from './query-keys';
import type {
  CalendarAuthUrlResponse,
  CalendarStatusResponse,
  ToggleSyncRequest,
} from '../types';

export const useConnectCalendar = () => {
  return useMutation({
    mutationFn: async (): Promise<string> => {
      const { data } = await apiClient.get<CalendarAuthUrlResponse>('/calendar/auth-url');
      return data.url;
    },
    onSuccess: (url) => {
      window.location.href = url;
    },
    onError: (error) => {
      let msg = 'Gagal memulai koneksi Google Calendar.';
      if (isAxiosError(error) && error.response?.data?.message) {
        msg = error.response.data.message;
      }
      toast.error(msg);
    },
  });
};

export const useToggleCalendarSync = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: ToggleSyncRequest): Promise<CalendarStatusResponse> => {
      const { data } = await apiClient.patch<CalendarStatusResponse>(
        '/calendar/toggle',
        dto
      );
      return data;
    },
    onSuccess: (data) => {
      toast.success(
        data.syncEnabled
          ? 'Sinkronisasi Google Calendar diaktifkan'
          : 'Sinkronisasi Google Calendar dinonaktifkan'
      );
      queryClient.setQueryData(calendarKeys.status(), data);
    },
    onError: (error) => {
      let msg = 'Gagal memperbarui status sinkronisasi.';
      if (isAxiosError(error) && error.response?.data?.message) {
        msg = error.response.data.message;
      }
      toast.error(msg);
    },
  });
};

export const useDisconnectCalendar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<void> => {
      await apiClient.delete('/calendar/disconnect');
    },
    onSuccess: () => {
      toast.success('Koneksi Google Calendar berhasil diputuskan');
      queryClient.setQueryData(calendarKeys.status(), {
        isConnected: false,
        syncEnabled: false,
        calendarName: null,
        updatedAt: null,
      });
    },
    onError: (error) => {
      let msg = 'Gagal memutuskan koneksi Google Calendar.';
      if (isAxiosError(error) && error.response?.data?.message) {
        msg = error.response.data.message;
      }
      toast.error(msg);
    },
  });
};

export const useSyncCalendarNow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<{ success: boolean; message: string }> => {
      const { data } = await apiClient.post<{ success: boolean; message: string }>(
        '/calendar/sync-now'
      );
      return data;
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Tugas & permohonan berhasil disinkronkan ke Google Calendar!');
      queryClient.invalidateQueries({ queryKey: calendarKeys.status() });
    },
    onError: (error) => {
      let msg = 'Gagal menjalankan sinkronisasi.';
      if (isAxiosError(error) && error.response?.data?.message) {
        msg = error.response.data.message;
      }
      toast.error(msg);
    },
  });
};
