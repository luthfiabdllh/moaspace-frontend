'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';
import { apiClient } from '@/lib/api-client';
import { taskKeys } from './query-keys';
import { storyKeys } from '@/features/stories/api/query-keys';
import { epicKeys } from '@/features/epics/api/query-keys';
import { kanbanKeys } from '@/features/kanban/api/query-keys';
import type { CreateTaskDTO, UpdateTaskDTO } from '../types';
import { friendlyTaskErrorMessage } from '../lib/task-error-messages';

export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: CreateTaskDTO) => {
      const payload: Partial<CreateTaskDTO> = {
        storyId: dto.storyId,
        title: dto.title,
        description: dto.description || undefined,
        assigneeId: dto.assigneeId || undefined,
        status: dto.status || 'BACKLOG',
        priority: dto.priority || 'MEDIUM',
        storyPoints: dto.storyPoints ?? undefined,
        override: dto.override ?? undefined,
        dueDate: dto.dueDate ? new Date(dto.dueDate).toISOString() : undefined,
        isBlocked: dto.isBlocked ?? false,
        blockedReason: dto.blockedReason || undefined,
      };

      const { data } = await apiClient.post('/tasks', payload);
      return data;
    },
    onSuccess: (data) => {
      toast.success(`Task '${data.title}' berhasil dibuat!`);
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
      queryClient.invalidateQueries({ queryKey: storyKeys.all });
      queryClient.invalidateQueries({ queryKey: epicKeys.all });
      queryClient.invalidateQueries({ queryKey: kanbanKeys.all });
    },
    onError: (error) => {
      let msg = 'Gagal membuat task.';
      if (isAxiosError(error) && error.response?.data?.message) {
        msg = error.response.data.message;
      }
      toast.error(msg);
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      dto,
    }: {
      id: string;
      dto: UpdateTaskDTO;
    }) => {
      const { data } = await apiClient.patch(`/tasks/${id}`, dto);
      return data;
    },
    onSuccess: () => {
      toast.success('Task berhasil diperbarui!');
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
      queryClient.invalidateQueries({ queryKey: storyKeys.all });
      queryClient.invalidateQueries({ queryKey: epicKeys.all });
      queryClient.invalidateQueries({ queryKey: kanbanKeys.all });
    },
    onError: (error) => {
      let msg = 'Gagal memperbarui task.';
      if (isAxiosError(error) && error.response?.data?.message) {
        msg = friendlyTaskErrorMessage(error.response.data.message);
      }
      toast.error(msg);
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete(`/tasks/${id}`);
      return data;
    },
    onSuccess: () => {
      toast.success('Task berhasil dihapus.');
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
      queryClient.invalidateQueries({ queryKey: storyKeys.all });
      queryClient.invalidateQueries({ queryKey: epicKeys.all });
      queryClient.invalidateQueries({ queryKey: kanbanKeys.all });
    },
    onError: (error) => {
      let msg = 'Gagal menghapus task.';
      if (isAxiosError(error) && error.response?.data?.message) {
        msg = error.response.data.message;
      }
      toast.error(msg);
    },
  });
};
