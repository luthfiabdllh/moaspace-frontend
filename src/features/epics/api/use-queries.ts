'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { epicKeys } from './query-keys';
import type { EpicItem } from '../types';

export interface QueryEpicsParams {
  scope?: 'DIVISION' | 'CROSS';
  divisionId?: string;
  isClosed?: boolean;
  search?: string;
}

export const useEpics = (params?: QueryEpicsParams) => {
  return useQuery({
    queryKey: epicKeys.list(params),
    queryFn: async (): Promise<EpicItem[]> => {
      const searchParams = new URLSearchParams();
      if (params?.scope) searchParams.set('scope', params.scope);
      if (params?.divisionId) searchParams.set('divisionId', params.divisionId);
      if (params?.isClosed !== undefined)
        searchParams.set('isClosed', String(params.isClosed));
      if (params?.search) searchParams.set('search', params.search);

      const queryStr = searchParams.toString() ? `?${searchParams.toString()}` : '';
      const { data } = await apiClient.get<EpicItem[]>(`/epics${queryStr}`);
      return data;
    },
    staleTime: 30 * 1000,
  });
};

export const useEpic = (id: string, enabled = true) => {
  return useQuery({
    queryKey: epicKeys.detail(id),
    queryFn: async () => {
      const { data } = await apiClient.get(`/epics/${id}`);
      return data;
    },
    enabled: Boolean(id) && enabled,
    staleTime: 30 * 1000,
  });
};
