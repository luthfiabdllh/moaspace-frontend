'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { divisionKeys } from './query-keys';
import type { DivisionItem, DivisionDetail } from '../types';

export const useDivisions = () => {
  return useQuery({
    queryKey: divisionKeys.lists(),
    queryFn: async (): Promise<DivisionItem[]> => {
      const { data } = await apiClient.get<DivisionItem[]>('/divisions');
      return data;
    },
    staleTime: 60 * 1000,
  });
};

export const useDivision = (idOrSlug: string, enabled = true) => {
  return useQuery({
    queryKey: divisionKeys.detail(idOrSlug),
    queryFn: async (): Promise<DivisionDetail> => {
      const { data } = await apiClient.get<DivisionDetail>(`/divisions/${idOrSlug}`);
      return data;
    },
    enabled: Boolean(idOrSlug) && enabled,
    staleTime: 30 * 1000,
  });
};
