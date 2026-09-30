'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import type { TaskItem, TaskStatus } from '@/features/tasks/types';
import type { BoardColumns, SwimlaneMode } from '../types';
import { useMoveTask } from '../api/use-mutations';
import { KanbanColumn } from './kanban-column';
import { KanbanCard } from './kanban-card';
import { TaskDetailSheet } from '@/features/tasks/components/task-detail-sheet';
import { CreateTaskDialog } from '@/features/tasks/components/create-task-dialog';
import { Badge } from '@/components/ui/badge';
import { Bookmark, User } from 'lucide-react';

interface KanbanBoardProps {
  columns: BoardColumns;
  divisionId?: string;
  isCoordinatorOrAdmin?: boolean;
  swimlaneMode?: SwimlaneMode;
}

const COLUMN_DEFS: { id: TaskStatus; title: string; colorDot: string }[] = [
  { id: 'BACKLOG', title: 'Backlog', colorDot: 'bg-zinc-400' },
  { id: 'TODO', title: 'To Do', colorDot: 'bg-blue-500' },
  { id: 'IN_PROGRESS', title: 'In Progress', colorDot: 'bg-amber-500' },
  { id: 'REVIEW', title: 'Review', colorDot: 'bg-purple-500' },
  { id: 'DONE', title: 'Done', colorDot: 'bg-emerald-500' },
];

