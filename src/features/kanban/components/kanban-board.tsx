'use client';

import { useState, useMemo } from 'react';
import { isAxiosError } from 'axios';
import {
  Kanban,
  KanbanBoard as ReuiKanbanBoard,
  KanbanOverlay,
  type KanbanCommitMeta,
} from '@/components/reui/kanban';

import type { TaskItem, TaskStatus } from '@/features/tasks/types';
import type { BoardColumns, MoveTaskDTO, SwimlaneMode } from '../types';
import { useMoveTask } from '../api/use-mutations';
import { KanbanColumn } from './kanban-column';
import { KanbanCard } from './kanban-card';
import { TaskDetailSheet } from '@/features/tasks/components/task-detail-sheet';
import { CreateTaskDialog } from '@/features/tasks/components/create-task-dialog';
import { OvercapacityDialog } from '@/features/capacity/components/overcapacity-dialog';
import type { OvercapacityWarningData } from '@/features/capacity/types';
import { Badge } from '@/components/ui/badge';
import { Bookmark, User, Target } from 'lucide-react';

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
  const [board, setBoard] = useState<BoardColumns>(() => ({
    BACKLOG: initialColumns?.BACKLOG || [],
    TODO: initialColumns?.TODO || [],
    IN_PROGRESS: initialColumns?.IN_PROGRESS || [],
    REVIEW: initialColumns?.REVIEW || [],
    DONE: initialColumns?.DONE || [],
  }));

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [createTaskStatus, setCreateTaskStatus] = useState<TaskStatus | null>(null);

  // Overcapacity dialog state for moves
  const [overcapacityData, setOvercapacityData] = useState<OvercapacityWarningData | null>(null);
  const [pendingMove, setPendingMove] = useState<{
    id: string;
    dto: MoveTaskDTO;
    previousValue: BoardColumns;
  } | null>(null);
  const [isOvercapacityOpen, setIsOvercapacityOpen] = useState(false);

  const moveMutation = useMoveTask(divisionId);

  // Sync board with query data while preserving active column ordering.
  // Adjusted during render (not in an effect) per React's guidance for
  // "deriving state from props that changed" — avoids an extra render pass
  // and satisfies react-hooks/set-state-in-effect.
  const [prevInitialColumns, setPrevInitialColumns] = useState(initialColumns);
  if (initialColumns !== prevInitialColumns) {
    setPrevInitialColumns(initialColumns);
    if (initialColumns) {
      setBoard((prev) => {
        const keys =
          Object.keys(prev).length === 5
            ? Object.keys(prev)
            : ['BACKLOG', 'TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'];

        const updated: BoardColumns = {
          BACKLOG: initialColumns.BACKLOG || [],
          TODO: initialColumns.TODO || [],
          IN_PROGRESS: initialColumns.IN_PROGRESS || [],
          REVIEW: initialColumns.REVIEW || [],
          DONE: initialColumns.DONE || [],
        };

        const result = {} as BoardColumns;
        keys.forEach((k) => {
          result[k] = updated[k as TaskStatus] || [];
        });
        return result;
      });
    }
  }

  const handleValueCommit = async (
    newColumns: Record<string, TaskItem[]>,
    meta: KanbanCommitMeta<TaskItem>
  ) => {
    if (meta.kind === 'column') {
      return;
    }

    const taskId = String(meta.event.active.id);
    const targetCol = meta.overContainer as TaskStatus;
    const targetIndex = meta.overIndex;

    // Calculate fractional position
    const targetTasks = (newColumns[targetCol] || []).filter((t) => t.id !== taskId);
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

    try {
      await moveMutation.mutateAsync({
        id: taskId,
        dto: {
          status: targetCol,
          position,
        },
      });
    } catch (err) {
      if (
        isAxiosError(err) &&
        err.response?.status === 409 &&
        err.response?.data?.error === 'OVERCAPACITY_WARNING'
      ) {
        setPendingMove({
          id: taskId,
          dto: { status: targetCol, position },
          previousValue: meta.previousValue as BoardColumns,
        });
        setOvercapacityData(err.response.data.data);
        setIsOvercapacityOpen(true);
      } else {
        // Rollback to previous state
        setBoard(meta.previousValue as BoardColumns);
      }
    }
  };

  const handleConfirmMoveOverride = async () => {
    if (!pendingMove) return;
    try {
      await moveMutation.mutateAsync({
        id: pendingMove.id,
        dto: {
          ...pendingMove.dto,
          override: true,
        },
      });
      setIsOvercapacityOpen(false);
      setPendingMove(null);
      setOvercapacityData(null);
    } catch {
      if (pendingMove?.previousValue) {
        setBoard(pendingMove.previousValue);
      }
    }
  };

  // Grouping for Swimlanes
  const swimlanes = useMemo(() => {
    if (swimlaneMode === 'NONE') return null;

    // Flatten all tasks
    const allTasks = Object.values(board).flat();

    if (swimlaneMode === 'EPIC') {
      const groups = new Map<string, { title: string; tasks: TaskItem[] }>();

      allTasks.forEach((t) => {
        const key = t.epicId || 'no-epic';
        const title = t.epicTitle || 'Tanpa Epic (Pekerjaan Rutin / Langsung)';
        if (!groups.has(key)) {
          groups.set(key, { title, tasks: [] });
        }
        groups.get(key)!.tasks.push(t);
      });

      return Array.from(groups.entries()).map(([id, val]) => ({
        id,
        title: val.title,
        icon: Target,
        columns: {
          BACKLOG: val.tasks.filter((t) => t.status === 'BACKLOG'),
          TODO: val.tasks.filter((t) => t.status === 'TODO'),
          IN_PROGRESS: val.tasks.filter((t) => t.status === 'IN_PROGRESS'),
          REVIEW: val.tasks.filter((t) => t.status === 'REVIEW'),
          DONE: val.tasks.filter((t) => t.status === 'DONE'),
        } as BoardColumns,
      }));
    }

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
    <>
      <div className="space-y-6">
        {/* Standard Single View */}
        {swimlaneMode === 'NONE' && (
          <Kanban
            value={board}
            onValueChange={(val) => setBoard(val as BoardColumns)}
            onValueCommit={handleValueCommit}
            getItemValue={(item) => item.id}
          >
            <ReuiKanbanBoard className="flex gap-4 overflow-x-auto pb-4 pt-1 items-start sm:grid-cols-none min-h-137.5">
              {Object.keys(board).map((colId) => {
                const colDef = COLUMN_DEFS.find((c) => c.id === colId);
                if (!colDef) return null;
                return (
                  <KanbanColumn
                    key={colId}
                    id={colId as TaskStatus}
                    title={colDef.title}
                    colorDot={colDef.colorDot}
                    tasks={board[colId as TaskStatus] || []}
                    onCardClick={(task) => setSelectedTaskId(task.id)}
                    onAddTask={(status) => setCreateTaskStatus(status)}
                    isCoordinatorOrAdmin={isCoordinatorOrAdmin}
                  />
                );
              })}
            </ReuiKanbanBoard>
            <KanbanOverlay className="bg-muted/10 rounded-md border-2 border-dashed">
              {({ value, variant }) => {
                if (variant === 'column') {
                  const colDef = COLUMN_DEFS.find((c) => c.id === value);
                  if (!colDef) return null;
                  return (
                    <KanbanColumn
                      id={value as TaskStatus}
                      title={colDef.title}
                      colorDot={colDef.colorDot}
                      tasks={board[value as TaskStatus] || []}
                      isOverlay
                      className="shadow-2xl opacity-90 rotate-1 border-primary/50"
                    />
                  );
                }
                const allTasks = Object.values(board).flat();
                const task = allTasks.find((t) => t.id === value);
                if (task) {
                  return (
                    <div className="w-72">
                      <KanbanCard task={task} isOverlay />
                    </div>
                  );
                }
                return null;
              }}
            </KanbanOverlay>
          </Kanban>
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

                  <Kanban
                    value={lane.columns}
                    onValueChange={(newLaneCols) => {
                      setBoard((prev) => {
                        const updated = { ...prev };
                        const laneTaskIds = new Set(
                          Object.values(newLaneCols).flat().map((t) => t.id)
                        );
                        for (const col of Object.keys(updated) as TaskStatus[]) {
                          updated[col] = [
                            ...updated[col].filter((t) => !laneTaskIds.has(t.id)),
                            ...(newLaneCols[col] || []),
                          ];
                        }
                        return updated;
                      });
                    }}
                    onValueCommit={handleValueCommit}
                    getItemValue={(item) => item.id}
                  >
                    <ReuiKanbanBoard className="flex gap-4 overflow-x-auto pb-2 items-start sm:grid-cols-none">
                      {COLUMN_DEFS.map((col) => (
                        <KanbanColumn
                          key={`${lane.id}-${col.id}`}
                          id={col.id}
                          title={col.title}
                          colorDot={col.colorDot}
                          tasks={lane.columns[col.id] || []}
                          onCardClick={(task) => setSelectedTaskId(task.id)}
                          isCoordinatorOrAdmin={isCoordinatorOrAdmin}
                        />
                      ))}
                    </ReuiKanbanBoard>
                    <KanbanOverlay className="bg-muted/10 rounded-md border-2 border-dashed">
                      {({ value }) => {
                        const task = Object.values(lane.columns)
                          .flat()
                          .find((t) => t.id === value);
                        if (task) {
                          return (
                            <div className="w-72">
                              <KanbanCard task={task} isOverlay />
                            </div>
                          );
                        }
                        return null;
                      }}
                    </KanbanOverlay>
                  </Kanban>
                </div>
              );
            })}
          </div>
        )}
      </div>

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

      {/* Overcapacity Warning Dialog for Drag & Drop */}
      <OvercapacityDialog
        open={isOvercapacityOpen}
        onOpenChange={setIsOvercapacityOpen}
        data={overcapacityData}
        onConfirmOverride={handleConfirmMoveOverride}
        onCancel={() => {
          if (pendingMove?.previousValue) {
            setBoard(pendingMove.previousValue);
          }
          setIsOvercapacityOpen(false);
          setPendingMove(null);
          setOvercapacityData(null);
        }}
        isLoading={moveMutation.isPending}
      />
    </>
  );
}
