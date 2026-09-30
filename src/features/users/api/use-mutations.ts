'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { userKeys } from './query-keys';
import { toast } from 'sonner';
import type { CreateUserDTO } from '../types';

interface CreateUserResponse {
  success: boolean;
  message: string;
  user: any;
  activationToken: string;
  activationUrl: string;
}

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateUserDTO): Promise<CreateUserResponse> => {
      const { data } = await apiClient.post<CreateUserResponse>('/users', payload);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      toast.success(data.message || 'Anggota berhasil didaftarkan!');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.error?.message || err.message || 'Gagal mendaftarkan anggota.';
      toast.error(msg);
    },
  });
};

export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      status,
    }: {
      userId: string;
      status: 'ACTIVE' | 'INACTIVE';
    }) => {
      const { data } = await apiClient.patch(`/users/${userId}/status`, { status });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      toast.success('Status anggota berhasil diperbarui.');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.error?.message || err.message || 'Gagal mengubah status.';
      toast.error(msg);
    },
  });
};

export const useResendActivation = () => {
  return useMutation({
    mutationFn: async (userId: string) => {
      const { data } = await apiClient.post<{
        success: boolean;
        message: string;
        activationToken: string;
        activationUrl: string;
      }>(`/users/${userId}/resend-activation`);
      return data;
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Tautan aktivasi baru berhasil diterbitkan.');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.error?.message || err.message || 'Gagal membuat tautan aktivasi.';
      toast.error(msg);
    },
  });
};
