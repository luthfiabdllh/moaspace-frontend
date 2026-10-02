'use client';

import { useState, useMemo } from 'react';
import {
  Target,
  Bookmark,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  Plus,
  AlertTriangle,
  User,
  Calendar,
  Layers,
  Sparkles,
  ExternalLink,
  GitPullRequest,
} from 'lucide-react';
import Link from 'next/link';
import { useEpics } from '../api/use-queries';
import { useStories } from '@/features/stories/api/use-queries';
import { useTasks } from '@/features/tasks/api/use-queries';
import { useCurrentUser } from '@/features/auth/api/use-queries';
import { CreateEpicDialog } from './create-epic-dialog';
import { CreateStoryDialog } from '@/features/stories/components/create-story-dialog';
import { CreateTaskDialog } from '@/features/tasks/components/create-task-dialog';
import { TaskDetailSheet } from '@/features/tasks/components/task-detail-sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { TaskItem } from '@/features/tasks/types';

interface HierarchyBreakdownViewProps {
  divisionId?: string;
  divisionSlug?: string;
}

export function HierarchyBreakdownView({
  divisionId,
  divisionSlug,
}: HierarchyBreakdownViewProps) {
  const { data: user } = useCurrentUser();

  // Queries
  const { data: epics = [], isLoading: isEpicsLoading } = useEpics(
    divisionId ? { divisionId } : undefined
  );
  const { data: stories = [], isLoading: isStoriesLoading } = useStories(
    divisionId ? { divisionId } : undefined
  );
  const { data: tasks = [], isLoading: isTasksLoading } = useTasks(
    divisionId ? { divisionId } : undefined
  );

  // Permissions
  const isGlobalAdmin = Boolean(user?.isSuperAdmin || user?.isKormanit);
  const isCoordinator = Boolean(
    isGlobalAdmin ||
      (divisionId &&
        user?.divisions.some(
          (d) => d.divisionId === divisionId && d.role === 'COORDINATOR'
        ))
  );

  // Dialog & Sheet state
  const [createEpicOpen, setCreateEpicOpen] = useState(false);
  const [createStoryOpen, setCreateStoryOpen] = useState(false);
  const [createStoryEpicId, setCreateStoryEpicId] = useState<string | undefined>();
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [createTaskStory, setCreateTaskStory] = useState<{ id: string; title: string } | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // Expanded nodes state
  const [expandedEpics, setExpandedEpics] = useState<Record<string, boolean>>({});
  const [expandedStories, setExpandedStories] = useState<Record<string, boolean>>({});

  const toggleEpic = (epicId: string) => {
    setExpandedEpics((prev) => ({
      ...prev,
      [epicId]: prev[epicId] === undefined ? false : !prev[epicId],
    }));
  };

  const toggleStory = (storyId: string) => {
    setExpandedStories((prev) => ({
      ...prev,
      [storyId]: prev[storyId] === undefined ? false : !prev[storyId],
    }));
  };

  // Group stories by Epic
  const { storiesByEpic, routineStories } = useMemo(() => {
    const map = new Map<string, typeof stories>();
    const routine: typeof stories = [];

    stories.forEach((s) => {
      if (s.epicId) {
        if (!map.has(s.epicId)) {
          map.set(s.epicId, []);
        }
        map.get(s.epicId)!.push(s);
      } else {
        routine.push(s);
      }
    });

    return { storiesByEpic: map, routineStories: routine };
  }, [stories]);

  // Group tasks by Story
  const tasksByStory = useMemo(() => {
    const map = new Map<string, TaskItem[]>();
    tasks.forEach((t) => {
      if (!map.has(t.storyId)) {
        map.set(t.storyId, []);
      }
      map.get(t.storyId)!.push(t);
    });
    return map;
  }, [tasks]);

  const isLoading = isEpicsLoading || isStoriesLoading || isTasksLoading;

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-20 bg-muted rounded-xl" />
        <div className="h-32 bg-muted rounded-xl" />
        <div className="h-32 bg-muted rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-card p-4 rounded-xl border border-border/80 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            Pohon Hierarki Kerja: Epic &rarr; Story &rarr; Task
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Pekerjaan dipecah dari inisiatif besar sampai unit kerja satu orang, progres naik otomatis dari bawah ke atas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isCoordinator && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCreateEpicOpen(true)}
                className="gap-1.5 text-xs shadow-2xs"
              >
                <Plus className="size-3.5" />
                Epic Baru
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setCreateStoryEpicId(undefined);
                  setCreateStoryOpen(true);
                }}
                className="gap-1.5 text-xs shadow-2xs"
              >
                <Plus className="size-3.5" />
                Story Baru
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Epics Tree */}
      <div className="space-y-4">
        {epics.length === 0 && routineStories.length === 0 ? (
          <div className="text-center p-12 rounded-xl border border-dashed bg-card/50 text-muted-foreground space-y-3">
            <Layers className="size-8 text-muted-foreground/60 mx-auto" />
            <p className="text-sm font-medium">Belum Ada Inisiatif atau Story</p>
            <p className="text-xs text-muted-foreground/80 max-w-sm mx-auto">
              Mulai rencanakan program kerja dengan membuat Epic inisiatif besar atau Story pekerjaan rutin divisi.
            </p>
          </div>
        ) : (
          <>
            {/* 1. Epic Nodes */}
            {epics.map((epic) => {
              const epicStories = storiesByEpic.get(epic.id) || [];
              const isEpicExpanded = expandedEpics[epic.id] !== false; // Default expanded

              return (
                <Card
                  key={epic.id}
                  className="border-border/80 shadow-2xs overflow-hidden transition-all duration-200"
                >
                  {/* Epic Level 1 Header */}
                  <div
                    onClick={() => toggleEpic(epic.id)}
                    className="p-4 bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer border-b border-border/50"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <button
                          type="button"
                          className="mt-0.5 text-muted-foreground hover:text-foreground shrink-0"
                        >
                          {isEpicExpanded ? (
                            <ChevronDown className="size-4" />
                          ) : (
                            <ChevronRight className="size-4" />
                          )}
                        </button>

                        <div className="space-y-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-3xs font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary">
                              Level 1: Epic
                            </span>
                            {epic.scope === 'CROSS' ? (
                              <Badge className="bg-indigo-600 text-white text-3xs py-0">
                                Lintas Divisi
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-3xs py-0">
                                {epic.ownerDivisionName || 'Divisi'}
                              </Badge>
                            )}
                            {epic.prokerTag && (
                              <Badge variant="secondary" className="text-3xs font-mono py-0">
                                #{epic.prokerTag}
                              </Badge>
                            )}
                            <Badge
                              variant={epic.isClosed ? 'secondary' : 'default'}
                              className="text-3xs py-0"
                            >
                              {epic.isClosed ? 'Ditutup' : 'Aktif'}
                            </Badge>
                          </div>

                          <h3 className="font-bold text-sm sm:text-base text-foreground truncate">
                            {epic.title}
                          </h3>
                        </div>
                      </div>

                      {/* Epic Progress & Actions */}
                      <div className="flex items-center gap-4 shrink-0 pl-7 md:pl-0">
                        <div className="text-right">
                          <p className="text-xs font-semibold text-foreground">
                            {epic.progressPercentage}% Selesai
                          </p>
                          <p className="text-3xs text-muted-foreground">
                            {epic.doneTasks} dari {epic.totalTasks} task ({epicStories.length} stories)
                          </p>
                        </div>

                        {isCoordinator && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCreateStoryEpicId(epic.id);
                              setCreateStoryOpen(true);
                            }}
                            className="h-7 text-2xs gap-1 shadow-2xs"
                          >
                            <Plus className="size-3" />
                            Tambah Story
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Stories Level 2 (Inside Epic) */}
                  {isEpicExpanded && (
                    <div className="p-3 sm:p-4 space-y-3 bg-background/50">
                      {epicStories.length === 0 ? (
                        <div className="p-4 text-center rounded-lg border border-dashed text-2xs text-muted-foreground">
                          Belum ada story di dalam Epic ini.{' '}
                          {isCoordinator && (
                            <button
                              onClick={() => {
                                setCreateStoryEpicId(epic.id);
                                setCreateStoryOpen(true);
                              }}
                              className="text-primary hover:underline font-semibold"
                            >
                              Buat story pertama
                            </button>
                          )}
                        </div>
                      ) : (
                        epicStories.map((story) => {
                          const storyTasks = tasksByStory.get(story.id) || [];
                          const isStoryExpanded = expandedStories[story.id] !== false; // Default expanded

                          return (
                            <div
                              key={story.id}
                              className="rounded-lg border border-border/70 bg-card overflow-hidden"
                            >
                              {/* Story Level 2 Header */}
                              <div
                                onClick={() => toggleStory(story.id)}
                                className="p-3 bg-muted/10 hover:bg-muted/30 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                              >
                                <div className="flex items-start gap-2 min-w-0">
                                  <button
                                    type="button"
                                    className="mt-0.5 text-muted-foreground hover:text-foreground shrink-0"
                                  >
                                    {isStoryExpanded ? (
                                      <ChevronDown className="size-3.5" />
                                    ) : (
                                      <ChevronRight className="size-3.5" />
                                    )}
                                  </button>

                                  <div className="space-y-0.5 min-w-0">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="text-3xs font-semibold px-1.5 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300">
                                        Level 2: Story
                                      </span>
                                      <Badge
                                        variant={story.isClosed ? 'secondary' : 'outline'}
                                        className="text-3xs py-0"
                                      >
                                        {story.isClosed ? 'Selesai' : 'Aktif'}
                                      </Badge>
                                      {story.sourceRequestId && (
                                        <Link
                                          href={`/requests/${story.sourceRequestId}`}
                                          onClick={(e) => e.stopPropagation()}
                                          className="inline-flex items-center gap-1 text-3xs font-semibold px-1.5 py-0.2 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-300/60 dark:border-amber-700/60 hover:bg-amber-100 transition-colors"
                                          title="Berasal dari Permohonan Lintas Divisi"
                                        >
                                          <GitPullRequest className="size-2.5 shrink-0 text-amber-600 dark:text-amber-400" />
                                          Req Antar-Divisi
                                        </Link>
                                      )}
                                      {story.targetDate && (
                                        <span className="text-3xs text-muted-foreground flex items-center gap-1">
                                          <Calendar className="size-2.5" />
                                          {new Date(story.targetDate).toLocaleDateString('id-ID', {
                                            dateStyle: 'medium',
                                          })}
                                        </span>
                                      )}
                                    </div>
                                    <h4 className="font-semibold text-xs sm:text-sm text-foreground truncate">
                                      {story.title}
                                    </h4>
                                    {story.doneCriteria && (
                                      <p className="text-3xs text-muted-foreground line-clamp-1">
                                        DoD: {story.doneCriteria}
                                      </p>
                                    )}
                                  </div>
                                </div>

                                {/* Story Actions & Progress */}
                                <div className="flex items-center gap-3 shrink-0 pl-6 sm:pl-0">
                                  <span className="text-2xs text-muted-foreground font-medium">
                                    {story.doneTasks}/{story.totalTasks} task ({story.progressPercentage}%)
                                  </span>

                                  {isCoordinator && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setCreateTaskStory({ id: story.id, title: story.title });
                                        setCreateTaskOpen(true);
                                      }}
                                      className="h-6 text-3xs gap-1 border px-2 shadow-2xs"
                                    >
                                      <Plus className="size-2.5" />
                                      Pecah Task
                                    </Button>
                                  )}
                                </div>
                              </div>

                              {/* Tasks Level 3 (Inside Story) */}
                              {isStoryExpanded && (
                                <div className="p-2 sm:p-3 border-t border-border/40 bg-muted/5 space-y-1.5">
                                  {storyTasks.length === 0 ? (
                                    <div className="py-2 px-3 text-center text-3xs text-muted-foreground border border-dashed rounded">
                                      Belum ada task. Koordinator memecah Story ini menjadi task satu orang.
                                    </div>
                                  ) : (
                                    storyTasks.map((task) => (
                                      <div
                                        key={task.id}
                                        onClick={() => setSelectedTaskId(task.id)}
                                        className="flex items-center justify-between gap-3 p-2 rounded-md border border-border/60 bg-card hover:bg-muted/40 transition-colors cursor-pointer group"
                                      >
                                        <div className="flex items-center gap-2 min-w-0">
                                          <div
                                            className={`size-2 rounded-full shrink-0 ${
                                              task.status === 'DONE'
                                                ? 'bg-emerald-500'
                                                : task.status === 'IN_PROGRESS'
                                                  ? 'bg-amber-500'
                                                  : task.status === 'REVIEW'
                                                    ? 'bg-purple-500'
                                                    : 'bg-zinc-400'
                                            }`}
                                          />
                                          <span className="text-xs font-medium text-foreground truncate group-hover:text-primary transition-colors">
                                            {task.title}
                                          </span>
                                          {task.isBlocked && (
                                            <Badge
                                              variant="destructive"
                                              className="text-3xs px-1 py-0 gap-0.5 shrink-0"
                                            >
                                              <AlertTriangle className="size-2.5" />
                                              Blocked
                                            </Badge>
                                          )}
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0 text-2xs">
                                          {task.assigneeName ? (
                                            <span className="text-muted-foreground flex items-center gap-1 font-medium truncate max-w-28">
                                              <User className="size-3 text-muted-foreground" />
                                              {task.assigneeName}
                                            </span>
                                          ) : (
                                            <span className="text-muted-foreground/60 italic">Unassigned</span>
                                          )}

                                          <Badge
                                            variant="outline"
                                            className="text-3xs px-1.5 py-0 font-mono text-muted-foreground"
                                          >
                                            {task.status}
                                          </Badge>
                                        </div>
                                      </div>
                                    ))
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </Card>
              );
            })}

            {/* 2. Routine Stories (Tanpa Epic) */}
            {routineStories.length > 0 && (
              <Card className="border-border/80 shadow-2xs overflow-hidden">
                <div className="p-4 bg-muted/20 border-b border-border/50">
                  <div className="flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-3xs font-semibold px-2 py-0.5 rounded bg-muted text-muted-foreground">
                          Pekerjaan Rutin
                        </span>
                        <Badge variant="outline" className="text-3xs py-0">
                          Tanpa Epic
                        </Badge>
                      </div>
                      <h3 className="font-bold text-sm sm:text-base text-foreground">
                        Pekerjaan Rutin Divisi
                      </h3>
                    </div>
                  </div>
                </div>

                <div className="p-3 sm:p-4 space-y-3 bg-background/50">
                  {routineStories.map((story) => {
                    const storyTasks = tasksByStory.get(story.id) || [];
                    const isStoryExpanded = expandedStories[story.id] !== false;

                    return (
                      <div
                        key={story.id}
                        className="rounded-lg border border-border/70 bg-card overflow-hidden"
                      >
                        <div
                          onClick={() => toggleStory(story.id)}
                          className="p-3 bg-muted/10 hover:bg-muted/30 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                        >
                          <div className="flex items-start gap-2 min-w-0">
                            <button
                              type="button"
                              className="mt-0.5 text-muted-foreground hover:text-foreground shrink-0"
                            >
                              {isStoryExpanded ? (
                                <ChevronDown className="size-3.5" />
                              ) : (
                                <ChevronRight className="size-3.5" />
                              )}
                            </button>

                            <div className="space-y-0.5 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {story.sourceRequestId && (
                                  <Link
                                    href={`/requests/${story.sourceRequestId}`}
                                    onClick={(e) => e.stopPropagation()}
                                    className="inline-flex items-center gap-1 text-3xs font-semibold px-1.5 py-0.2 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-300/60 dark:border-amber-700/60 hover:bg-amber-100 transition-colors"
                                    title="Berasal dari Permohonan Lintas Divisi"
                                  >
                                    <GitPullRequest className="size-2.5 shrink-0 text-amber-600 dark:text-amber-400" />
                                    Req Antar-Divisi
                                  </Link>
                                )}
                              </div>
                              <h4 className="font-semibold text-xs sm:text-sm text-foreground truncate">
                                {story.title}
                              </h4>
                              {story.doneCriteria && (
                                <p className="text-3xs text-muted-foreground line-clamp-1">
                                  DoD: {story.doneCriteria}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0 pl-6 sm:pl-0">
                            <span className="text-2xs text-muted-foreground font-medium">
                              {story.doneTasks}/{story.totalTasks} task ({story.progressPercentage}%)
                            </span>

                            {isCoordinator && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCreateTaskStory({ id: story.id, title: story.title });
                                  setCreateTaskOpen(true);
                                }}
                                className="h-6 text-3xs gap-1 border px-2 shadow-2xs"
                              >
                                <Plus className="size-2.5" />
                                Pecah Task
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Routine Tasks */}
                        {isStoryExpanded && (
                          <div className="p-2 sm:p-3 border-t border-border/40 bg-muted/5 space-y-1.5">
                            {storyTasks.length === 0 ? (
                              <div className="py-2 px-3 text-center text-3xs text-muted-foreground border border-dashed rounded">
                                Belum ada task. Koordinator memecah Story ini menjadi task satu orang.
                              </div>
                            ) : (
                              storyTasks.map((task) => (
                                <div
                                  key={task.id}
                                  onClick={() => setSelectedTaskId(task.id)}
                                  className="flex items-center justify-between gap-3 p-2 rounded-md border border-border/60 bg-card hover:bg-muted/40 transition-colors cursor-pointer group"
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <div
                                      className={`size-2 rounded-full shrink-0 ${
                                        task.status === 'DONE'
                                          ? 'bg-emerald-500'
                                          : task.status === 'IN_PROGRESS'
                                            ? 'bg-amber-500'
                                            : task.status === 'REVIEW'
                                              ? 'bg-purple-500'
                                              : 'bg-zinc-400'
                                      }`}
                                    />
                                    <span className="text-xs font-medium text-foreground truncate group-hover:text-primary transition-colors">
                                      {task.title}
                                    </span>
                                    {task.isBlocked && (
                                      <Badge
                                        variant="destructive"
                                        className="text-3xs px-1 py-0 gap-0.5 shrink-0"
                                      >
                                        <AlertTriangle className="size-2.5" />
                                        Blocked
                                      </Badge>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-2 shrink-0 text-2xs">
                                    {task.assigneeName ? (
                                      <span className="text-muted-foreground flex items-center gap-1 font-medium truncate max-w-28">
                                        <User className="size-3 text-muted-foreground" />
                                        {task.assigneeName}
                                      </span>
                                    ) : (
                                      <span className="text-muted-foreground/60 italic">Unassigned</span>
                                    )}

                                    <Badge
                                      variant="outline"
                                      className="text-3xs px-1.5 py-0 font-mono text-muted-foreground"
                                    >
                                      {task.status}
                                    </Badge>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}
          </>
        )}
      </div>

      {/* Dialogs */}
      <CreateEpicDialog
        open={createEpicOpen}
        onOpenChange={setCreateEpicOpen}
        defaultDivisionId={divisionId}
      />

      <CreateStoryDialog
        open={createStoryOpen}
        onOpenChange={setCreateStoryOpen}
        defaultDivisionId={divisionId}
        defaultEpicId={createStoryEpicId}
      />

      {createTaskStory && (
        <CreateTaskDialog
          open={createTaskOpen}
          onOpenChange={(open) => {
            setCreateTaskOpen(open);
            if (!open) setCreateTaskStory(null);
          }}
          storyId={createTaskStory.id}
          storyTitle={createTaskStory.title}
          divisionId={divisionId}
        />
      )}

      <TaskDetailSheet
        taskId={selectedTaskId}
        open={Boolean(selectedTaskId)}
        onOpenChange={(open) => !open && setSelectedTaskId(null)}
        isCoordinatorOrAdmin={isCoordinator}
      />
    </div>
  );
}
