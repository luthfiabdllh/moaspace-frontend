'use client';

import type { ComponentProps } from 'react';
import {
  KanbanColumn as ReuiKanbanColumn,
  KanbanColumnContent,
  KanbanColumnHandle,
} from '@/components/reui/kanban';
import { Plus, GripVertical } from 'lucide-react';
import type { TaskItem, TaskStatus } from '@/features/tasks/types';
import { KanbanCard } from './kanban-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface KanbanColumnProps
  extends Omit<ComponentProps<typeof ReuiKanbanColumn>, 'children' | 'value'> {
  id: TaskStatus;
  value?: TaskStatus;
  title: string;
  tasks: TaskItem[];
  colorDot: string;
  onCardClick?: (task: TaskItem) => void;
  onAddTask?: (status: TaskStatus) => void;
  isCoordinatorOrAdmin?: boolean;
  isOverlay?: boolean;
}

export function KanbanColumn({
  id,
  value,
  title,
  tasks,
  colorDot,
  onCardClick,
  onAddTask,
  isCoordinatorOrAdmin = false,
  isOverlay = false,
  className,
  ...props
}: KanbanColumnProps) {
  const columnValue = value || id;

  return (
    <ReuiKanbanColumn
      value={columnValue}
      className={cn(
        'flex flex-col flex-1 min-w-72 max-w-85 rounded-xl border border-border/80 bg-muted/30 p-3 transition-colors duration-200 select-none',
        className
      )}
      {...props}
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

        <div className="flex items-center gap-1">
          {onAddTask && isCoordinatorOrAdmin && !isOverlay && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onAddTask(columnValue)}
              className="size-6 text-muted-foreground hover:text-foreground"
              title={`Tambah task di ${title}`}
            >
              <Plus className="size-3.5" />
            </Button>
          )}

          {!isOverlay && (
            <KanbanColumnHandle asChild>
              <Button
                size="icon"
                variant="ghost"
                className="size-6 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing"
                title="Tarik untuk memindahkan kolom"
              >
                <GripVertical className="size-3.5" />
              </Button>
            </KanbanColumnHandle>
          )}
        </div>
      </div>

      {/* Cards List / Drop Area */}
      <KanbanColumnContent
        value={columnValue}
        className="flex-1 overflow-y-auto space-y-2.5 min-h-64 pr-0.5"
      >
        {tasks.map((task) => (
          <KanbanCard
            key={task.id}
            task={task}
            onClick={onCardClick}
            asHandle={!isOverlay}
            isOverlay={isOverlay}
          />
        ))}

        {tasks.length === 0 && (
          <div className="flex h-36 flex-col items-center justify-center rounded-lg border border-dashed border-border/70 p-4 text-center text-3xs text-muted-foreground/70">
            <span>Tidak ada task</span>
          </div>
        )}
      </KanbanColumnContent>
    </ReuiKanbanColumn>
  );
}
