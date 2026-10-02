'use client';

import type { ComponentProps } from 'react';
import {
  Calendar,
  Flag,
  Target,
  Bookmark,
  GripVertical,
  Lock,
  ShieldAlert,
  GitPullRequest,
} from 'lucide-react';
import Link from 'next/link';

import {
  KanbanItem,
  KanbanItemHandle,
} from '@/components/reui/kanban';
import type { TaskItem, TaskPriority } from '@/features/tasks/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface KanbanCardProps
  extends Omit<ComponentProps<typeof KanbanItem>, 'value' | 'children' | 'onClick'> {
  task: TaskItem;
  onClick?: (task: TaskItem) => void;
  asHandle?: boolean;
  isOverlay?: boolean;
  isDraggingOverlay?: boolean;
}

const priorityColors: Record<TaskPriority, { bg: string; text: string; label: string }> = {
  LOW: { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-400', label: 'Low' },
  MEDIUM: { bg: 'bg-sky-50 dark:bg-sky-950/40', text: 'text-sky-700 dark:text-sky-300', label: 'Medium' },
  HIGH: { bg: 'bg-orange-50 dark:bg-orange-950/40', text: 'text-orange-700 dark:text-orange-300', label: 'High' },
  URGENT: { bg: 'bg-rose-50 dark:bg-rose-950/40', text: 'text-rose-700 dark:text-rose-300', label: 'Urgent' },
};

export function KanbanCard({
  task,
  onClick,
  asHandle = true,
  isOverlay = false,
  isDraggingOverlay = false,
  className,
  ...props
}: KanbanCardProps) {
  const isActualOverlay = isOverlay || isDraggingOverlay;

  const isOverdue =
    task.dueDate &&
    task.status !== 'DONE' &&
    new Date(task.dueDate) < new Date();

  const cardContent = (
    <Card
      onClick={() => onClick?.(task)}
      className={cn(
        'relative border bg-card transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-xs hover:border-primary/40 select-none',
        task.isBlocked && 'border-rose-400/70 dark:border-rose-500/60 bg-rose-50/20 dark:bg-rose-950/10',
        isActualOverlay && 'shadow-xl border-primary ring-2 ring-primary/20 rotate-1'
      )}
    >
      <CardContent className="p-3.5 space-y-2.5">
        {/* Header Badges & Indicator */}
        <div className="flex items-center justify-between gap-1.5">
          <div className="flex flex-wrap items-center gap-1.5 min-w-0">
            {task.epicTitle && (
              <span
                title={`Epic: ${task.epicTitle}`}
                className="inline-flex items-center gap-1 text-3xs font-medium px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 truncate max-w-28"
              >
                <Target className="size-2.5 shrink-0 text-indigo-500" />
                <span className="truncate">{task.epicTitle}</span>
              </span>
            )}

            {task.storyTitle && (
              <span
                title={task.storyTitle}
                className="inline-flex items-center gap-1 text-3xs font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground truncate max-w-32"
              >
                <Bookmark className="size-2.5 shrink-0 text-primary" />
                <span className="truncate">{task.storyTitle}</span>
              </span>
            )}

            {task.sourceRequestId && (
              <Link
                href={`/requests/${task.sourceRequestId}`}
                onClick={(e) => e.stopPropagation()}
                title={`Permohonan Kolaborasi: ${task.requestTitle || 'Lihat Permohonan'}`}
                className="inline-flex items-center gap-1 text-3xs font-semibold px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-300/60 dark:border-amber-700/60 hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-colors truncate max-w-32"
              >
                <GitPullRequest className="size-2.5 shrink-0 text-amber-600 dark:text-amber-400" />
                <span className="truncate">Req: {task.requestTitle || 'Kolaborasi'}</span>
              </Link>
            )}

            <Badge
              variant="outline"
              className={cn(
                'text-3xs px-1.5 py-0 gap-0.5',
                priorityColors[task.priority].bg,
                priorityColors[task.priority].text
              )}
            >
              <Flag className="size-2.5" />
              {priorityColors[task.priority].label}
            </Badge>

            {task.storyPoints !== null && task.storyPoints !== undefined && (
              <span
                title={`Story Point: ${task.storyPoints}${task.spLockedAt ? ' (Terkunci)' : ''}`}
                className="inline-flex items-center gap-0.5 text-3xs font-mono font-bold px-1.5 py-0.5 rounded bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800/60"
              >
                {task.storyPoints} SP
                {task.spLockedAt && <Lock className="size-2 text-violet-500 ml-0.5" />}
              </span>
            )}

            {task.revisionCount > 0 && (
              <span className="text-3xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400 px-1 rounded border border-amber-300/40">
                Rev {task.revisionCount}x
              </span>
            )}
          </div>

          {/* Grip Icon Indicator */}
          <div
            className="text-muted-foreground/40 group-hover:text-foreground/80 p-0.5 rounded transition-colors"
            title="Tarik kartu untuk memindahkan"
          >
            <GripVertical className="size-3.5" />
          </div>
        </div>

        {/* Title */}
        <h4 className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-relaxed">
          {task.title}
        </h4>

        {/* Blocker Alert Banner if Blocked */}
        {task.isBlocked && (
          <div className="rounded-md border border-rose-300/70 bg-rose-500/10 p-2 text-2xs text-rose-700 dark:text-rose-300 flex items-start gap-1.5">
            <ShieldAlert className="size-3.5 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
            <div className="space-y-0.5 min-w-0">
              <span className="font-semibold block">Terkendala</span>
              {task.blockedReason && (
                <p className="line-clamp-2 text-3xs opacity-90 leading-tight">
                  {task.blockedReason}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Footer Info: Assignee & Due Date */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/40 text-2xs text-muted-foreground">
          {/* Assignee */}
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="size-5 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-3xs shrink-0">
              {task.assigneeName ? task.assigneeName.charAt(0).toUpperCase() : '?'}
            </div>
            <span className="truncate text-3xs font-medium text-foreground max-w-24">
              {task.assigneeName || (
                <span className="text-muted-foreground/60 italic font-normal">Unassigned</span>
              )}
            </span>
          </div>

          {/* Due Date */}
          {task.dueDate && (
            <div
              className={cn(
                'flex items-center gap-1 text-3xs shrink-0',
                isOverdue ? 'text-destructive font-semibold' : 'text-muted-foreground'
              )}
            >
              <Calendar className="size-3" />
              <span>
                {new Date(task.dueDate).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                })}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <KanbanItem value={task.id} className={className} {...props}>
      {asHandle && !isActualOverlay ? (
        <KanbanItemHandle>{cardContent}</KanbanItemHandle>
      ) : (
        cardContent
      )}
    </KanbanItem>
  );
}
