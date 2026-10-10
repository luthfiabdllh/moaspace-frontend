import * as React from 'react';
import {
  Calendar,
  User,
  AlertTriangle,
  Flag,
  History,
  Trash2,
  AlertCircle,
  Loader2,
  ShieldAlert,
  Zap,
  Lock,
  Edit2,
  GitPullRequest,
  ExternalLink,
  AlignLeft,
  Check,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { isAxiosError } from 'axios';
import { useTask } from '../api/use-queries';
import { useUpdateTask, useDeleteTask } from '../api/use-mutations';
import { useDivision } from '@/features/divisions/api/use-queries';
import { useDivisionCapacities } from '@/features/capacity/api/use-queries';
import { OvercapacityDialog } from '@/features/capacity/components/overcapacity-dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { DatePicker } from '@/components/ui/date-picker';
import type { OvercapacityWarningData } from '@/features/capacity/types';
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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { STORY_POINTS_SCALE, type TaskStatus, type TaskPriority, type UpdateTaskDTO } from '../types';
import { StoryPointGuidePopover } from './story-point-guide-popover';

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
  const { data: task, isLoading, error } = useTask(taskId || '', Boolean(taskId && open));
  const updateMutation = useUpdateTask();
  const deleteMutation = useDeleteTask();

  const { data: division } = useDivision(task?.divisionId || '', Boolean(task?.divisionId));
  const { data: memberCapacities = [] } = useDivisionCapacities(task?.divisionId, undefined);
  const members = division?.members ?? [];

  const [isEditingBlocker, setIsEditingBlocker] = React.useState(false);
  const [blockerReasonInput, setBlockerReasonInput] = React.useState('');

  // SP Editing State
  const [isEditingSp, setIsEditingSp] = React.useState(false);
  const [targetSp, setTargetSp] = React.useState<number>(1);
  const [spReasonInput, setSpReasonInput] = React.useState('');

  // Description Editing State
  const [isEditingDescription, setIsEditingDescription] = React.useState(false);
  const [descriptionInput, setDescriptionInput] = React.useState('');

  // Title Editing State
  const [isEditingTitle, setIsEditingTitle] = React.useState(false);
  const [titleInput, setTitleInput] = React.useState('');

  // Due Date (Deadline) Editing State
  const [isEditingDueDate, setIsEditingDueDate] = React.useState(false);
  const [dueDateInput, setDueDateInput] = React.useState('');

  // Overcapacity modal state
  const [overcapacityData, setOvercapacityData] = React.useState<OvercapacityWarningData | null>(null);
  const [pendingUpdate, setPendingUpdate] = React.useState<UpdateTaskDTO | null>(null);
  const [isOvercapacityOpen, setIsOvercapacityOpen] = React.useState(false);

  // Confirm/alert dialog state (ganti window.confirm / window.alert)
  const [isSpReasonAlertOpen, setIsSpReasonAlertOpen] = React.useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = React.useState(false);

  // Adjusted during render (not in an effect) when a different task loads —
  // see react-hooks/set-state-in-effect.
  const [prevTask, setPrevTask] = React.useState(task);
  if (task !== prevTask) {
    setPrevTask(task);
    if (task) {
      setTargetSp(task.storyPoints ?? 1);
      setSpReasonInput('');
      setIsEditingSp(false);
      setDescriptionInput(task.description || '');
      setIsEditingDescription(false);
      setTitleInput(task.title || '');
      setIsEditingTitle(false);
      setDueDateInput(task.dueDate ? task.dueDate.split('T')[0] : '');
      setIsEditingDueDate(false);
    }
  }

  if (!open || !taskId) return null;

  const executeUpdate = async (dto: UpdateTaskDTO) => {
    if (!task) return;
    try {
      await updateMutation.mutateAsync({
        id: task.id,
        dto,
      });
      setIsOvercapacityOpen(false);
      setOvercapacityData(null);
      setPendingUpdate(null);
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 409 && err.response?.data?.error === 'OVERCAPACITY_WARNING') {
        setPendingUpdate(dto);
        setOvercapacityData(err.response.data.data);
        setIsOvercapacityOpen(true);
      }
    }
  };

  const handleStatusChange = async (newStatus: TaskStatus) => {
    await executeUpdate({ status: newStatus });
  };

  const handleAssigneeChange = async (newAssigneeId: string) => {
    const val = newAssigneeId === 'NONE' ? null : newAssigneeId;
    await executeUpdate({ assigneeId: val });
  };

  const handleSaveSp = async () => {
    if (!task) return;
    const isLocked = Boolean(task.spLockedAt || ['IN_PROGRESS', 'REVIEW', 'DONE'].includes(task.status));
    if (isLocked && !spReasonInput.trim()) {
      setIsSpReasonAlertOpen(true);
      return;
    }
    await executeUpdate({
      storyPoints: targetSp,
      spReason: isLocked ? spReasonInput.trim() : undefined,
    });
    setIsEditingSp(false);
  };

  const handleSaveDescription = async () => {
    if (!task) return;
    await executeUpdate({
      description: descriptionInput.trim(),
    });
    setIsEditingDescription(false);
  };

  const handleCancelDescription = () => {
    setDescriptionInput(task?.description || '');
    setIsEditingDescription(false);
  };

  const handleSaveTitle = async () => {
    if (!task || !titleInput.trim()) return;
    await executeUpdate({ title: titleInput.trim() });
    setIsEditingTitle(false);
  };

  const handleCancelTitle = () => {
    setTitleInput(task?.title || '');
    setIsEditingTitle(false);
  };

  const handleSaveDueDate = async () => {
    if (!task) return;
    await executeUpdate({ dueDate: dueDateInput || null });
    setIsEditingDueDate(false);
  };

  const handleCancelDueDate = () => {
    setDueDateInput(task?.dueDate ? task.dueDate.split('T')[0] : '');
    setIsEditingDueDate(false);
  };

  const handleToggleBlocker = async () => {
    if (!task) return;
    if (task.isBlocked) {
      await executeUpdate({ isBlocked: false, blockedReason: null });
      setIsEditingBlocker(false);
    } else {
      setIsEditingBlocker(true);
    }
  };

  const handleConfirmBlock = async () => {
    if (!task || !blockerReasonInput.trim()) return;
    await executeUpdate({
      isBlocked: true,
      blockedReason: blockerReasonInput.trim(),
    });
    setIsEditingBlocker(false);
    setBlockerReasonInput('');
  };

  const handleDelete = () => {
    if (!task) return;
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!task) return;
    await deleteMutation.mutateAsync(task.id);
    onOpenChange(false);
  };

  const isSpLocked = Boolean(task?.spLockedAt || (task && ['IN_PROGRESS', 'REVIEW', 'DONE'].includes(task.status)));

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          className="overflow-y-auto data-[side=right]:sm:max-w-2xl data-[side=right]:md:max-w-3xl data-[side=right]:lg:max-w-4xl data-[side=right]:xl:max-w-5xl data-[side=right]:2xl:max-w-6xl p-6 space-y-6"
        >
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

                    {task.storyPoints !== null && task.storyPoints !== undefined && (
                      <Badge
                        variant="secondary"
                        className="text-2xs font-mono font-bold bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300 border border-violet-200"
                      >
                        {task.storyPoints} SP
                        {isSpLocked && <Lock className="size-2.5 ml-1 text-violet-500" />}
                      </Badge>
                    )}

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

                {isEditingTitle ? (
                  <div className="space-y-2 animate-in fade-in duration-150">
                    <SheetTitle className="sr-only">{titleInput || task.title}</SheetTitle>
                    <Input
                      autoFocus
                      value={titleInput}
                      onChange={(e) => setTitleInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleSaveTitle();
                        } else if (e.key === 'Escape') {
                          e.preventDefault();
                          handleCancelTitle();
                        }
                      }}
                      placeholder="Judul task..."
                      className="text-base font-bold h-10"
                    />
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={handleCancelTitle}
                        disabled={updateMutation.isPending}
                        className="h-7 text-xs px-2.5"
                      >
                        <X className="size-3.5 mr-1" />
                        Batal
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleSaveTitle}
                        disabled={updateMutation.isPending || !titleInput.trim()}
                        className="h-7 text-xs px-3 gap-1.5"
                      >
                        <Check className="size-3.5" />
                        Simpan
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="group flex items-start gap-2">
                    <SheetTitle className="text-xl font-bold leading-snug flex-1">
                      {task.title}
                    </SheetTitle>
                    <button
                      type="button"
                      onClick={() => {
                        setTitleInput(task.title);
                        setIsEditingTitle(true);
                      }}
                      className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity shrink-0 mt-1 text-muted-foreground hover:text-foreground cursor-pointer"
                      title="Edit judul task"
                    >
                      <Edit2 className="size-3.5" />
                    </button>
                  </div>
                )}

                <SheetDescription className="text-xs text-muted-foreground">
                  Bagian dari story:{' '}
                  <span className="font-semibold text-foreground">{task.storyTitle || 'Story'}</span>
                  {task.epicTitle && (
                    <>
                      {' • Epic: '}
                      <span className="font-semibold text-indigo-600 dark:text-indigo-400">{task.epicTitle}</span>
                    </>
                  )}
                  {task.divisionName && ` • Divisi ${task.divisionName}`}
                </SheetDescription>
              </SheetHeader>

              {/* Linked Request Alert if originating from a Request */}
              {task.sourceRequestId && (
                <div className="rounded-xl border border-amber-300 dark:border-amber-800/80 bg-amber-50/70 dark:bg-amber-950/30 p-3.5 flex items-center justify-between gap-3">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <GitPullRequest className="size-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-amber-900 dark:text-amber-200">
                        Berasal dari Permohonan Kolaborasi
                      </p>
                      <p className="text-2xs text-muted-foreground truncate">
                        {task.requestTitle || 'Lihat brief, lampiran, dan status pengerjaan'}
                      </p>
                    </div>
                  </div>
                  <Link href={`/requests/${task.sourceRequestId}`}>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-2xs gap-1 border-amber-300 dark:border-amber-700 bg-background/80 hover:bg-background shrink-0"
                    >
                      Buka Request
                      <ExternalLink className="size-3" />
                    </Button>
                  </Link>
                </div>
              )}

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

              {/* Description Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                    <AlignLeft className="size-3.5 text-primary/70" />
                    <h4>Deskripsi</h4>
                  </div>
                  {!isEditingDescription ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setDescriptionInput(task.description || '');
                        setIsEditingDescription(true);
                      }}
                      className="h-6 px-2 text-2xs text-muted-foreground hover:text-foreground gap-1 transition-colors cursor-pointer"
                    >
                      <Edit2 className="size-3" />
                      <span>Edit Deskripsi</span>
                    </Button>
                  ) : (
                    <span className="text-3xs text-muted-foreground hidden sm:inline">
                      Esc untuk batal • Ctrl+Enter untuk simpan
                    </span>
                  )}
                </div>

                {isEditingDescription ? (
                  <div className="space-y-2.5 rounded-xl border border-primary/30 bg-primary/5 p-3 animate-in fade-in-50 duration-150">
                    <Textarea
                      autoFocus
                      value={descriptionInput}
                      onChange={(e) => setDescriptionInput(e.target.value)}
                      onKeyDown={(e) => {
                        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                          e.preventDefault();
                          handleSaveDescription();
                        } else if (e.key === 'Escape') {
                          e.preventDefault();
                          handleCancelDescription();
                        }
                      }}
                      placeholder="Tuliskan deskripsi lengkap tugas, acceptance criteria, atau instruksi pengerjaan..."
                      className="min-h-35 text-xs resize-y leading-relaxed bg-background border-border/80 focus-visible:border-primary shadow-2xs"
                    />
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-3xs text-muted-foreground">
                        {descriptionInput.length > 0
                          ? `${descriptionInput.length} karakter`
                          : 'Shift+Enter untuk baris baru'}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={handleCancelDescription}
                          disabled={updateMutation.isPending}
                          className="h-7 text-xs px-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          <X className="size-3.5 mr-1" />
                          Batal
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          onClick={handleSaveDescription}
                          disabled={updateMutation.isPending}
                          className="h-7 text-xs px-3 shadow-xs gap-1.5 cursor-pointer"
                        >
                          {updateMutation.isPending ? (
                            <>
                              <Loader2 className="size-3 animate-spin" />
                              <span>Menyimpan...</span>
                            </>
                          ) : (
                            <>
                              <Check className="size-3.5" />
                              <span>Simpan Deskripsi</span>
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => {
                      setDescriptionInput(task.description || '');
                      setIsEditingDescription(true);
                    }}
                    className={cn(
                      'group relative rounded-xl border p-3.5 text-xs leading-relaxed transition-all cursor-pointer',
                      task.description
                        ? 'bg-muted/20 hover:bg-muted/40 hover:border-border text-foreground min-h-18 whitespace-pre-wrap'
                        : 'border-dashed border-border/80 bg-muted/10 hover:bg-muted/25 text-muted-foreground text-center py-6'
                    )}
                    title="Klik untuk mengedit deskripsi tugas"
                  >
                    {task.description ? (
                      <>
                        <div>{task.description}</div>
                        <div className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-3xs bg-background/90 backdrop-blur-xs border border-border/80 px-2 py-0.5 rounded-md text-muted-foreground flex items-center gap-1 shadow-2xs">
                            <Edit2 className="size-2.5 text-primary" />
                            Edit
                          </span>
                        </div>
                      </>
                    ) : (
                      <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground group-hover:text-foreground">
                        <Edit2 className="size-3.5 text-muted-foreground/70" />
                        <span>Belum ada deskripsi. Klik di sini untuk menambahkan...</span>
                      </p>
                    )}
                  </div>
                )}
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

              {/* Story Point & Lock Section */}
              <div className="rounded-xl border p-3.5 bg-card space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-semibold">
                    <Zap className="size-4 text-violet-500" />
                    <span>Story Point (Estimasi Beban Kerja)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StoryPointGuidePopover />
                    {isSpLocked ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        <Lock className="size-3" />
                        Terkunci Sejak In Progress
                      </span>
                    ) : (
                      <span className="text-[11px] text-muted-foreground">Belum Dikunci</span>
                    )}
                  </div>
                </div>

                {!isEditingSp ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold font-mono text-violet-600 dark:text-violet-400">
                        {task.storyPoints ?? '–'} SP
                      </span>
                      {task.storyPoints && (
                        <span className="text-xs text-muted-foreground">
                          ({task.storyPoints <= 2 ? 'Ringan' : task.storyPoints <= 5 ? 'Sedang' : 'Kompleks'})
                        </span>
                      )}
                    </div>

                    {(isCoordinatorOrAdmin || !isSpLocked) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setTargetSp(task.storyPoints ?? 1);
                          setIsEditingSp(true);
                        }}
                        className="h-7 text-xs gap-1"
                      >
                        <Edit2 className="size-3" />
                        {isSpLocked ? 'Ubah SP (Koordinator)' : 'Atur SP'}
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3 pt-2 border-t">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-medium">Pilih Skala Story Point:</Label>
                        <StoryPointGuidePopover />
                      </div>
                      <div className="flex items-center gap-1.5">
                        {STORY_POINTS_SCALE.map((sp) => (
                          <button
                            key={sp}
                            type="button"
                            onClick={() => setTargetSp(sp)}
                            className={cn(
                              'flex-1 py-1 rounded text-xs font-mono font-bold border transition-colors',
                              targetSp === sp
                                ? 'bg-violet-600 text-white border-violet-600'
                                : 'bg-background hover:bg-muted text-muted-foreground'
                            )}
                          >
                            {sp} SP
                          </button>
                        ))}
                      </div>
                    </div>

                    {isSpLocked && (
                      <div className="space-y-1">
                        <Label htmlFor="spReason" className="text-xs font-medium text-destructive">
                          Alasan Perubahan SP (Wajib karena sudah terkunci) *
                        </Label>
                        <Input
                          id="spReason"
                          value={spReasonInput}
                          onChange={(e) => setSpReasonInput(e.target.value)}
                          placeholder="Contoh: Klien menambah spesifikasi deliverable..."
                          className="text-xs"
                        />
                      </div>
                    )}

                    <div className="flex justify-end gap-2 pt-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setIsEditingSp(false)}
                        className="h-7 text-xs"
                      >
                        Batal
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSaveSp}
                        disabled={updateMutation.isPending || (isSpLocked && !spReasonInput.trim())}
                        className="h-7 text-xs"
                      >
                        {updateMutation.isPending ? 'Menyimpan...' : 'Simpan SP'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Key Information Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                {/* Assignee Card with picker for coordinator/admin */}
                <div className="p-3 rounded-lg border bg-card space-y-1.5">
                  <span className="text-2xs text-muted-foreground font-medium flex items-center gap-1">
                    <User className="size-3 text-primary" />
                    Assignee
                  </span>
                  {isCoordinatorOrAdmin ? (
                    <Select
                      value={task.assigneeId || 'NONE'}
                      onValueChange={handleAssigneeChange}
                      disabled={updateMutation.isPending}
                    >
                      <SelectTrigger className="w-full h-8 text-xs font-medium">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NONE">-- Belum Ditugaskan --</SelectItem>
                        {members.map((m) => {
                          const cap = memberCapacities.find((c) => c.userId === m.id);
                          const utilText = cap ? ` [${cap.utilizationPercentage}%]` : '';
                          return (
                            <SelectItem key={m.id} value={m.id}>
                              {m.name} ({m.role}){utilText}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div>
                      <p className="font-semibold text-foreground truncate">
                        {task.assigneeName || 'Belum ditugaskan'}
                      </p>
                      {task.assigneeEmail && (
                        <p className="text-2xs text-muted-foreground truncate">{task.assigneeEmail}</p>
                      )}
                    </div>
                  )}
                </div>

                <div className="p-3 rounded-lg border bg-card space-y-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-2xs text-muted-foreground font-medium flex items-center gap-1">
                      <Calendar className="size-3 text-primary" />
                      Tenggat Waktu
                    </span>
                    {!isEditingDueDate && (
                      <button
                        type="button"
                        onClick={() => {
                          setDueDateInput(task.dueDate ? task.dueDate.split('T')[0] : '');
                          setIsEditingDueDate(true);
                        }}
                        className="text-muted-foreground hover:text-foreground cursor-pointer"
                        title="Edit tenggat waktu"
                      >
                        <Edit2 className="size-3" />
                      </button>
                    )}
                  </div>
                  {isEditingDueDate ? (
                    <div className="space-y-1.5 pt-0.5">
                      <DatePicker
                        value={dueDateInput}
                        onChange={(v) => setDueDateInput(v || '')}
                        className="h-8 text-xs"
                      />
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={handleCancelDueDate}
                          disabled={updateMutation.isPending}
                          className="h-6 text-2xs px-2"
                        >
                          Batal
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          onClick={handleSaveDueDate}
                          disabled={updateMutation.isPending}
                          className="h-6 text-2xs px-2"
                        >
                          Simpan
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="font-semibold text-foreground">
                      {task.dueDate
                        ? new Date(task.dueDate).toLocaleDateString('id-ID', { dateStyle: 'medium' })
                        : 'Tidak ada tenggat'}
                    </p>
                  )}
                  {task.completedAt && (
                    <p className="text-2xs text-emerald-600 dark:text-emerald-400">
                      Selesai: {new Date(task.completedAt).toLocaleDateString('id-ID')}
                    </p>
                  )}
                </div>
              </div>

              {/* Riwayat Perubahan Story Point jika ada */}
              {task.spLogs && task.spLogs.length > 0 && (
                <div className="space-y-2 rounded-xl border p-3.5 bg-muted/20 text-xs">
                  <h4 className="font-semibold text-foreground flex items-center gap-1.5">
                    <Zap className="size-3.5 text-violet-500" />
                    Log Perubahan Story Point ({task.spLogs.length})
                  </h4>
                  <div className="space-y-2 pt-1 divide-y divide-border/60">
                    {task.spLogs.map((log) => (
                      <div key={log.id} className="pt-2 first:pt-0 space-y-0.5">
                        <div className="flex items-center justify-between text-2xs">
                          <span className="font-mono font-bold text-violet-700 dark:text-violet-300">
                            {log.oldSp ?? 0} SP → {log.newSp} SP
                          </span>
                          <span className="text-muted-foreground">
                            {new Date(log.createdAt).toLocaleDateString('id-ID')}
                          </span>
                        </div>
                        <p className="text-2xs italic text-foreground">&quot;{log.reason}&quot;</p>
                        <p className="text-[10px] text-muted-foreground">
                          Oleh: {log.changedByName || 'Koordinator'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Activity Logs (Audit Trail Timeline) */}
              <div className="space-y-3 pt-2 border-t">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
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

      <OvercapacityDialog
        open={isOvercapacityOpen}
        onOpenChange={setIsOvercapacityOpen}
        data={overcapacityData}
        onConfirmOverride={async () => {
          if (!pendingUpdate) return;
          await executeUpdate({
            ...pendingUpdate,
            override: true,
          });
        }}
        onCancel={() => {
          setIsOvercapacityOpen(false);
          setOvercapacityData(null);
        }}
        isLoading={updateMutation.isPending}
      />

      <ConfirmDialog
        open={isSpReasonAlertOpen}
        onOpenChange={setIsSpReasonAlertOpen}
        title="Alasan Perubahan SP Wajib Diisi"
        description="Story Point yang sudah terkunci hanya dapat diubah dengan menyertakan alasan yang jelas."
        hideCancel
        onConfirm={() => setIsSpReasonAlertOpen(false)}
      />

      <ConfirmDialog
        open={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
        title="Hapus Task Ini?"
        description="Tindakan ini tidak dapat dibatalkan. Task akan dihapus secara permanen."
        variant="destructive"
        onConfirm={confirmDelete}
      />
    </>
  );
}

