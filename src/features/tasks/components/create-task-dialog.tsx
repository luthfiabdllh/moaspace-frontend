import * as React from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckSquare, Loader2, Calendar, User, Flag, Zap } from 'lucide-react';
import { isAxiosError } from 'axios';
import { createTaskSchema, STORY_POINTS_SCALE, type CreateTaskDTO } from '../types';
import { useCreateTask } from '../api/use-mutations';
import { useDivision } from '@/features/divisions/api/use-queries';
import { useDivisionCapacities } from '@/features/capacity/api/use-queries';
import { OvercapacityDialog } from '@/features/capacity/components/overcapacity-dialog';
import type { OvercapacityWarningData } from '@/features/capacity/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { StoryPointGuidePopover } from './story-point-guide-popover';

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  storyId: string;
  storyTitle?: string;
  divisionId?: string;
}

export function CreateTaskDialog({
  open,
  onOpenChange,
  storyId,
  storyTitle,
  divisionId,
}: CreateTaskDialogProps) {
  const createMutation = useCreateTask();

  // Fetch division members & capacity utilization
  const { data: division } = useDivision(divisionId || '', Boolean(divisionId));
  const { data: memberCapacities = [] } = useDivisionCapacities(divisionId, undefined);
  const members = (division?.members ?? []).filter((m) => m.status === 'ACTIVE');

  // Overcapacity modal state
  const [overcapacityData, setOvercapacityData] = React.useState<OvercapacityWarningData | null>(null);
  const [pendingPayload, setPendingPayload] = React.useState<CreateTaskDTO | null>(null);
  const [isOvercapacityOpen, setIsOvercapacityOpen] = React.useState(false);

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<CreateTaskDTO>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      storyId,
      title: '',
      description: '',
      assigneeId: '',
      status: 'BACKLOG',
      priority: 'MEDIUM',
      storyPoints: 2,
      dueDate: '',
      isBlocked: false,
      blockedReason: '',
    },
  });

  const isBlocked = useWatch({ control, name: 'isBlocked' });
  const selectedSp = useWatch({ control, name: 'storyPoints' });
  const dueDate = useWatch({ control, name: 'dueDate' });
  const assigneeId = useWatch({ control, name: 'assigneeId' });
  const priority = useWatch({ control, name: 'priority' });

  // Reset form with clean default values whenever dialog opens
  React.useEffect(() => {
    if (open) {
      reset({
        storyId,
        title: '',
        description: '',
        assigneeId: '',
        status: 'BACKLOG',
        priority: 'MEDIUM',
        storyPoints: 2,
        dueDate: '',
        isBlocked: false,
        blockedReason: '',
      });
    }
  }, [open, storyId, reset]);

  const executeCreate = async (payload: CreateTaskDTO) => {
    try {
      await createMutation.mutateAsync({
        ...payload,
        storyId,
        assigneeId: payload.assigneeId && payload.assigneeId !== 'NONE' ? payload.assigneeId : undefined,
        description: payload.description || undefined,
        dueDate: payload.dueDate ? new Date(payload.dueDate).toISOString() : undefined,
        blockedReason: payload.isBlocked ? payload.blockedReason : undefined,
      });
      reset();
      setIsOvercapacityOpen(false);
      setOvercapacityData(null);
      setPendingPayload(null);
      onOpenChange(false);
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 409 && err.response?.data?.error === 'OVERCAPACITY_WARNING') {
        setPendingPayload(payload);
        setOvercapacityData(err.response.data.data);
        setIsOvercapacityOpen(true);
      }
    }
  };

  const onSubmit = async (data: CreateTaskDTO) => {
    await executeCreate(data);
  };

  const handleConfirmOverride = async () => {
    if (!pendingPayload) return;
    await executeCreate({
      ...pendingPayload,
      override: true,
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckSquare className="size-5 text-primary" />
              Tambah Task Baru
            </DialogTitle>
            <DialogDescription>
              {storyTitle ? `Di dalam story: "${storyTitle}"` : 'Tambahkan unit kerja perorangan.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
            {/* Judul Task */}
            <div className="space-y-1.5">
              <Label htmlFor="task-title" className="text-xs font-semibold">
                Judul Task <span className="text-destructive">*</span>
              </Label>
              <Input
                id="task-title"
                placeholder="Contoh: Buat wireframe alur pendaftaran"
                {...register('title')}
                className="text-xs"
              />
              {errors.title && (
                <p className="text-2xs text-destructive">{errors.title.message}</p>
              )}
            </div>

            {/* Deskripsi */}
            <div className="space-y-1.5">
              <Label htmlFor="task-desc" className="text-xs font-semibold">
                Deskripsi Pekerjaan (Opsional)
              </Label>
              <textarea
                id="task-desc"
                rows={2}
                placeholder="Detail instruksi atau referensi yang dibutuhkan..."
                {...register('description')}
                className="w-full rounded-md border border-input bg-background p-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              />
            </div>

            {/* Estimasi Story Points (Skala Fibonacci: 1, 2, 3, 5, 8) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-1.5 text-xs font-semibold">
                  <Zap className="size-3.5 text-violet-500" />
                  Estimasi Story Point (SP)
                </Label>
                <StoryPointGuidePopover />
              </div>
              <div className="flex items-center gap-2">
                {STORY_POINTS_SCALE.map((sp) => {
                  const isSelected = selectedSp === sp;
                  return (
                    <button
                      key={sp}
                      type="button"
                      onClick={() => setValue('storyPoints', sp)}
                      className={cn(
                        'flex-1 py-1.5 rounded-lg border text-xs font-mono font-bold transition-all',
                        isSelected
                          ? 'border-violet-500 bg-violet-500/10 text-violet-700 dark:text-violet-300 ring-2 ring-violet-500/20'
                          : 'border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground'
                      )}
                    >
                      {sp} SP
                    </button>
                  );
                })}
              </div>
              {errors.storyPoints && (
                <p className="text-2xs text-destructive">{errors.storyPoints.message}</p>
              )}
            </div>

            {/* Penanggung Jawab (Assignee) dengan indikator Utilisasi */}
            <div className="space-y-1.5">
              <Label htmlFor="task-assignee" className="flex items-center gap-1.5 text-xs font-semibold">
                <User className="size-3.5 text-muted-foreground" />
                Penanggung Jawab (Assignee)
              </Label>
              <Select
                value={assigneeId || 'NONE'}
                onValueChange={(v) => setValue('assigneeId', v === 'NONE' ? '' : v)}
              >
                <SelectTrigger id="task-assignee" className="w-full h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NONE">-- Belum Ditugaskan --</SelectItem>
                  {members.map((m) => {
                    const cap = memberCapacities.find((c) => c.userId === m.id);
                    const utilLabel = cap ? ` [${cap.utilizationPercentage}% beban: ${cap.activeSp}/${cap.capacitySp} SP]` : '';
                    return (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name} ({m.role}){utilLabel}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Grid: Prioritas & Tenggat Waktu */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="task-priority" className="flex items-center gap-1.5 text-xs font-semibold">
                  <Flag className="size-3.5 text-muted-foreground" />
                  Prioritas
                </Label>
                <Select
                  value={priority}
                  onValueChange={(v) => setValue('priority', v as CreateTaskDTO['priority'])}
                >
                  <SelectTrigger id="task-priority" className="w-full h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Rendah (LOW)</SelectItem>
                    <SelectItem value="MEDIUM">Sedang (MEDIUM)</SelectItem>
                    <SelectItem value="HIGH">Tinggi (HIGH)</SelectItem>
                    <SelectItem value="URGENT">Mendesak (URGENT)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="task-duedate" className="flex items-center gap-1.5 text-xs font-semibold">
                  <Calendar className="size-3.5 text-muted-foreground" />
                  Tenggat Waktu
                </Label>
                <DatePicker
                  id="task-duedate"
                  value={dueDate}
                  onChange={(v) => setValue('dueDate', v || '')}
                  className="text-xs"
                />
              </div>
            </div>

            {/* Blocker Flag */}
            <div className="space-y-2 rounded-lg border border-border/70 p-3 bg-muted/20">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="task-isBlocked"
                  {...register('isBlocked')}
                  className="h-4 w-4 rounded border-gray-300 text-destructive focus:ring-destructive"
                />
                <Label htmlFor="task-isBlocked" className="text-xs font-medium cursor-pointer">
                  Tandai sebagai ada kendala (Blocked)
                </Label>
              </div>

              {isBlocked && (
                <div className="space-y-1 pt-1">
                  <Input
                    placeholder="Sebutkan alasan kendala/hambatan..."
                    {...register('blockedReason')}
                    className="text-xs border-destructive/40 focus-visible:ring-destructive"
                  />
                </div>
              )}
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={createMutation.isPending}
              >
                Batal
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  'Buat Task'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <OvercapacityDialog
        open={isOvercapacityOpen}
        onOpenChange={setIsOvercapacityOpen}
        data={overcapacityData}
        onConfirmOverride={handleConfirmOverride}
        onCancel={() => {
          setIsOvercapacityOpen(false);
          setOvercapacityData(null);
        }}
        isLoading={createMutation.isPending}
      />
    </>
  );
}

