import * as z from 'zod';
import type { TaskItem, TaskStatus, TaskPriority } from '@/features/tasks/types';

export const kanbanColumnEnum = z.enum([
  'BACKLOG',
  'TODO',
  'IN_PROGRESS',
  'REVIEW',
  'DONE',
]);

export interface BoardColumns {
  BACKLOG: TaskItem[];
  TODO: TaskItem[];
  IN_PROGRESS: TaskItem[];
  REVIEW: TaskItem[];
  DONE: TaskItem[];
}

export type SwimlaneMode = 'NONE' | 'EPIC' | 'STORY' | 'ASSIGNEE';

export const moveTaskSchema = z.object({
  status: kanbanColumnEnum,
  position: z.string().min(1, { error: 'Posisi tidak boleh kosong.' }),
});
export type MoveTaskDTO = z.infer<typeof moveTaskSchema>;

export const blockTaskSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(1, { error: 'Alasan kendala wajib diisi.' })
    .max(500, { error: 'Alasan kendala maksimal 500 karakter.' }),
});
export type BlockTaskDTO = z.infer<typeof blockTaskSchema>;

export const queryBoardSchema = z.object({
  assigneeId: z.string().optional(),
  epicId: z.string().optional(),
  prokerTag: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  isBlocked: z.boolean().optional(),
  search: z.string().optional(),
});
export type QueryBoardParams = z.infer<typeof queryBoardSchema>;
