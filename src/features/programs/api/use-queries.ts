'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { programKeys } from './query-keys';
import type { ProgramItem, ProgramDetail, QueryProgramsParams } from '../types';

export const usePrograms = (params?: QueryProgramsParams) => {
  return useQuery({
    queryKey: programKeys.list(params),
    queryFn: async (): Promise<ProgramItem[]> => {
      const { data } = await apiClient.get<ProgramItem[]>('/programs', {
        params,
      });
      return data;
    },
  });
};

export const useProgramDetail = (id: string) => {
  return useQuery({
    queryKey: programKeys.detail(id),
    queryFn: async (): Promise<ProgramDetail> => {
      const { data } = await apiClient.get<ProgramDetail>(`/programs/${id}`);
      return data;
    },
    enabled: Boolean(id),
  });
};
