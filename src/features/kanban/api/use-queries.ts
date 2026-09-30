'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { kanbanKeys } from './query-keys';
import type { BoardColumns, QueryBoardParams } from '../types';

export const useDivisionBoard = (
  divisionId: string,
  params?: QueryBoardParams,
  enabled = true
) => {
  return useQuery({
    queryKey: kanbanKeys.board(divisionId, params),
    queryFn: async (): Promise<BoardColumns> => {
      const searchParams = new URLSearchParams();
      if (params?.assigneeId) searchParams.set('assigneeId', params.assigneeId);
      if (params?.epicId) searchParams.set('epicId', params.epicId);
      if (params?.prokerTag) searchParams.set('prokerTag', params.prokerTag);
      if (params?.priority) searchParams.set('priority', params.priority);
      if (params?.isBlocked !== undefined)
        searchParams.set('isBlocked', String(params.isBlocked));
      if (params?.search) searchParams.set('search', params.search);

      const queryStr = searchParams.toString() ? `?${searchParams.toString()}` : '';
      const { data } = await apiClient.get<BoardColumns>(
        `/divisions/${divisionId}/board${queryStr}`
      );
      return data;
    },
    enabled: Boolean(divisionId) && enabled,
    staleTime: 10 * 1000,
  });
};

export const useMeTasks = (enabled = true) => {
  return useQuery({
    queryKey: kanbanKeys.me(),
    queryFn: async (): Promise<BoardColumns> => {
      const { data } = await apiClient.get<BoardColumns>('/me/tasks');
      return data;
    },
    enabled,
    staleTime: 10 * 1000,
  });
};
