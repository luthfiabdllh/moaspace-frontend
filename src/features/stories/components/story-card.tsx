'use client';

import { useState } from 'react';
import {
  Bookmark,
  Calendar,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Target,
  CheckSquare,
  AlertTriangle,
  User,
  Flag,
  FileEdit,
} from 'lucide-react';
import type { StoryItem } from '../types';
import { useTasks } from '@/features/tasks/api/use-queries';
import { useUpdateStory, useDeleteStory } from '../api/use-mutations';
import { EditStoryDialog } from './edit-story-dialog';
import { CreateTaskDialog } from '@/features/tasks/components/create-task-dialog';
import { TaskDetailSheet } from '@/features/tasks/components/task-detail-sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

interface StoryCardProps {
  story: StoryItem;
  isCoordinatorOrAdmin?: boolean;
}

export function StoryCard({ story, isCoordinatorOrAdmin = false }: StoryCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [editStoryOpen, setEditStoryOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const { data: tasks = [], isLoading: isTasksLoading } = useTasks({ storyId: story.id });
  const updateMutation = useUpdateStory();
  const deleteMutation = useDeleteStory();

  const handleToggleClosed = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await updateMutation.mutateAsync({
      id: story.id,
      dto: { isClosed: !story.isClosed },
    });
  };

  const handleDeleteStory = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteStory = async () => {
    await deleteMutation.mutateAsync(story.id);
  };

  return (
    <Card className="border-border/80 shadow-2xs overflow-hidden transition-all duration-200">
      <CardContent className="p-0">
        {/* Story Header */}
        <div className="p-4 sm:p-5 bg-card space-y-3.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              {story.epicTitle ? (
                <Badge className="bg-indigo-600/90 text-white hover:bg-indigo-600 gap-1 text-2xs">
                  <Target className="size-3" />
                  {story.epicTitle}
                </Badge>
              ) : (
                <Badge variant="outline" className="text-2xs text-muted-foreground gap-1">
                  Pekerjaan Rutin
                </Badge>
              )}

              {story.prokerTag && (
                <Badge variant="secondary" className="font-mono text-2xs">
                  #{story.prokerTag}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {story.isClosed ? (
                <Badge variant="secondary" className="gap-1 text-2xs text-muted-foreground">
                  <CheckCircle2 className="size-3 text-emerald-500" />
                  Selesai
                </Badge>
              ) : (
                <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-500/20 text-2xs gap-1">
                  <Clock className="size-3" />
                  Aktif
                </Badge>
              )}

              {isCoordinatorOrAdmin && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditStoryOpen(true);
                    }}
                    className="size-7 text-muted-foreground hover:text-foreground"
                    title="Edit Story"
                  >
                    <FileEdit className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleDeleteStory}
                    disabled={deleteMutation.isPending}
                    className="size-7 text-muted-foreground hover:text-destructive"
                    title="Hapus Story"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Title & Info */}
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-semibold text-base text-foreground leading-snug">
                {story.title}
              </h3>
              {story.doneCriteria && (
                <p className="text-2xs text-muted-foreground flex items-center gap-1.5">
                  <CheckSquare className="size-3 text-primary shrink-0" />
                  <span className="line-clamp-1">DoD: {story.doneCriteria}</span>
                </p>
              )}
            </div>

            {story.targetDate && (
              <div className="flex items-center gap-1 text-2xs text-muted-foreground shrink-0 pt-0.5">
                <Calendar className="size-3" />
                <span>
                  Target: {new Date(story.targetDate).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                </span>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-2xs text-muted-foreground font-medium">
                {story.doneTasks} dari {story.totalTasks} task selesai ({story.progressPercentage}%)
              </span>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-2xs text-primary font-medium hover:underline flex items-center gap-1"
              >
                {isExpanded ? (
                  <>
                    Sembunyikan Task <ChevronUp className="size-3" />
                  </>
                ) : (
                  <>
                    Lihat {tasks.length} Task <ChevronDown className="size-3" />
                  </>
                )}
              </button>
            </div>

            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  story.progressPercentage === 100
                    ? 'bg-emerald-500'
                    : story.progressPercentage > 50
                      ? 'bg-primary'
                      : 'bg-indigo-500'
                }`}
                style={{ width: `${story.progressPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Child Tasks List */}
        {isExpanded && (
          <div className="border-t border-border/60 bg-muted/20 p-4 space-y-2">
            <div className="flex items-center justify-between pb-1">
              <span className="text-xs font-semibold text-muted-foreground">
                Daftar Task ({tasks.length})
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCreateTaskOpen(true)}
                className="h-7 text-2xs gap-1 shadow-2xs"
              >
                <Plus className="size-3" />
                Tambah Task
              </Button>
            </div>

            {isTasksLoading ? (
              <div className="space-y-2 pt-1">
                {[1, 2].map((i) => (
                  <div key={i} className="h-12 rounded-lg bg-card animate-pulse border" />
                ))}
              </div>
            ) : tasks.length === 0 ? (
              <div className="text-center py-4 rounded-lg border border-dashed border-border/80 bg-background/50 text-2xs text-muted-foreground space-y-1">
                <p>Belum ada task di dalam story ini.</p>
                <p className="text-3xs text-muted-foreground/80">
                  Pecah story menjadi unit kerja yang dapat dikerjakan oleh anggota tim.
                </p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => setSelectedTaskId(task.id)}
                    className="flex items-center justify-between gap-3 p-2.5 rounded-lg border border-border/70 bg-card hover:bg-muted/40 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`size-2 rounded-full shrink-0 ${
                          task.status === 'DONE'
                            ? 'bg-emerald-500'
                            : task.status === 'IN_PROGRESS'
                              ? 'bg-amber-500'
                              : task.status === 'REVIEW'
                                ? 'bg-purple-500'
                                : 'bg-muted-foreground/40'
                        }`}
                      />
                      <span className="text-xs font-medium text-foreground truncate group-hover:text-primary transition-colors">
                        {task.title}
                      </span>
                      {task.isBlocked && (
                        <Badge
                          variant="destructive"
                          className="text-3xs px-1.5 py-0 gap-0.5 shrink-0"
                        >
                          <AlertTriangle className="size-2.5" />
                          Blocked
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0 text-2xs">
                      {task.dueDate && (
                        <span
                          className={`flex items-center gap-1 font-medium ${
                            task.status !== 'DONE' && new Date(task.dueDate) < new Date()
                              ? 'text-destructive'
                              : 'text-muted-foreground'
                          }`}
                        >
                          <Calendar className="size-3" />
                          {new Date(task.dueDate).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </span>
                      )}

                      {task.assigneeName ? (
                        <span className="text-muted-foreground flex items-center gap-1 font-medium truncate max-w-28">
                          <User className="size-3 text-muted-foreground" />
                          {task.assigneeName}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/60 italic">Unassigned</span>
                      )}

                      <Badge variant="outline" className="text-3xs px-1.5 py-0 text-muted-foreground">
                        {task.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>

      {/* Create Task Dialog */}
      <CreateTaskDialog
        open={createTaskOpen}
        onOpenChange={setCreateTaskOpen}
        storyId={story.id}
        storyTitle={story.title}
        divisionId={story.divisionId}
      />

      {/* Task Detail Sheet */}
      <TaskDetailSheet
        taskId={selectedTaskId}
        open={Boolean(selectedTaskId)}
        onOpenChange={(open) => !open && setSelectedTaskId(null)}
        isCoordinatorOrAdmin={isCoordinatorOrAdmin}
      />

      {/* Edit Story Dialog */}
      {isCoordinatorOrAdmin && (
        <EditStoryDialog
          story={story}
          open={editStoryOpen}
          onOpenChange={setEditStoryOpen}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Hapus Story Ini?"
        description={`Story "${story.title}" beserta seluruh task di dalamnya akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.`}
        variant="destructive"
        onConfirm={confirmDeleteStory}
      />
    </Card>
  );
}
