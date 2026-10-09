'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { calendarKeys } from './query-keys';
import type { CalendarStatusResponse } from '../types';

export const useCalendarStatus = () => {
  return useQuery({
    queryKey: calendarKeys.status(),
    queryFn: async (): Promise<CalendarStatusResponse> => {
      const { data } = await apiClient.get<CalendarStatusResponse>('/calendar/status');
      return data;
    },
    staleTime: 1000 * 60,
  });
};