export function KanbanBoard({
  columns: initialColumns,
  divisionId,
  isCoordinatorOrAdmin = false,
  swimlaneMode = 'NONE',
}: KanbanBoardProps) {
  const [board, setBoard] = useState<BoardColumns>(initialColumns);
  const [activeTask, setActiveTask] = useState<TaskItem | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [createTaskStatus, setCreateTaskStatus] = useState<TaskStatus | null>(null);

  const moveMutation = useMoveTask(divisionId);

  // Sync board with query data
  useEffect(() => {
    setBoard(initialColumns);
  }, [initialColumns]);

  // Pointer sensor with drag activation distance
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  // Helper to find task and column
  const findTaskAndColumn = (taskId: string) => {
    for (const colDef of COLUMN_DEFS) {
      const task = board[colDef.id].find((t) => t.id === taskId);
      if (task) {
        return { task, colId: colDef.id };
      }
    }
    return null;
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const found = findTaskAndColumn(String(active.id));
    if (found) {
      setActiveTask(found.task);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    const activeInfo = findTaskAndColumn(activeId);
    if (!activeInfo) return;

    const sourceCol = activeInfo.colId;
    let targetCol: TaskStatus | null = null;
    let targetIndex = 0;

    // Check if dropped directly onto a column container
    const isOverColumn = COLUMN_DEFS.some((c) => c.id === overId);
    if (isOverColumn) {
      targetCol = overId as TaskStatus;
      targetIndex = board[targetCol].length;
    } else {
      // Dropped onto another task card
      const overInfo = findTaskAndColumn(overId);
      if (overInfo) {
        targetCol = overInfo.colId;
        targetIndex = board[targetCol].findIndex((t) => t.id === overId);
      }
    }

    if (!targetCol) return;

    // Calculate fractional position
    const targetTasks = board[targetCol].filter((t) => t.id !== activeId);
    let position = 'a0';

    if (targetTasks.length === 0) {
      position = 'a0';
    } else if (targetIndex <= 0) {
      position = `a${Date.now()}_0`;
    } else if (targetIndex >= targetTasks.length) {
      position = `z${Date.now()}`;
    } else {
      position = `m${Date.now()}_${targetIndex}`;
    }

    // Call mutation (optimistic update and rollback handled by useMoveTask)
    try {
      await moveMutation.mutateAsync({
        id: activeId,
        dto: {
          status: targetCol,
          position,
        },
      });
    } catch {
      // Handled in mutation onError (toast and rollback)
    }
  };

  // Grouping for Swimlanes
  const swimlanes = useMemo(() => {
    if (swimlaneMode === 'NONE') return null;

    // Flatten all tasks
    const allTasks = Object.values(board).flat();

    if (swimlaneMode === 'STORY') {
      const groups = new Map<string, { title: string; tasks: TaskItem[] }>();

      allTasks.forEach((t) => {
        const key = t.storyId || 'no-story';
        const title = t.storyTitle || 'Tanpa Story (Pekerjaan Rutin)';
        if (!groups.has(key)) {
          groups.set(key, { title, tasks: [] });
        }
        groups.get(key)!.tasks.push(t);
      });

      return Array.from(groups.entries()).map(([id, val]) => ({
        id,
        title: val.title,
        icon: Bookmark,
        columns: {
          BACKLOG: val.tasks.filter((t) => t.status === 'BACKLOG'),
          TODO: val.tasks.filter((t) => t.status === 'TODO'),
          IN_PROGRESS: val.tasks.filter((t) => t.status === 'IN_PROGRESS'),
          REVIEW: val.tasks.filter((t) => t.status === 'REVIEW'),
          DONE: val.tasks.filter((t) => t.status === 'DONE'),
        } as BoardColumns,
      }));
    }

    if (swimlaneMode === 'ASSIGNEE') {
      const groups = new Map<string, { title: string; tasks: TaskItem[] }>();

      allTasks.forEach((t) => {
        const key = t.assigneeId || 'unassigned';
        const title = t.assigneeName || 'Belum Ditugaskan (Unassigned)';
        if (!groups.has(key)) {
          groups.set(key, { title, tasks: [] });
        }
        groups.get(key)!.tasks.push(t);
      });

      return Array.from(groups.entries()).map(([id, val]) => ({
        id,
        title: val.title,
        icon: User,
        columns: {
          BACKLOG: val.tasks.filter((t) => t.status === 'BACKLOG'),
          TODO: val.tasks.filter((t) => t.status === 'TODO'),
          IN_PROGRESS: val.tasks.filter((t) => t.status === 'IN_PROGRESS'),
          REVIEW: val.tasks.filter((t) => t.status === 'REVIEW'),
          DONE: val.tasks.filter((t) => t.status === 'DONE'),
        } as BoardColumns,
      }));
    }

    return null;
  }, [board, swimlaneMode]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-6">
        {/* Standard Single View */}
        {swimlaneMode === 'NONE' && (
          <div className="flex gap-4 overflow-x-auto pb-4 pt-1 items-start min-h-137.5">
            {COLUMN_DEFS.map((col) => (
              <KanbanColumn
                key={col.id}
                id={col.id}
                title={col.title}
                colorDot={col.colorDot}
                tasks={board[col.id]}
                onCardClick={(task) => setSelectedTaskId(task.id)}
                onAddTask={(status) => setCreateTaskStatus(status)}
                isCoordinatorOrAdmin={isCoordinatorOrAdmin}
              />
            ))}
          </div>
        )}

        {/* Swimlanes View */}
        {swimlanes && (
          <div className="space-y-6">
            {swimlanes.map((lane) => {
              const Icon = lane.icon;
              return (
                <div key={lane.id} className="space-y-2.5">
                  <div className="flex items-center gap-2 px-1">
                    <Icon className="size-4 text-primary" />
                    <h3 className="font-bold text-sm text-foreground">
                      {lane.title}
                    </h3>
                    <Badge variant="outline" className="text-3xs font-mono">
                      {Object.values(lane.columns).reduce((a, b) => a + b.length, 0)} Task
                    </Badge>
                  </div>

                  <div className="flex gap-4 overflow-x-auto pb-2 items-start">
                    {COLUMN_DEFS.map((col) => (
                      <KanbanColumn
                        key={`${lane.id}-${col.id}`}
                        id={col.id}
                        title={col.title}
                        colorDot={col.colorDot}
                        tasks={lane.columns[col.id]}
                        onCardClick={(task) => setSelectedTaskId(task.id)}
                        isCoordinatorOrAdmin={isCoordinatorOrAdmin}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Drag Overlay when moving a card */}
      <DragOverlay>
        {activeTask ? (
          <KanbanCard task={activeTask} isDraggingOverlay />
        ) : null}
      </DragOverlay>

      {/* Task Detail Sheet */}
      <TaskDetailSheet
        taskId={selectedTaskId}
        open={Boolean(selectedTaskId)}
        onOpenChange={(open) => !open && setSelectedTaskId(null)}
        isCoordinatorOrAdmin={isCoordinatorOrAdmin}
      />

      {/* Create Task Dialog */}
      {divisionId && (
        <CreateTaskDialog
          open={Boolean(createTaskStatus)}
          onOpenChange={(open) => !open && setCreateTaskStatus(null)}
          storyId=""
          divisionId={divisionId}
        />
      )}
    </DndContext>
  );
}
