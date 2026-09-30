'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';
import { apiClient } from '@/lib/api-client';
import { authKeys } from '@/features/auth/api/query-keys';
import type { UpdateProfileDTO, ChangePasswordDTO } from '../types';

interface UpdateProfileResponse {
  success: boolean;
  message?: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

interface ChangePasswordResponse {
  success: boolean;
  message?: string;
}

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: UpdateProfileDTO): Promise<UpdateProfileResponse> => {
      const { data } = await apiClient.patch<UpdateProfileResponse>(
        '/auth/profile',
        dto
      );
      return data;
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Profil berhasil diperbarui!');
      queryClient.invalidateQueries({ queryKey: authKeys.currentUser() });
    },
    onError: (error) => {
      let msg = 'Gagal memperbarui profil.';
      if (isAxiosError(error) && error.response?.data?.message) {
        msg = error.response.data.message;
      }
      toast.error(msg);
    },
  });
};

export const useChangePassword = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: ChangePasswordDTO): Promise<ChangePasswordResponse> => {
      const { data } = await apiClient.patch<ChangePasswordResponse>(
        '/auth/change-password',
        {
          currentPassword: dto.currentPassword || undefined,
          newPassword: dto.newPassword,
        }
      );
      return data;
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Kata sandi berhasil diperbarui!');
      queryClient.invalidateQueries({ queryKey: authKeys.currentUser() });
    },
    onError: (error) => {
      let msg = 'Gagal memperbarui kata sandi.';
      if (isAxiosError(error) && error.response?.data?.message) {
        msg = error.response.data.message;
      }
      toast.error(msg);
    },
  });
};
