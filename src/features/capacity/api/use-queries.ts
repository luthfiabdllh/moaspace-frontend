'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { capacityKeys } from './query-keys';
import type { MemberUtilization } from '../types';

export const useMyCapacity = () => {
  return useQuery({
    queryKey: capacityKeys.me(),
    queryFn: async (): Promise<MemberUtilization> => {
      const { data } = await apiClient.get<MemberUtilization>('/me/capacity');
      return data;
    },
    staleTime: 30 * 1000,
  });
};

export const useDivisionCapacities = (divisionId?: string, weekStart?: string) => {
  return useQuery({
    queryKey: capacityKeys.division(divisionId ?? '', weekStart),
    queryFn: async (): Promise<MemberUtilization[]> => {
      if (!divisionId) return [];
      const query = weekStart ? `?weekStart=${encodeURIComponent(weekStart)}` : '';
      const { data } = await apiClient.get<MemberUtilization[]>(
        `/divisions/${divisionId}/capacity${query}`
      );
      return data;
    },
    enabled: Boolean(divisionId),
    staleTime: 30 * 1000,
  });
};
