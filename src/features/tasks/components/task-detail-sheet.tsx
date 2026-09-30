'use client';

import { useState } from 'react';
import {
  CheckSquare,
  Clock,
  Calendar,
  User,
  AlertTriangle,
  Flag,
  History,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldAlert,
} from 'lucide-react';
import { useTask } from '../api/use-queries';
import { useUpdateTask, useDeleteTask } from '../api/use-mutations';
import { useCurrentUser } from '@/features/auth/api/use-queries';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { TaskStatus, TaskPriority } from '../types';

interface TaskDetailSheetProps {
  taskId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isCoordinatorOrAdmin?: boolean;
}

const statusColors: Record<TaskStatus, { bg: string; text: string; label: string }> = {
  BACKLOG: { bg: 'bg-zinc-100 dark:bg-zinc-800', text: 'text-zinc-700 dark:text-zinc-300', label: 'Backlog' },
  TODO: { bg: 'bg-blue-50 dark:bg-blue-950/40', text: 'text-blue-700 dark:text-blue-300', label: 'To Do' },
  IN_PROGRESS: { bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-700 dark:text-amber-300', label: 'In Progress' },
  REVIEW: { bg: 'bg-purple-50 dark:bg-purple-950/40', text: 'text-purple-700 dark:text-purple-300', label: 'Review' },
  DONE: { bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-300', label: 'Done' },
};

const priorityColors: Record<TaskPriority, { bg: string; text: string; label: string }> = {
  LOW: { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-400', label: 'Low' },
  MEDIUM: { bg: 'bg-sky-50 dark:bg-sky-950/40', text: 'text-sky-700 dark:text-sky-300', label: 'Medium' },
  HIGH: { bg: 'bg-orange-50 dark:bg-orange-950/40', text: 'text-orange-700 dark:text-orange-300', label: 'High' },
  URGENT: { bg: 'bg-rose-50 dark:bg-rose-950/40', text: 'text-rose-700 dark:text-rose-300', label: 'Urgent' },
};

export function TaskDetailSheet({
  taskId,
  open,
  onOpenChange,
  isCoordinatorOrAdmin = false,
}: TaskDetailSheetProps) {
  const { data: user } = useCurrentUser();
  const { data: task, isLoading, error } = useTask(taskId || '', Boolean(taskId && open));
  const updateMutation = useUpdateTask();
  const deleteMutation = useDeleteTask();

  const [isEditingBlocker, setIsEditingBlocker] = useState(false);
  const [blockerReasonInput, setBlockerReasonInput] = useState('');

  if (!open || !taskId) return null;

  const handleStatusChange = async (newStatus: TaskStatus) => {
    if (!task) return;
    await updateMutation.mutateAsync({
      id: task.id,
      dto: { status: newStatus },
    });
  };

  const handleToggleBlocker = async () => {
    if (!task) return;
    if (task.isBlocked) {
      // unblock
      await updateMutation.mutateAsync({
        id: task.id,
        dto: { isBlocked: false, blockedReason: null },
      });
      setIsEditingBlocker(false);
    } else {
      // show input to block
      setIsEditingBlocker(true);
    }
  };

  const handleConfirmBlock = async () => {
    if (!task || !blockerReasonInput.trim()) return;
    await updateMutation.mutateAsync({
      id: task.id,
      dto: {
        isBlocked: true,
        blockedReason: blockerReasonInput.trim(),
      },
    });
    setIsEditingBlocker(false);
    setBlockerReasonInput('');
  };

  const handleDelete = async () => {
    if (!task) return;
    if (confirm('Yakin ingin menghapus task ini?')) {
      await deleteMutation.mutateAsync(task.id);
      onOpenChange(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="overflow-y-auto sm:max-w-lg p-6 space-y-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="text-xs text-muted-foreground">Memuat detail task & log aktivitas...</p>
          </div>
        ) : error || !task ? (
          <div className="p-6 text-center rounded-xl border border-destructive/20 bg-destructive/5 space-y-2">
            <AlertCircle className="size-8 text-destructive mx-auto" />
            <p className="text-sm font-semibold text-destructive">Gagal memuat task.</p>
            <p className="text-xs text-muted-foreground">Task mungkin telah dihapus atau Anda tidak memiliki akses.</p>
          </div>
        ) : (
          <>
            {/* Header & Badges */}
            <SheetHeader className="space-y-3 text-left">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={`font-semibold text-2xs ${statusColors[task.status].bg} ${statusColors[task.status].text}`}
                  >
                    {statusColors[task.status].label}
                  </Badge>

                  <Badge
                    variant="outline"
                    className={`text-2xs ${priorityColors[task.priority].bg} ${priorityColors[task.priority].text}`}
                  >
                    <Flag className="size-3 mr-1" />
                    {priorityColors[task.priority].label}
                  </Badge>

                  {task.revisionCount > 0 && (
                    <Badge variant="secondary" className="text-2xs text-amber-600 bg-amber-50">
                      Revisi: {task.revisionCount}x
                    </Badge>
                  )}
                </div>

                {isCoordinatorOrAdmin && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDelete}
                    disabled={deleteMutation.isPending}
                    className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5 text-xs"
                  >
                    <Trash2 className="size-3.5" />
                    Hapus
                  </Button>
                )}
              </div>

              <SheetTitle className="text-xl font-bold leading-snug">
                {task.title}
              </SheetTitle>

              <SheetDescription className="text-xs text-muted-foreground">
                Bagian dari story:{' '}
                <span className="font-semibold text-foreground">{task.storyTitle || 'Story'}</span>
                {task.divisionName && ` • Divisi ${task.divisionName}`}
              </SheetDescription>
            </SheetHeader>

            {/* Blocker Alert if active */}
            {task.isBlocked && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-semibold text-xs">
                    <ShieldAlert className="size-4 shrink-0" />
                    Task Terkendala (Blocked)
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleToggleBlocker}
                    disabled={updateMutation.isPending}
                    className="h-7 text-xs border-rose-300 text-rose-700 hover:bg-rose-100"
                  >
                    Lepas Kendala
                  </Button>
                </div>
                <p className="text-xs text-rose-700 dark:text-rose-300 pl-6">
                  {task.blockedReason || 'Tidak ada alasan kendala tercatat.'}
                </p>
              </div>
            )}

            {/* Toggle Blocker Form */}
            {!task.isBlocked && isEditingBlocker && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 space-y-2">
                <p className="text-xs font-semibold text-amber-700">Tandai Hambatan / Kendala:</p>
                <Input
                  value={blockerReasonInput}
                  onChange={(e) => setBlockerReasonInput(e.target.value)}
                  placeholder="Jelaskan alasan blocker (cth: menunggu approval anggaran)..."
                  className="text-xs bg-background"
                />
                <div className="flex justify-end gap-2 pt-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsEditingBlocker(false)}
                    className="h-7 text-xs"
                  >
                    Batal
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleConfirmBlock}
                    disabled={!blockerReasonInput.trim() || updateMutation.isPending}
                    className="h-7 text-xs"
                  >
                    Pasang Blocker
                  </Button>
                </div>
              </div>
            )}

            {/* Description */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Deskripsi
              </h4>
              <div className="rounded-lg border bg-muted/20 p-3 text-xs leading-relaxed text-foreground min-h-16 whitespace-pre-wrap">
                {task.description || (
                  <span className="italic text-muted-foreground">Tidak ada deskripsi.</span>
                )}
              </div>
            </div>

            {/* Quick Status Bar */}
            <div className="space-y-2 rounded-xl border p-3.5 bg-card">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground">Ubah Status Alur Kerja:</span>
                {!task.isBlocked && !isEditingBlocker && (
                  <button
                    onClick={handleToggleBlocker}
                    className="text-2xs text-rose-600 hover:underline flex items-center gap-1 font-medium"
                  >
                    <AlertTriangle className="size-3" />
                    Tandai Blocker
                  </button>
                )}
              </div>
              <div className="grid grid-cols-5 gap-1.5 pt-1">
                {(['BACKLOG', 'TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'] as TaskStatus[]).map((s) => {
                  const isCurrent = task.status === s;
                  return (
                    <Button
                      key={s}
                      type="button"
                      size="sm"
                      variant={isCurrent ? 'default' : 'outline'}
                      onClick={() => handleStatusChange(s)}
                      disabled={updateMutation.isPending || isCurrent}
                      className={`h-7 px-1 text-2xs truncate ${
                        isCurrent ? 'font-bold' : 'text-muted-foreground'
                      }`}
                    >
                      {statusColors[s].label}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Key Information Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg border bg-card space-y-1">
                <span className="text-2xs text-muted-foreground font-medium flex items-center gap-1">
                  <User className="size-3 text-primary" />
                  Assignee
                </span>
                <p className="font-semibold text-foreground truncate">
                  {task.assigneeName || 'Belum ditugaskan'}
                </p>
                {task.assigneeEmail && (
                  <p className="text-2xs text-muted-foreground truncate">{task.assigneeEmail}</p>
                )}
              </div>

              <div className="p-3 rounded-lg border bg-card space-y-1">
                <span className="text-2xs text-muted-foreground font-medium flex items-center gap-1">
                  <Calendar className="size-3 text-primary" />
                  Tenggat Waktu
                </span>
                <p className="font-semibold text-foreground">
                  {task.dueDate
                    ? new Date(task.dueDate).toLocaleDateString('id-ID', { dateStyle: 'medium' })
                    : 'Tidak ada tenggat'}
                </p>
                {task.completedAt && (
                  <p className="text-2xs text-emerald-600 dark:text-emerald-400">
                    Selesai: {new Date(task.completedAt).toLocaleDateString('id-ID')}
                  </p>
                )}
              </div>
            </div>

            {/* Activity Logs (Audit Trail Timeline) */}
            <div className="space-y-3 pt-2 border-t">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <History className="size-3.5 text-primary" />
                  Riwayat Aktivitas & Audit ({task.activityLogs?.length ?? 0})
                </h4>
              </div>

              {task.activityLogs && task.activityLogs.length > 0 ? (
                <div className="relative pl-4 space-y-3 border-l-2 border-border/80">
                  {task.activityLogs.map((log) => {
                    const dateStr = new Date(log.createdAt).toLocaleString('id-ID', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    });

                    return (
                      <div key={log.id} className="relative group text-xs space-y-0.5">
                        {/* Dot indicator */}
                        <div className="absolute -left-5.25 top-1.5 size-2 rounded-full bg-primary ring-4 ring-background" />

                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-foreground">
                            {log.action.replace(/_/g, ' ')}
                          </span>
                          <span className="text-2xs text-muted-foreground">{dateStr}</span>
                        </div>

                        <p className="text-2xs text-muted-foreground">
                          Oleh:{' '}
                          <span className="font-medium text-foreground">
                            {log.actorName || log.actorEmail || 'Sistem'}
                          </span>
                        </p>

                        {/* Details diff if status changed */}
                        {log.action === 'TASK_STATUS_CHANGED' && log.before && log.after && (
                          <div className="mt-1 text-2xs px-2 py-1 rounded bg-muted/60 text-muted-foreground font-mono">
                            {log.before.status} → {log.after.status}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-2xs text-muted-foreground italic">
                  Belum ada catatan aktivitas tambahan untuk task ini.
                </p>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
