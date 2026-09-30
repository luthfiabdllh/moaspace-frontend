'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { userKeys, divisionKeys } from './query-keys';
import type { UserListItem, DivisionItem } from '../types';

export const useUsers = () => {
  return useQuery({
    queryKey: userKeys.list(),
    queryFn: async (): Promise<UserListItem[]> => {
      const { data } = await apiClient.get<UserListItem[]>('/users');
      return data;
    },
  });
};

export const useDivisions = () => {
  return useQuery({
    queryKey: divisionKeys.all,
    queryFn: async (): Promise<DivisionItem[]> => {
      const { data } = await apiClient.get<DivisionItem[]>('/divisions');
      return data;
    },
  });
};
