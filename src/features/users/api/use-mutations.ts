'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { apiClient } from '@/lib/api-client';
import { userKeys } from './query-keys';
import { toast } from 'sonner';
import type {
  CreateUserDTO,
  UserListItem,
  AddUserDivisionDTO,
  UpdateUserDivisionRoleDTO,
  MoveUserDivisionDTO,
  UpdateUserGlobalRoleDTO,
  UpdateUserAcademicDTO,
} from '../types';

interface CreateUserResponse {
  success: boolean;
  message: string;
  user: UserListItem;
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
    onError: (err) => {
      const msg = isAxiosError(err)
        ? err.response?.data?.error?.message
        : undefined;
      toast.error(msg || (err instanceof Error ? err.message : undefined) || 'Gagal mendaftarkan anggota.');
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
    onError: (err) => {
      const msg = isAxiosError(err)
        ? err.response?.data?.error?.message
        : undefined;
      toast.error(msg || (err instanceof Error ? err.message : undefined) || 'Gagal mengubah status.');
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
    onError: (err) => {
      const msg = isAxiosError(err)
        ? err.response?.data?.error?.message
        : undefined;
      toast.error(msg || (err instanceof Error ? err.message : undefined) || 'Gagal membuat tautan aktivasi.');
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
    onError: (err) => {
      const msg = isAxiosError(err)
        ? err.response?.data?.error?.message
        : undefined;
      toast.error(msg || (err instanceof Error ? err.message : undefined) || 'Gagal menambahkan divisi.');
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
    onError: (err) => {
      const msg = isAxiosError(err)
        ? err.response?.data?.error?.message
        : undefined;
      toast.error(msg || (err instanceof Error ? err.message : undefined) || 'Gagal mengubah role divisi.');
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
    onError: (err) => {
      const msg = isAxiosError(err)
        ? err.response?.data?.error?.message
        : undefined;
      toast.error(msg || (err instanceof Error ? err.message : undefined) || 'Gagal menghapus keanggotaan divisi.');
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
    onError: (err) => {
      const msg = isAxiosError(err)
        ? err.response?.data?.error?.message
        : undefined;
      toast.error(msg || (err instanceof Error ? err.message : undefined) || 'Gagal memindahkan divisi.');
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
    onError: (err) => {
      const msg = isAxiosError(err)
        ? err.response?.data?.error?.message
        : undefined;
      toast.error(msg || (err instanceof Error ? err.message : undefined) || 'Gagal mengubah peran Koordinator Mahasiswa Unit.');
    },
  });
};

export const useUpdateUserAcademic = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      payload,
    }: {
      userId: string;
      payload: UpdateUserAcademicDTO;
    }) => {
      const { data } = await apiClient.patch<{
        success: boolean;
        message: string;
      }>(`/users/${userId}/academic`, payload);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      queryClient.invalidateQueries({ queryKey: ['subunits'] });
      queryClient.invalidateQueries({ queryKey: ['activity-logs'] });
      toast.success(data.message || 'Informasi klaster dan subunit diperbarui.');
    },
    onError: (err) => {
      const msg = isAxiosError(err)
        ? err.response?.data?.error?.message
        : undefined;
      toast.error(msg || (err instanceof Error ? err.message : undefined) || 'Gagal memperbarui klaster & subunit.');
    },
  });
};

