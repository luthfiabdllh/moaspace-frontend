'use client';

import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { userKeys, divisionKeys } from './query-keys';
import type {
  UserListItem,
  DivisionItem,
  ActivityLogItem,
  QueryActivityLogsParams,
  ActivityLogsResponse,
} from '../types';

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

export const useActivityLogs = (entityType?: string, entityId?: string) => {
  return useQuery({
    queryKey: userKeys.activityLogs(entityType, entityId),
    queryFn: async (): Promise<ActivityLogItem[]> => {
      const { data } = await apiClient.get<{ items?: ActivityLogItem[] } | ActivityLogItem[]>(
        '/activity-logs',
        { params: { entityType, entityId, limit: 100 } }
      );
      return Array.isArray(data) ? data : data?.items ?? [];
    },
    enabled: !entityId || Boolean(entityId),
  });
};

export const useInfiniteActivityLogs = (
  params: Omit<QueryActivityLogsParams, 'page'>,
) => {
  return useInfiniteQuery({
    queryKey: userKeys.activityLogsInfinite(params),
    initialPageParam: 1,
    queryFn: async ({ pageParam = 1 }): Promise<ActivityLogsResponse> => {
      const { data } = await apiClient.get<ActivityLogsResponse>(
        '/activity-logs',
        {
          params: {
            ...params,
            page: pageParam,
          },
        },
      );
      return data;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage?.meta?.hasMore) {
        return lastPage.meta.page + 1;
      }
      return undefined;
    },
  });
};
