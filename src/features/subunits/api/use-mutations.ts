'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { apiClient } from '@/lib/api-client';
import { subunitKeys } from './query-keys';
import { userKeys } from '@/features/users/api/query-keys';
import { toast } from 'sonner';
import type {
  CreateSubunitDTO,
  UpdateSubunitDTO,
  AddSubunitMemberDTO,
  SubunitRole,
  SubunitItem,
} from '../types';

export const useCreateSubunit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateSubunitDTO): Promise<SubunitItem> => {
      const { data } = await apiClient.post<SubunitItem>('/subunits', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subunitKeys.all });
      toast.success('Subunit posko baru berhasil ditambahkan.');
    },
    onError: (err) => {
      const msg = isAxiosError(err)
        ? err.response?.data?.error?.message
        : undefined;
      toast.error(msg || (err instanceof Error ? err.message : undefined) || 'Gagal menambahkan subunit.');
    },
  });
};

export const useUpdateSubunit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateSubunitDTO;
    }): Promise<SubunitItem> => {
      const { data } = await apiClient.patch<SubunitItem>(`/subunits/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subunitKeys.all });
      toast.success('Informasi subunit berhasil diperbarui.');
    },
    onError: (err) => {
      const msg = isAxiosError(err)
        ? err.response?.data?.error?.message
        : undefined;
      toast.error(msg || (err instanceof Error ? err.message : undefined) || 'Gagal memperbarui subunit.');
    },
  });
};

export const useDeleteSubunit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete<{ success: boolean; message: string }>(
        `/subunits/${id}`,
      );
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: subunitKeys.all });
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      toast.success(data.message || 'Subunit berhasil dihapus.');
    },
    onError: (err) => {
      const msg = isAxiosError(err)
        ? err.response?.data?.error?.message
        : undefined;
      toast.error(msg || (err instanceof Error ? err.message : undefined) || 'Gagal menghapus subunit.');
    },
  });
};

export const useAddSubunitMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      subunitId,
      payload,
    }: {
      subunitId: string;
      payload: AddSubunitMemberDTO;
    }) => {
      const { data } = await apiClient.post(
        `/subunits/${subunitId}/members`,
        payload,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subunitKeys.all });
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      toast.success('Anggota berhasil ditambahkan ke subunit.');
    },
    onError: (err) => {
      const msg = isAxiosError(err)
        ? err.response?.data?.error?.message
        : undefined;
      toast.error(msg || (err instanceof Error ? err.message : undefined) || 'Gagal menambahkan anggota.');
    },
  });
};

export const useUpdateSubunitMemberRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      subunitId,
      userId,
      role,
    }: {
      subunitId: string;
      userId: string;
      role: SubunitRole;
    }) => {
      const { data } = await apiClient.patch(
        `/subunits/${subunitId}/members/${userId}`,
        { role },
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subunitKeys.all });
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      toast.success('Peran anggota subunit berhasil diubah.');
    },
    onError: (err) => {
      const msg = isAxiosError(err)
        ? err.response?.data?.error?.message
        : undefined;
      toast.error(msg || (err instanceof Error ? err.message : undefined) || 'Gagal mengubah peran anggota.');
    },
  });
};

export const useRemoveSubunitMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      subunitId,
      userId,
    }: {
      subunitId: string;
      userId: string;
    }) => {
      const { data } = await apiClient.delete(
        `/subunits/${subunitId}/members/${userId}`,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subunitKeys.all });
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      toast.success('Anggota berhasil dihapus dari subunit.');
    },
    onError: (err) => {
      const msg = isAxiosError(err)
        ? err.response?.data?.error?.message
        : undefined;
      toast.error(msg || (err instanceof Error ? err.message : undefined) || 'Gagal menghapus anggota dari subunit.');
    },
  });
};
