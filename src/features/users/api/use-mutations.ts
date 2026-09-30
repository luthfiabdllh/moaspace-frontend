'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { userKeys } from './query-keys';
import { toast } from 'sonner';
import type {
  CreateUserDTO,
  AddUserDivisionDTO,
  UpdateUserDivisionRoleDTO,
  MoveUserDivisionDTO,
  UpdateUserGlobalRoleDTO,
} from '../types';

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
      queryClient.invalidateQueries({ queryKey: ['activity-logs'] });
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

export const useAddUserDivision = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      payload,
    }: {
      userId: string;
      payload: AddUserDivisionDTO;
    }) => {
      const { data } = await apiClient.post<{
        success: boolean;
        message: string;
      }>(`/users/${userId}/divisions`, payload);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      queryClient.invalidateQueries({ queryKey: ['activity-logs'] });
      toast.success(data.message || 'Divisi berhasil ditambahkan.');
    },
    onError: (err: any) => {
      const msg =
        err.response?.data?.error?.message ||
        err.message ||
        'Gagal menambahkan divisi.';
      toast.error(msg);
    },
  });
};

export const useUpdateUserDivisionRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      divisionId,
      payload,
    }: {
      userId: string;
      divisionId: string;
      payload: UpdateUserDivisionRoleDTO;
    }) => {
      const { data } = await apiClient.patch<{
        success: boolean;
        message: string;
      }>(`/users/${userId}/divisions/${divisionId}/role`, payload);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      queryClient.invalidateQueries({ queryKey: ['activity-logs'] });
      toast.success(data.message || 'Role divisi berhasil diubah.');
    },
    onError: (err: any) => {
      const msg =
        err.response?.data?.error?.message ||
        err.message ||
        'Gagal mengubah role divisi.';
      toast.error(msg);
    },
  });
};

export const useRemoveUserDivision = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      divisionId,
    }: {
      userId: string;
      divisionId: string;
    }) => {
      const { data } = await apiClient.delete<{
        success: boolean;
        message: string;
      }>(`/users/${userId}/divisions/${divisionId}`);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      queryClient.invalidateQueries({ queryKey: ['activity-logs'] });
      toast.success(data.message || 'Keanggotaan divisi berhasil dihapus.');
    },
    onError: (err: any) => {
      const msg =
        err.response?.data?.error?.message ||
        err.message ||
        'Gagal menghapus keanggotaan divisi.';
      toast.error(msg);
    },
  });
};

export const useMoveUserDivision = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      payload,
    }: {
      userId: string;
      payload: MoveUserDivisionDTO;
    }) => {
      const { data } = await apiClient.post<{
        success: boolean;
        message: string;
      }>(`/users/${userId}/divisions/move`, payload);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      queryClient.invalidateQueries({ queryKey: ['activity-logs'] });
      toast.success(data.message || 'Anggota berhasil dipindahkan ke divisi baru.');
    },
    onError: (err: any) => {
      const msg =
        err.response?.data?.error?.message ||
        err.message ||
        'Gagal memindahkan divisi.';
      toast.error(msg);
    },
  });
};

export const useUpdateUserGlobalRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      payload,
    }: {
      userId: string;
      payload: UpdateUserGlobalRoleDTO;
    }) => {
      const { data } = await apiClient.patch<{
        success: boolean;
        message: string;
      }>(`/users/${userId}/global-role`, payload);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      queryClient.invalidateQueries({ queryKey: ['activity-logs'] });
      toast.success(data.message || 'Peran Koordinator Mahasiswa Unit diperbarui.');
    },
    onError: (err: any) => {
      const msg =
        err.response?.data?.error?.message ||
        err.message ||
        'Gagal mengubah peran Koordinator Mahasiswa Unit.';
      toast.error(msg);
    },
  });
};
