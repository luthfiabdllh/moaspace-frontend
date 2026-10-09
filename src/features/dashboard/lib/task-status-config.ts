import type { TaskStatus } from '@/features/tasks/types';

export const TASK_STATUS_CONFIG: { status: TaskStatus; label: string; dot: string; bar: string }[] = [
  { status: 'BACKLOG', label: 'Backlog', dot: 'bg-zinc-400', bar: 'bg-zinc-400' },
  { status: 'TODO', label: 'To Do', dot: 'bg-blue-500', bar: 'bg-blue-500' },
  { status: 'IN_PROGRESS', label: 'In Progress', dot: 'bg-amber-500', bar: 'bg-amber-500' },
  { status: 'REVIEW', label: 'Review', dot: 'bg-purple-500', bar: 'bg-purple-500' },
  { status: 'DONE', label: 'Done', dot: 'bg-emerald-500', bar: 'bg-emerald-500' },
];
