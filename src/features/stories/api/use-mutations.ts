'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';
import { apiClient } from '@/lib/api-client';
import { storyKeys } from './query-keys';
import { epicKeys } from '@/features/epics/api/query-keys';
import { kanbanKeys } from '@/features/kanban/api/query-keys';
import type { CreateStoryDTO, UpdateStoryDTO } from '../types';

export const useCreateStory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: CreateStoryDTO) => {
      const payload: Record<string, any> = {
        divisionId: dto.divisionId,
        title: dto.title,
        epicId: dto.epicId || undefined,
        doneCriteria: dto.doneCriteria || undefined,
        targetDate: dto.targetDate || undefined,
        prokerTag: dto.prokerTag || undefined,
        sourceRequestId: dto.sourceRequestId || undefined,
      };

      const { data } = await apiClient.post('/stories', payload);
      return data;
    },
    onSuccess: (data) => {
      toast.success(`Story '${data.title}' berhasil dibuat!`);
      queryClient.invalidateQueries({ queryKey: storyKeys.all });
      queryClient.invalidateQueries({ queryKey: epicKeys.all });
      queryClient.invalidateQueries({ queryKey: kanbanKeys.all });
    },
    onError: (error) => {
      let msg = 'Gagal membuat story.';
      if (isAxiosError(error) && error.response?.data?.message) {
        msg = error.response.data.message;
      }
      toast.error(msg);
    },
  });
};

export const useUpdateStory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      dto,
    }: {
      id: string;
      dto: UpdateStoryDTO;
    }) => {
      const { data } = await apiClient.patch(`/stories/${id}`, dto);
      return data;
    },
    onSuccess: (data) => {
      toast.success('Story berhasil diperbarui!');
      queryClient.invalidateQueries({ queryKey: storyKeys.all });
      queryClient.invalidateQueries({ queryKey: epicKeys.all });
      queryClient.invalidateQueries({ queryKey: kanbanKeys.all });
    },
    onError: (error) => {
      let msg = 'Gagal memperbarui story.';
      if (isAxiosError(error) && error.response?.data?.message) {
        msg = error.response.data.message;
      }
      toast.error(msg);
    },
  });
};

export const useDeleteStory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete(`/stories/${id}`);
      return data;
    },
    onSuccess: () => {
      toast.success('Story berhasil dihapus.');
      queryClient.invalidateQueries({ queryKey: storyKeys.all });
      queryClient.invalidateQueries({ queryKey: epicKeys.all });
      queryClient.invalidateQueries({ queryKey: kanbanKeys.all });
    },
    onError: (error) => {
      let msg = 'Gagal menghapus story.';
      if (isAxiosError(error) && error.response?.data?.message) {
        msg = error.response.data.message;
      }
      toast.error(msg);
    },
  });
};
