'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { taskKeys } from './query-keys';
import type { TaskItem, TaskDetailItem, TaskStatus, TaskPriority } from '../types';

export interface QueryTasksParams {
  storyId?: string;
  divisionId?: string;
  assigneeId?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  search?: string;
}

export const useTasks = (params?: QueryTasksParams) => {
  return useQuery({
    queryKey: taskKeys.list(params),
    queryFn: async (): Promise<TaskItem[]> => {
      const searchParams = new URLSearchParams();
      if (params?.storyId) searchParams.set('storyId', params.storyId);
      if (params?.divisionId) searchParams.set('divisionId', params.divisionId);
      if (params?.assigneeId) searchParams.set('assigneeId', params.assigneeId);
      if (params?.status) searchParams.set('status', params.status);
      if (params?.priority) searchParams.set('priority', params.priority);
      if (params?.search) searchParams.set('search', params.search);

      const queryStr = searchParams.toString() ? `?${searchParams.toString()}` : '';
      const { data } = await apiClient.get<TaskItem[]>(`/tasks${queryStr}`);
      return data;
    },
    staleTime: 15 * 1000,
  });
};

export const useTask = (id: string, enabled = true) => {
  return useQuery({
    queryKey: taskKeys.detail(id),
    queryFn: async (): Promise<TaskDetailItem> => {
      const { data } = await apiClient.get<TaskDetailItem>(`/tasks/${id}`);
      return data;
    },
    enabled: Boolean(id) && enabled,
    staleTime: 15 * 1000,
  });
};
