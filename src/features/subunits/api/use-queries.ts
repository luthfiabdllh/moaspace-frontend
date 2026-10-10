'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { subunitKeys } from './query-keys';
import type { SubunitItem, SubunitDetail } from '../types';

export const useSubunits = () => {
  return useQuery({
    queryKey: subunitKeys.lists(),
    queryFn: async (): Promise<SubunitItem[]> => {
      const { data } = await apiClient.get<SubunitItem[]>('/subunits');
      return data;
    },
  });
};

export const useSubunitDetail = (idOrSlug: string) => {
  return useQuery({
    queryKey: subunitKeys.detail(idOrSlug),
    queryFn: async (): Promise<SubunitDetail> => {
      const { data } = await apiClient.get<SubunitDetail>(`/subunits/${idOrSlug}`);
      return data;
    },
    enabled: Boolean(idOrSlug),
  });
};
