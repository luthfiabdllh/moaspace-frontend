'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  FileText,
  FileEdit,
  ArrowLeft,
  CheckCircle2,
  Clock,
  RotateCcw,
  Check,
} from 'lucide-react';
import { useEpic } from '../api/use-queries';
import { useStories } from '@/features/stories/api/use-queries';
import { useTasks } from '@/features/tasks/api/use-queries';
import { useCurrentUser } from '@/features/auth/api/use-queries';
import { useUpdateEpic } from '../api/use-mutations';
import { EditEpicDialog } from './edit-epic-dialog';
import { NotionEditor } from '@/components/ui/notion-editor';
import { CreateStoryDialog } from '@/features/stories/components/create-story-dialog';
import { CreateTaskDialog } from '@/features/tasks/components/create-task-dialog';
import { TaskDetailSheet } from '@/features/tasks/components/task-detail-sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { EpicItem, EpicDivision } from '../types';
import type { StoryItem } from '@/features/stories/types';
import type { TaskItem } from '@/features/tasks/types';

interface EpicDetailContentProps {
  epicId: string;
}

export function EpicDetailContent({ epicId }: EpicDetailContentProps) {
  const router = useRouter();
  const { data: user } = useCurrentUser();
  const { data: epic, isLoading, error } = useEpic(epicId);

  const { data: stories = [], isLoading: isStoriesLoading } = useStories(
    epicId ? { epicId } : undefined
  );

  const { data: allTasks = [] } = useTasks(
    epic?.ownerDivisionId ? { divisionId: epic.ownerDivisionId } : undefined
  );

  const [createStoryOpen, setCreateStoryOpen] = useState(false);
  const [editEpicOpen, setEditEpicOpen] = useState(false);
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [selectedStory, setSelectedStory] = useState<{
    id: string;
    title: string;
    divisionId: string;
  } | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [expandedStories, setExpandedStories] = useState<Record<string, boolean>>({});

  const updateEpicMutation = useUpdateEpic();
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [editedDesc, setEditedDesc] = useState(epic?.description || '');

  // Adjusted during render (not in an effect) when the loaded epic changes —
  // see react-hooks/set-state-in-effect.
  const [prevEpicKey, setPrevEpicKey] = useState({ id: epic?.id, description: epic?.description });
  if (epic?.id !== prevEpicKey.id || epic?.description !== prevEpicKey.description) {
    setPrevEpicKey({ id: epic?.id, description: epic?.description });
    if (epic?.description !== undefined) {
      setEditedDesc(epic.description || '');
      setIsEditingDesc(false);
    }
  }

  const handleSaveDesc = async () => {
    if (!epic) return;
    await updateEpicMutation.mutateAsync({
      id: epic.id,
      dto: { description: editedDesc },
    });
    setIsEditingDesc(false);
  };

  const handleToggleClosed = async () => {
    if (!epic) return;
    await updateEpicMutation.mutateAsync({
      id: epic.id,
      dto: { isClosed: !epic.isClosed },
    });
  };

  const toggleStory = (storyId: string) => {
    setExpandedStories((prev) => ({
      ...prev,
      [storyId]: prev[storyId] === undefined ? false : !prev[storyId],
    }));
  };

  if (isLoading) {
    return (
      <div className="mx-auto space-y-6 py-4">
        <div className="h-6 w-36 bg-muted rounded animate-pulse" />
        <div className="h-28 bg-card border rounded-2xl animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-card border rounded-2xl animate-pulse" />
          <div className="h-72 bg-card border rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !epic) {
    return (
      <div className="mx-auto py-16 text-center space-y-4">
        <div className="size-12 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
          <AlertTriangle className="size-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-foreground">Inisiatif Tidak Ditemukan</h2>
          <p className="text-sm text-muted-foreground">
            Inisiatif atau Epic yang Anda cari tidak tersedia atau Anda tidak memiliki akses.
          </p>
        </div>
        <Link href="/epics">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="size-4" />
            Kembali ke Daftar Inisiatif
          </Button>
        </Link>
      </div>
    );
  }

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
    <div className="mx-auto space-y-6 pb-8">
      {/* Top Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link
            href="/epics"
            className="hover:text-foreground transition-colors inline-flex items-center gap-1.5 font-medium -ml-1 py-1 px-2 rounded-lg hover:bg-muted/40"
          >
            <ArrowLeft className="size-3.5" />
            <span>Inisiatif &amp; Epic</span>
          </Link>
          <span className="text-muted-foreground/40">/</span>
          <span className="text-foreground font-semibold truncate max-w-64 sm:max-w-md">
            {epic.title}
          </span>
        </div>

        {isCoordinator && (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setEditEpicOpen(true)}
              className="text-xs h-8.5 rounded-xl gap-1.5"
            >
              <FileEdit className="size-3.5" />
              Edit Inisiatif
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleToggleClosed}
              disabled={updateEpicMutation.isPending}
              className="text-xs h-8.5 rounded-xl gap-1.5"
            >
              {epic.isClosed ? (
                <>
                  <RotateCcw className="size-3.5 text-primary" />
                  Buka Kembali Inisiatif
                </>
              ) : (
                <>
                  <CheckCircle2 className="size-3.5 text-emerald-500" />
                  Tutup Inisiatif
                </>
              )}
            </Button>
            <Button
              size="sm"
              onClick={() => setCreateStoryOpen(true)}
              className="text-xs h-8.5 rounded-xl gap-1.5 shadow-2xs font-semibold"
            >
              <Plus className="size-3.5" />
              Tambah Story
            </Button>
          </div>
        )}
      </div>

      {/* Header Banner */}
      <div className="p-6 rounded-2xl border border-border/80 bg-card shadow-2xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-3xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-primary/10 text-primary flex items-center gap-1.5">
              <Target className="size-3.5" />
              Inisiatif Strategis
            </span>
            {epic.scope === 'CROSS' ? (
              <Badge className="bg-indigo-600/90 text-white hover:bg-indigo-600 gap-1 text-2xs py-0.5">
                <Network className="size-3" />
                Lintas Divisi
              </Badge>
            ) : (
              <Badge variant="outline" className="gap-1 text-2xs text-muted-foreground py-0.5">
                <Layers className="size-3 text-primary" />
                {epic.ownerDivisionName || 'Divisi'}
              </Badge>
            )}
            {epic.prokerTag && (
              <Badge variant="secondary" className="font-mono text-2xs py-0.5">
                #{epic.prokerTag}
              </Badge>
            )}
          </div>

          <Badge
            variant={epic.isClosed ? 'secondary' : 'default'}
            className={cn(
              'text-xs py-0.5 px-2.5 gap-1',
              !epic.isClosed && 'bg-emerald-600/90 hover:bg-emerald-600 text-white'
            )}
          >
            {epic.isClosed ? (
              <>
                <Clock className="size-3" /> Ditutup
              </>
            ) : (
              <>
                <Check className="size-3" /> Aktif Berjalan
              </>
            )}
          </Badge>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          {epic.title}
        </h1>

        {dateRange && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-0.5">
            <Calendar className="size-3.5 text-primary" />
            <span>Periode Pelaksanaan: <strong>{dateRange}</strong></span>
          </div>
        )}
      </div>

      {/* Origin Request Banner if linked */}
      {epic.sourceRequestId && (
        <div className="flex items-center justify-between p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-900 dark:text-amber-200 shadow-2xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <GitPullRequest className="size-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="truncate">
              Inisiatif ini dielevasi dari permohonan kolaborasi:{' '}
              <strong className="text-foreground">{epic.requestTitle || 'Permohonan Kolaborasi'}</strong>
            </span>
          </div>
          <Link
            href={`/requests/${epic.sourceRequestId}`}
            className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline shrink-0 ml-3"
          >
            Lihat Brief Permohonan
            <ExternalLink className="size-3" />
          </Link>
        </div>
      )}

      {/* Main Grid: Left (Description + Stories), Right (Stats & Info) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Canvas) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description Card */}
          <Card className="rounded-2xl shadow-2xs border-border/80 bg-card">
            <CardHeader className="pb-3 border-b border-border/50">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <FileText className="size-4 text-primary" />
                  Deskripsi &amp; Sasaran Inisiatif
                </CardTitle>
                {isCoordinator && !isEditingDesc && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditingDesc(true)}
                    className="h-7 px-2.5 text-xs text-muted-foreground hover:text-foreground gap-1.5"
                  >
                    <FileEdit className="size-3.5" />
                    Edit Deskripsi
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              {isEditingDesc ? (
                <div className="space-y-3 animate-in fade-in duration-150">
                  <NotionEditor
                    value={editedDesc}
                    onChange={setEditedDesc}
                    placeholder="Tuliskan deskripsi, sasaran inisiatif, atau rincian pekerjaan... (Ketik '/' untuk opsi format blok Notion)"
                    minHeight="min-h-[200px]"
                  />
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditedDesc(epic.description || '');
                        setIsEditingDesc(false);
                      }}
                      disabled={updateEpicMutation.isPending}
                    >
                      Batal
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleSaveDesc}
                      disabled={updateEpicMutation.isPending}
                      className="gap-1.5"
                    >
                      {updateEpicMutation.isPending ? 'Menyimpan...' : 'Simpan Deskripsi'}
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  {epic.description ? (
                    /<[a-z][\s\S]*>/i.test(epic.description) ? (
                      <div
                        className="prose-notion text-sm leading-relaxed text-foreground bg-muted/10 border border-border/50 rounded-xl p-4.5 overflow-hidden"
                        dangerouslySetInnerHTML={{ __html: epic.description }}
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap bg-muted/10 border border-border/50 rounded-xl p-4.5">
                        {epic.description}
                      </p>
                    )
                  ) : (
                    <div
                      onClick={() => isCoordinator && setIsEditingDesc(true)}
                      className={cn(
                        'text-xs text-muted-foreground italic p-4 rounded-xl border border-dashed border-border/70 text-center',
                        isCoordinator && 'cursor-pointer hover:bg-muted/30 transition-colors'
                      )}
                    >
                      {isCoordinator
                        ? '+ Klik di sini untuk menambahkan deskripsi dan sasaran inisiatif (mendukung format Notion)...'
                        : 'Belum ada rincian deskripsi inisiatif yang disertakan.'}
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Deliverable Stories & Breakdown Tasks Card */}
          <Card className="rounded-2xl shadow-2xs border-border/80 bg-card">
            <CardHeader className="pb-3 border-b border-border/50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Bookmark className="size-4 text-primary" />
                    Pecahan Deliverable Stories ({stories.length})
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    Story mewakili pencapaian spesifik yang dipecah menjadi unit tugas (tasks).
                  </CardDescription>
                </div>
                {isCoordinator && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCreateStoryOpen(true)}
                    className="h-8 text-xs gap-1.5 shadow-2xs"
                  >
                    <Plus className="size-3.5" />
                    Tambah Story
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              {isStoriesLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
                  ))}
                </div>
              ) : stories.length === 0 ? (
                <div className="p-8 text-center rounded-xl border border-dashed text-xs text-muted-foreground space-y-3">
                  <div className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                    <Bookmark className="size-5" />
                  </div>
                  <p>Belum ada deliverable story di bawah inisiatif ini.</p>
                  {isCoordinator && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setCreateStoryOpen(true)}
                      className="gap-1.5 text-xs mt-1"
                    >
                      <Plus className="size-3.5" />
                      Buat Story Pertama
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {stories.map((story) => {
                    const storyTasks = (story as StoryItem & { tasks?: TaskItem[] }).tasks || allTasks.filter((t) => t.storyId === story.id);
                    const isStoryExpanded = expandedStories[story.id] !== false; // Default expanded

                    return (
                      <div
                        key={story.id}
                        className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-2xs"
                      >
                        {/* Story Header */}
                        <div
                          onClick={() => toggleStory(story.id)}
                          className="p-3.5 bg-muted/20 hover:bg-muted/30 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2"
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

                            <div className="space-y-1 min-w-0">
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
                              <h4 className="font-semibold text-sm text-foreground truncate">
                                {story.title}
                              </h4>
                              {story.doneCriteria && (
                                <p className="text-2xs text-muted-foreground line-clamp-1">
                                  <strong>DoD:</strong> {story.doneCriteria}
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
                                className="h-7 text-xs gap-1 border px-2.5 shadow-2xs hover:bg-muted"
                              >
                                <Plus className="size-3" />
                                Pecah Task
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Tasks inside Story */}
                        {isStoryExpanded && (
                          <div className="p-3 border-t border-border/50 bg-background/50 space-y-1.5">
                            {storyTasks.length === 0 ? (
                              <div className="py-3 px-3 text-center text-xs text-muted-foreground border border-dashed rounded-lg">
                                Belum ada task. Koordinator dapat memecah Story ini menjadi task kerja anggota.
                              </div>
                            ) : (
                              storyTasks.map((task: TaskItem) => (
                                <div
                                  key={task.id}
                                  onClick={() => setSelectedTaskId(task.id)}
                                  className="flex items-center justify-between gap-3 p-2.5 rounded-xl border border-border/60 bg-card hover:bg-muted/40 transition-colors cursor-pointer group"
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <div
                                      className={cn(
                                        'size-2 rounded-full shrink-0',
                                        task.status === 'DONE'
                                          ? 'bg-emerald-500'
                                          : task.status === 'IN_PROGRESS'
                                            ? 'bg-amber-500'
                                            : task.status === 'REVIEW'
                                              ? 'bg-purple-500'
                                              : 'bg-zinc-400'
                                      )}
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

                                  <div className="flex items-center gap-2.5 shrink-0 text-2xs">
                                    {task.dueDate && (
                                      <span
                                        className={cn(
                                          'flex items-center gap-1 font-medium',
                                          task.status !== 'DONE' && new Date(task.dueDate) < new Date()
                                            ? 'text-destructive'
                                            : 'text-muted-foreground'
                                        )}
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
            </CardContent>
          </Card>
        </div>

        {/* Right Column (Sidebar) */}
        <div className="space-y-6">
          {/* Progress Card */}
          <Card className="rounded-2xl shadow-2xs border-border/80 bg-card">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-sm font-semibold">Progres Inisiatif</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Penyelesaian Task</span>
                <span className="font-bold text-primary text-sm">
                  {epic.progressPercentage}%
                </span>
              </div>

              <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-500',
                    epic.progressPercentage === 100
                      ? 'bg-emerald-500'
                      : epic.progressPercentage > 50
                        ? 'bg-primary'
                        : 'bg-indigo-500'
                  )}
                  style={{ width: `${epic.progressPercentage}%` }}
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/50 text-center">
                <div className="p-2 rounded-lg bg-muted/30">
                  <div className="text-xs text-muted-foreground">Task Selesai</div>
                  <div className="text-base font-bold text-foreground mt-0.5">
                    {epic.doneTasks} / {epic.totalTasks}
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-muted/30">
                  <div className="text-xs text-muted-foreground">Stories</div>
                  <div className="text-base font-bold text-foreground mt-0.5">
                    {stories.length}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Details & Metadata Card */}
          <Card className="rounded-2xl shadow-2xs border-border/80 bg-card">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-sm font-semibold">Informasi Inisiatif</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3.5 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-border/40">
                <span className="text-muted-foreground">Cakupan</span>
                <span className="font-medium text-foreground">
                  {epic.scope === 'CROSS' ? 'Lintas Divisi (Cross)' : 'Internal Satu Divisi'}
                </span>
              </div>

              {epic.scope === 'DIVISION' ? (
                <div className="flex justify-between items-center py-1 border-b border-border/40">
                  <span className="text-muted-foreground">Divisi Pemilik</span>
                  <span className="font-medium text-foreground">
                    {epic.ownerDivisionName || '-'}
                  </span>
                </div>
              ) : (
                <div className="space-y-1.5 py-1 border-b border-border/40">
                  <span className="text-muted-foreground">Divisi yang Berpartisipasi</span>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {epic.participatingDivisions?.map((p: EpicDivision) => (
                      <Badge key={p.id} variant="secondary" className="text-3xs font-medium">
                        {p.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {epic.creatorName && (
                <div className="flex justify-between items-center py-1 border-b border-border/40">
                  <span className="text-muted-foreground">Dibuat Oleh</span>
                  <span className="font-medium text-foreground">{epic.creatorName}</span>
                </div>
              )}

              {epic.createdAt && (
                <div className="flex justify-between items-center py-1 border-b border-border/40">
                  <span className="text-muted-foreground">Tanggal Dibuat</span>
                  <span className="font-medium text-foreground">
                    {new Date(epic.createdAt).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                  </span>
                </div>
              )}

              {/* Jump to Kanban Board button */}
              <div className="pt-2">
                <Link
                  href={
                    epic.ownerDivisionId
                      ? `/board?division=${epic.ownerDivisionId}`
                      : '/board'
                  }
                  className="w-full inline-flex items-center justify-center gap-2 p-2.5 rounded-xl border border-border/80 hover:bg-muted/40 transition-colors font-semibold text-xs text-primary shadow-2xs"
                >
                  <Columns className="size-4" />
                  Buka Papan Kanban Divisi
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialogs for sub-actions */}
      {isCoordinator && (
        <EditEpicDialog
          epic={epic}
          open={editEpicOpen}
          onOpenChange={setEditEpicOpen}
        />
      )}

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
    </div>
  );
}
