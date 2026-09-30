'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';
import { apiClient } from '@/lib/api-client';
import { epicKeys } from './query-keys';
import type { CreateEpicDTO, UpdateEpicDTO } from '../types';

export const useCreateEpic = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: CreateEpicDTO) => {
      const payload: Record<string, any> = {
        title: dto.title,
        description: dto.description || undefined,
        startDate: dto.startDate || undefined,
        endDate: dto.endDate || undefined,
        prokerTag: dto.prokerTag || undefined,
        scope: dto.scope,
      };

      if (dto.scope === 'DIVISION') {
        payload.ownerDivisionId = dto.ownerDivisionId;
      } else {
        payload.participatingDivisionIds = dto.participatingDivisionIds;
      }

      const { data } = await apiClient.post('/epics', payload);
      return data;
    },
    onSuccess: (data) => {
      toast.success(`Epic '${data.title}' berhasil dibuat!`);
      queryClient.invalidateQueries({ queryKey: epicKeys.all });
    },
    onError: (error) => {
      let msg = 'Gagal membuat epic.';
      if (isAxiosError(error) && error.response?.data?.message) {
        msg = error.response.data.message;
      }
      toast.error(msg);
    },
  });
};

export const useUpdateEpic = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      dto,
    }: {
      id: string;
      dto: UpdateEpicDTO;
    }) => {
      const { data } = await apiClient.patch(`/epics/${id}`, dto);
      return data;
    },
    onSuccess: (data) => {
      toast.success(`Epic '${data.title}' berhasil diperbarui.`);
      queryClient.invalidateQueries({ queryKey: epicKeys.all });
    },
    onError: (error) => {
      let msg = 'Gagal memperbarui epic.';
      if (isAxiosError(error) && error.response?.data?.message) {
        msg = error.response.data.message;
      }
      toast.error(msg);
    },
  });
};

export const useDeleteEpic = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete(`/epics/${id}`);
      return data;
    },
    onSuccess: () => {
      toast.success('Epic berhasil dihapus.');
      queryClient.invalidateQueries({ queryKey: epicKeys.all });
    },
    onError: (error) => {
      let msg = 'Gagal menghapus epic.';
      if (isAxiosError(error) && error.response?.data?.message) {
        msg = error.response.data.message;
      }
      toast.error(msg);
    },
  });
};
