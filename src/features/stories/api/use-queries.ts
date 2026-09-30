'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { storyKeys } from './query-keys';
import type { StoryItem } from '../types';

export interface QueryStoriesParams {
  divisionId?: string;
  epicId?: string;
  isClosed?: boolean;
  search?: string;
}

export const useStories = (params?: QueryStoriesParams) => {
  return useQuery({
    queryKey: storyKeys.list(params),
    queryFn: async (): Promise<StoryItem[]> => {
      const searchParams = new URLSearchParams();
      if (params?.divisionId) searchParams.set('divisionId', params.divisionId);
      if (params?.epicId) searchParams.set('epicId', params.epicId);
      if (params?.isClosed !== undefined)
        searchParams.set('isClosed', String(params.isClosed));
      if (params?.search) searchParams.set('search', params.search);

      const queryStr = searchParams.toString() ? `?${searchParams.toString()}` : '';
      const { data } = await apiClient.get<StoryItem[]>(`/stories${queryStr}`);
      return data;
    },
    staleTime: 30 * 1000,
  });
};

export const useStory = (id: string, enabled = true) => {
  return useQuery({
    queryKey: storyKeys.detail(id),
    queryFn: async () => {
      const { data } = await apiClient.get(`/stories/${id}`);
      return data;
    },
    enabled: Boolean(id) && enabled,
    staleTime: 30 * 1000,
  });
};
