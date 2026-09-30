'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';
import { apiClient } from '@/lib/api-client';
import { capacityKeys } from './query-keys';
import type {
  CreateCapacityRequestDTO,
  ReviewCapacityRequestDTO,
} from '../types';

export const useRequestCapacity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: CreateCapacityRequestDTO) => {
      const { data } = await apiClient.post('/me/capacity/request', dto);
      return data;
    },
    onSuccess: () => {
      toast.success('Pengajuan penyesuaian kapasitas berhasil dikirim!');
      queryClient.invalidateQueries({ queryKey: capacityKeys.all });
    },
    onError: (error) => {
      let msg = 'Gagal mengajukan penyesuaian kapasitas.';
      if (isAxiosError(error) && error.response?.data?.message) {
        msg = error.response.data.message;
      }
      toast.error(msg);
    },
  });
};

export const useReviewCapacity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      capacityId,
      dto,
    }: {
      capacityId: string;
      dto: ReviewCapacityRequestDTO;
    }) => {
      const { data } = await apiClient.patch(`/capacity/requests/${capacityId}`, dto);
      return data;
    },
    onSuccess: (_, variables) => {
      const actionText = variables.dto.action === 'APPROVE' ? 'disetujui' : 'ditolak';
      toast.success(`Pengajuan kapasitas berhasil ${actionText}!`);
      queryClient.invalidateQueries({ queryKey: capacityKeys.all });
    },
    onError: (error) => {
      let msg = 'Gagal memproses pengajuan kapasitas.';
      if (isAxiosError(error) && error.response?.data?.message) {
        msg = error.response.data.message;
      }
      toast.error(msg);
    },
  });
};
