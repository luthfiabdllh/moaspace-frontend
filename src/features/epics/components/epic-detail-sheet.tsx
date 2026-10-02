'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Target,
  Bookmark,
  Calendar,
  Layers,
  Network,
  Plus,
  ChevronDown,
  ChevronRight,
  User,
  AlertTriangle,
  Columns,
  Sparkles,
  GitPullRequest,
  ExternalLink,
} from 'lucide-react';
import type { EpicItem } from '../types';
import { useStories } from '@/features/stories/api/use-queries';
import { useTasks } from '@/features/tasks/api/use-queries';
import { useCurrentUser } from '@/features/auth/api/use-queries';
import { CreateStoryDialog } from '@/features/stories/components/create-story-dialog';
import { CreateTaskDialog } from '@/features/tasks/components/create-task-dialog';
import { TaskDetailSheet } from '@/features/tasks/components/task-detail-sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface EpicDetailSheetProps {
  epic: EpicItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EpicDetailSheet({
  epic,
  open,
  onOpenChange,
}: EpicDetailSheetProps) {
  const { data: user } = useCurrentUser();

  const { data: stories = [], isLoading: isStoriesLoading } = useStories(
    epic?.id ? { epicId: epic.id } : undefined
  );

  const { data: allTasks = [] } = useTasks(
    epic?.ownerDivisionId ? { divisionId: epic.ownerDivisionId } : undefined
  );

  const [createStoryOpen, setCreateStoryOpen] = useState(false);
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [selectedStory, setSelectedStory] = useState<{ id: string; title: string; divisionId: string } | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [expandedStories, setExpandedStories] = useState<Record<string, boolean>>({});

  const toggleStory = (storyId: string) => {
    setExpandedStories((prev) => ({
      ...prev,
      [storyId]: prev[storyId] === undefined ? false : !prev[storyId],
    }));
  };

  if (!epic) return null;

  const isGlobalAdmin = Boolean(user?.isSuperAdmin || user?.isKormanit);
  const isCoordinator = Boolean(
    isGlobalAdmin ||
      user?.divisions.some(
        (d) => d.divisionId === epic.ownerDivisionId && d.role === 'COORDINATOR'
      )
  );

  const dateRange =
    epic.startDate || epic.endDate
      ? `${epic.startDate ? new Date(epic.startDate).toLocaleDateString('id-ID', { dateStyle: 'medium' }) : ''} - ${
          epic.endDate ? new Date(epic.endDate).toLocaleDateString('id-ID', { dateStyle: 'medium' }) : 'Seterusnya'
        }`
      : null;

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto p-6 space-y-6">
          <SheetHeader className="space-y-3 text-left border-b pb-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-3xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary flex items-center gap-1">
                  <Target className="size-3" />
                  Inisiatif & Epic
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
              </div>

              <Badge
                variant={epic.isClosed ? 'secondary' : 'default'}
                className="text-3xs py-0"
              >
                {epic.isClosed ? 'Ditutup' : 'Aktif'}
              </Badge>
            </div>

            <SheetTitle className="text-xl font-bold tracking-tight text-foreground">
              {epic.title}
            </SheetTitle>

            {epic.description && (
              <p className="text-xs text-muted-foreground leading-relaxed">
                {epic.description}
              </p>
            )}

            {/* Meta Info */}
            <div className="flex flex-wrap gap-4 text-2xs text-muted-foreground pt-1">
              {dateRange && (
                <div className="flex items-center gap-1">
                  <Calendar className="size-3 text-primary" />
                  <span>Periode: {dateRange}</span>
                </div>
              )}
              {epic.participatingDivisions.length > 0 && (
                <div className="flex items-center gap-1 flex-wrap">
                  <Layers className="size-3 text-indigo-500" />
                  <span>Divisi terlibat:</span>
                  {epic.participatingDivisions.map((p) => (
                    <span key={p.id} className="font-semibold text-foreground">
                      {p.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </SheetHeader>

          {/* Origin Request Banner */}
          {epic.sourceRequestId && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs text-amber-900 dark:text-amber-200">
              <div className="flex items-center gap-2 min-w-0">
                <GitPullRequest className="size-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span className="truncate">
                  Berasal dari permohonan: <strong>{epic.requestTitle || 'Permohonan Kolaborasi'}</strong>
                </span>
              </div>
              <Link
                href={`/requests/${epic.sourceRequestId}`}
                className="inline-flex items-center gap-1 font-semibold text-primary hover:underline shrink-0 ml-2"
              >
                Lihat Brief
                <ExternalLink className="size-3" />
              </Link>
            </div>
          )}

          {/* Progress Card */}
          <div className="p-4 rounded-xl border bg-muted/20 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground">
                Progres Keseluruhan Inisiatif
              </span>
              <span className="font-bold text-primary">
                {epic.progressPercentage}%
              </span>
            </div>

            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${epic.progressPercentage}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-2xs text-muted-foreground pt-1">
              <span>{epic.doneTasks} dari {epic.totalTasks} task selesai</span>
              <span>{stories.length} Deliverable Stories</span>
            </div>
          </div>

          {/* Stories & Tasks Breakdown Tree */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <Bookmark className="size-4 text-primary" />
                Pecahan Deliverable Stories ({stories.length})
              </h3>

              {isCoordinator && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCreateStoryOpen(true)}
                  className="h-7 text-2xs gap-1 shadow-2xs"
                >
                  <Plus className="size-3" />
                  Tambah Story
                </Button>
              )}
            </div>

            {isStoriesLoading ? (
              <div className="space-y-2">
                {[1, 2].map((i) => (
                  <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
                ))}
              </div>
            ) : stories.length === 0 ? (
              <div className="p-6 text-center rounded-xl border border-dashed text-2xs text-muted-foreground space-y-2">
                <p>Belum ada deliverable story di bawah inisiatif ini.</p>
                {isCoordinator && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCreateStoryOpen(true)}
                    className="gap-1 text-2xs"
                  >
                    <Plus className="size-3" />
                    Buat Story Pertama
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {stories.map((story) => {
                  const storyTasks = allTasks.filter((t) => t.storyId === story.id);
                  const isStoryExpanded = expandedStories[story.id] !== false; // Default expanded

                  return (
                    <div
                      key={story.id}
                      className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-2xs"
                    >
                      {/* Story Header */}
                      <div
                        onClick={() => toggleStory(story.id)}
                        className="p-3.5 bg-muted/15 hover:bg-muted/30 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                      >
                        <div className="flex items-start gap-2.5 min-w-0">
                          <button
                            type="button"
                            className="mt-0.5 text-muted-foreground hover:text-foreground shrink-0"
                          >
                            {isStoryExpanded ? (
                              <ChevronDown className="size-4" />
                            ) : (
                              <ChevronRight className="size-4" />
                            )}
                          </button>

                          <div className="space-y-0.5 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <Badge
                                variant={story.isClosed ? 'secondary' : 'default'}
                                className="text-3xs py-0"
                              >
                                {story.isClosed ? 'Selesai' : 'Aktif'}
                              </Badge>
                              {story.divisionName && (
                                <Badge variant="outline" className="text-3xs py-0">
                                  {story.divisionName}
                                </Badge>
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
                                setSelectedStory({
                                  id: story.id,
                                  title: story.title,
                                  divisionId: story.divisionId,
                                });
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

                      {/* Tasks inside Story */}
                      {isStoryExpanded && (
                        <div className="p-3 border-t border-border/50 bg-background/50 space-y-1.5">
                          {storyTasks.length === 0 ? (
                            <div className="py-2.5 px-3 text-center text-3xs text-muted-foreground border border-dashed rounded">
                              Belum ada task. Koordinator memecah Story ini menjadi unit kerja anggota tim.
                            </div>
                          ) : (
                            storyTasks.map((task) => (
                              <div
                                key={task.id}
                                onClick={() => setSelectedTaskId(task.id)}
                                className="flex items-center justify-between gap-3 p-2 rounded-lg border border-border/60 bg-card hover:bg-muted/40 transition-colors cursor-pointer group"
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
            )}
          </div>

          {/* Footer Action: Jump to Board */}
          <div className="pt-2 border-t flex justify-end">
            <Link
              href="/board"
              onClick={() => onOpenChange(false)}
              className="inline-flex items-center gap-1.5 text-xs text-primary font-medium hover:underline"
            >
              <Columns className="size-3.5" />
              Buka Papan Kanban Divisi
            </Link>
          </div>
        </SheetContent>
      </Sheet>

      {/* Dialogs */}
      <CreateStoryDialog
        open={createStoryOpen}
        onOpenChange={setCreateStoryOpen}
        defaultEpicId={epic.id}
        defaultDivisionId={epic.ownerDivisionId || undefined}
      />

      {selectedStory && (
        <CreateTaskDialog
          open={createTaskOpen}
          onOpenChange={(open) => {
            setCreateTaskOpen(open);
            if (!open) setSelectedStory(null);
          }}
          storyId={selectedStory.id}
          storyTitle={selectedStory.title}
          divisionId={selectedStory.divisionId}
        />
      )}

      <TaskDetailSheet
        taskId={selectedTaskId}
        open={Boolean(selectedTaskId)}
        onOpenChange={(open) => !open && setSelectedTaskId(null)}
        isCoordinatorOrAdmin={isCoordinator}
      />
    </>
  );
}
