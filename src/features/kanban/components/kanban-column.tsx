'use client';

import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import type { TaskItem, TaskStatus } from '@/features/tasks/types';
import { KanbanCard } from './kanban-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface KanbanColumnProps {
  id: TaskStatus;
  title: string;
  tasks: TaskItem[];
  colorDot: string;
  onCardClick?: (task: TaskItem) => void;
  onAddTask?: (status: TaskStatus) => void;
  isCoordinatorOrAdmin?: boolean;
}

export function KanbanColumn({
  id,
  title,
  tasks,
  colorDot,
  onCardClick,
  onAddTask,
  isCoordinatorOrAdmin = false,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: {
      type: 'Column',
      status: id,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex flex-col flex-1 min-w-67.5 max-w-85 rounded-xl border border-border/80 bg-muted/30 p-3 transition-colors duration-200',
        isOver && 'border-primary/60 bg-primary/5 ring-1 ring-primary/20'
      )}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between pb-3 px-1">
        <div className="flex items-center gap-2">
          <div className={cn('size-2.5 rounded-full', colorDot)} />
          <h3 className="font-semibold text-xs text-foreground tracking-tight">
            {title}
          </h3>
          <Badge
            variant="secondary"
            className="h-5 px-1.5 font-mono text-3xs font-semibold"
          >
            {tasks.length}
          </Badge>

          {tasks.reduce((sum, t) => sum + ((t as any).storyPoints || 0), 0) > 0 && (
            <Badge
              variant="outline"
              className="h-5 px-1.5 font-mono text-3xs text-muted-foreground"
            >
              {tasks.reduce((sum, t) => sum + ((t as any).storyPoints || 0), 0)} SP
            </Badge>
          )}
        </div>

        {onAddTask && isCoordinatorOrAdmin && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onAddTask(id)}
            className="size-6 text-muted-foreground hover:text-foreground"
            title={`Tambah task di ${title}`}
          >
            <Plus className="size-3.5" />
          </Button>
        )}
      </div>

      {/* Cards List / Drop Area */}
      <div className="flex-1 overflow-y-auto space-y-2.5 min-h-64 pr-0.5">
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <KanbanCard key={task.id} task={task} onClick={onCardClick} />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="flex h-36 flex-col items-center justify-center rounded-lg border border-dashed border-border/70 p-4 text-center text-3xs text-muted-foreground/70">
            <span>Tidak ada task</span>
          </div>
        )}
      </div>
    </div>
  );
}
