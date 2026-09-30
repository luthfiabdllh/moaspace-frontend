'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';
import { apiClient } from '@/lib/api-client';
import { kanbanKeys } from './query-keys';
import { taskKeys } from '@/features/tasks/api/query-keys';
import { storyKeys } from '@/features/stories/api/query-keys';
import { epicKeys } from '@/features/epics/api/query-keys';
import type { TaskStatus, TaskItem } from '@/features/tasks/types';
import type { BoardColumns, MoveTaskDTO, BlockTaskDTO } from '../types';

export const useMoveTask = (divisionId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      dto,
    }: {
      id: string;
      dto: MoveTaskDTO;
    }) => {
      const { data } = await apiClient.patch(`/tasks/${id}/move`, dto);
      return data;
    },
    onMutate: async ({ id, dto }) => {
      // Optimistic UI update: Snapshot previous state
      const queryKey = divisionId
        ? kanbanKeys.board(divisionId)
        : kanbanKeys.me();

      await queryClient.cancelQueries({ queryKey });
      const previousBoard = queryClient.getQueryData<BoardColumns>(queryKey);

      if (previousBoard) {
        // Deep clone current columns
        const newBoard: BoardColumns = {
          BACKLOG: [...previousBoard.BACKLOG],
          TODO: [...previousBoard.TODO],
          IN_PROGRESS: [...previousBoard.IN_PROGRESS],
          REVIEW: [...previousBoard.REVIEW],
          DONE: [...previousBoard.DONE],
        };

        // Find and remove task from its current column
        let foundTask: TaskItem | undefined;
        for (const colKey of Object.keys(newBoard) as TaskStatus[]) {
          const idx = newBoard[colKey].findIndex((t) => t.id === id);
          if (idx !== -1) {
            foundTask = newBoard[colKey][idx];
            newBoard[colKey].splice(idx, 1);
            break;
          }
        }

        // Add task to target column
        if (foundTask) {
          const updatedTask: TaskItem = {
            ...foundTask,
            status: dto.status,
            position: dto.position,
          };
          newBoard[dto.status].push(updatedTask);
          queryClient.setQueryData(queryKey, newBoard);
        }
      }

      return { previousBoard, queryKey };
    },
    onError: (error, _variables, context) => {
      // Rollback to previous state on failure (such as HTTP 422 transition rule violation)
      if (context?.previousBoard && context?.queryKey) {
        queryClient.setQueryData(context.queryKey, context.previousBoard);
      }

      if (isAxiosError(error) && error.response?.data?.error === 'OVERCAPACITY_WARNING') {
        return; // Handled by Overcapacity Dialog in kanban-board
      }

      let msg = 'Gagal memindahkan kartu task.';
      if (isAxiosError(error) && error.response?.data?.message) {
        msg = error.response.data.message;
      }
      toast.error(msg, { duration: 4000 });
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: kanbanKeys.all });
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
      queryClient.invalidateQueries({ queryKey: storyKeys.all });
      queryClient.invalidateQueries({ queryKey: epicKeys.all });
    },
  });
};

export const useBlockTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      dto,
    }: {
      id: string;
      dto: BlockTaskDTO;
    }) => {
      const { data } = await apiClient.post(`/tasks/${id}/block`, dto);
      return data;
    },
    onSuccess: (data) => {
      toast.success(`Task '${data.title}' ditandai sebagai terkendala.`);
      queryClient.invalidateQueries({ queryKey: kanbanKeys.all });
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
    onError: (error) => {
      let msg = 'Gagal memasang tanda kendala.';
      if (isAxiosError(error) && error.response?.data?.message) {
        msg = error.response.data.message;
      }
      toast.error(msg);
    },
  });
};

export const useUnblockTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.post(`/tasks/${id}/unblock`);
      return data;
    },
    onSuccess: (data) => {
      toast.success(`Kendala pada '${data.title}' berhasil dilepas.`);
      queryClient.invalidateQueries({ queryKey: kanbanKeys.all });
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
    onError: (error) => {
      let msg = 'Gagal melepas kendala.';
      if (isAxiosError(error) && error.response?.data?.message) {
        msg = error.response.data.message;
      }
      toast.error(msg);
    },
  });
};
