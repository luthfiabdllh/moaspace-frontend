'use client';

import { useQueries } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { kanbanKeys } from '@/features/kanban/api/query-keys';
import { capacityKeys } from '@/features/capacity/api/query-keys';
import type { BoardColumns } from '@/features/kanban/types';
import type { MemberUtilization } from '@/features/capacity/types';

/**
 * Aggregates the kanban board + team capacity across every division a
 * coordinator leads, so a dashboard widget can show one combined picture
 * instead of one card per division.
 */
export function useCoordinatorOverview(divisionIds: string[]) {
  const boardQueries = useQueries({
    queries: divisionIds.map((divisionId) => ({
      queryKey: kanbanKeys.board(divisionId),
      queryFn: async (): Promise<BoardColumns> => {
        const { data } = await apiClient.get<BoardColumns>(`/divisions/${divisionId}/board`);
        return data;
      },
      staleTime: 10 * 1000,
    })),
  });

  const capacityQueries = useQueries({
    queries: divisionIds.map((divisionId) => ({
      queryKey: capacityKeys.division(divisionId),
      queryFn: async (): Promise<MemberUtilization[]> => {
        const { data } = await apiClient.get<MemberUtilization[]>(
          `/divisions/${divisionId}/capacity`
        );
        return data;
      },
      staleTime: 30 * 1000,
    })),
  });

  const isLoading =
    divisionIds.length > 0 &&
    (boardQueries.some((q) => q.isLoading) || capacityQueries.some((q) => q.isLoading));

  const mergedBoard: BoardColumns = {
    BACKLOG: [],
    TODO: [],
    IN_PROGRESS: [],
    REVIEW: [],
    DONE: [],
  };
  for (const q of boardQueries) {
    if (!q.data) continue;
    for (const key of Object.keys(mergedBoard)) {
      mergedBoard[key].push(...(q.data[key] ?? []));
    }
  }

  const mergedCapacities: MemberUtilization[] = capacityQueries.flatMap((q) => q.data ?? []);
  const overcapacityCount = mergedCapacities.filter((m) => m.utilizationPercentage > 100).length;

  return { board: mergedBoard, capacities: mergedCapacities, overcapacityCount, isLoading };
}
