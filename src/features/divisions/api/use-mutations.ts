'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';
import { apiClient } from '@/lib/api-client';
import { divisionKeys } from './query-keys';
import { authKeys } from '@/features/auth/api/query-keys';
import { userKeys } from '@/features/users/api/query-keys';
import type { CreateDivisionDTO, UpdateDivisionDTO } from '../types';

export const useCreateDivision = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: CreateDivisionDTO) => {
      const payload = {
        name: dto.name,
        slug: dto.slug || undefined,
        requestApprovalEnabled: dto.requestApprovalEnabled,
      };
      const { data } = await apiClient.post('/divisions', payload);
      return data;
    },
    onSuccess: (data) => {
      toast.success(`Divisi ${data.name} berhasil dibuat!`);
      queryClient.invalidateQueries({ queryKey: divisionKeys.all });
      queryClient.invalidateQueries({ queryKey: authKeys.currentUser() });
    },
    onError: (error) => {
      let msg = 'Gagal membuat divisi.';
      if (isAxiosError(error) && error.response?.data?.message) {
        msg = error.response.data.message;
      }
      toast.error(msg);
    },
  });
};

export const useUpdateDivision = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      dto,
    }: {
      id: string;
      dto: UpdateDivisionDTO;
    }) => {
      const payload: Partial<UpdateDivisionDTO> = {};
      if (dto.name !== undefined) payload.name = dto.name;
      if (dto.slug !== undefined) payload.slug = dto.slug || undefined;
      if (dto.requestApprovalEnabled !== undefined) {
        payload.requestApprovalEnabled = dto.requestApprovalEnabled;
      }

      const { data } = await apiClient.patch(`/divisions/${id}`, payload);
      return data;
    },
    onSuccess: (data) => {
      toast.success(`Divisi ${data.name} berhasil diperbarui.`);
      queryClient.invalidateQueries({ queryKey: divisionKeys.all });
      queryClient.invalidateQueries({ queryKey: authKeys.currentUser() });
    },
    onError: (error) => {
      let msg = 'Gagal memperbarui divisi.';
      if (isAxiosError(error) && error.response?.data?.message) {
        msg = error.response.data.message;
      }
      toast.error(msg);
    },
  });
};

export const useToggleApprovalRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      enabled,
    }: {
      id: string;
      enabled: boolean;
    }) => {
      const { data } = await apiClient.patch(`/divisions/${id}`, {
        requestApprovalEnabled: enabled,
      });
      return data;
    },
    onSuccess: (data) => {
      const statusText = data.requestApprovalEnabled ? 'diaktifkan' : 'dinonaktifkan';
      toast.success(`Approval request divisi ${data.name} berhasil ${statusText}.`);
      queryClient.invalidateQueries({ queryKey: divisionKeys.all });
    },
    onError: (error) => {
      let msg = 'Gagal mengubah status approval request.';
      if (isAxiosError(error) && error.response?.data?.message) {
        msg = error.response.data.message;
      }
      toast.error(msg);
    },
  });
};

export const useAddDivisionMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      divisionId,
      userId,
      role,
    }: {
      divisionId: string;
      userId: string;
      role: 'MEMBER' | 'COORDINATOR';
    }) => {
      const { data } = await apiClient.post(`/divisions/${divisionId}/members`, {
        userId,
        role,
      });
      return data;
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Anggota berhasil ditambahkan ke divisi.');
      queryClient.invalidateQueries({ queryKey: divisionKeys.all });
      queryClient.invalidateQueries({ queryKey: userKeys.list() });
      queryClient.invalidateQueries({ queryKey: authKeys.currentUser() });
    },
    onError: (error) => {
      let msg = 'Gagal menambahkan anggota ke divisi.';
      if (isAxiosError(error) && error.response?.data?.message) {
        msg = error.response.data.message;
      }
      toast.error(msg);
    },
  });
};

export const useUpdateDivisionMemberRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      divisionId,
      userId,
      role,
    }: {
      divisionId: string;
      userId: string;
      role: 'MEMBER' | 'COORDINATOR';
    }) => {
      const { data } = await apiClient.patch(
        `/divisions/${divisionId}/members/${userId}`,
        { role }
      );
      return data;
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Peran anggota divisi berhasil diperbarui.');
      queryClient.invalidateQueries({ queryKey: divisionKeys.all });
      queryClient.invalidateQueries({ queryKey: userKeys.list() });
      queryClient.invalidateQueries({ queryKey: authKeys.currentUser() });
    },
    onError: (error) => {
      let msg = 'Gagal memperbarui peran anggota.';
      if (isAxiosError(error) && error.response?.data?.message) {
        msg = error.response.data.message;
      }
      toast.error(msg);
    },
  });
};

export const useRemoveDivisionMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      divisionId,
      userId,
    }: {
      divisionId: string;
      userId: string;
    }) => {
      const { data } = await apiClient.delete(
        `/divisions/${divisionId}/members/${userId}`
      );
      return data;
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Anggota berhasil dihapus dari divisi.');
      queryClient.invalidateQueries({ queryKey: divisionKeys.all });
      queryClient.invalidateQueries({ queryKey: userKeys.list() });
      queryClient.invalidateQueries({ queryKey: authKeys.currentUser() });
    },
    onError: (error) => {
      let msg = 'Gagal menghapus anggota dari divisi.';
      if (isAxiosError(error) && error.response?.data?.message) {
        msg = error.response.data.message;
      }
      toast.error(msg);
    },
  });
};
