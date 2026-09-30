'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckSquare, Loader2, Calendar, User, AlertCircle, Flag } from 'lucide-react';
import { createTaskSchema, type CreateTaskDTO } from '../types';
import { useCreateTask } from '../api/use-mutations';
import { useDivision } from '@/features/divisions/api/use-queries';
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

  // Fetch division members to assign
  const { data: division } = useDivision(divisionId || '', Boolean(divisionId));
  const members = division?.members ?? [];

  const {
    register,
    handleSubmit,
    reset,
    watch,
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
      dueDate: '',
      isBlocked: false,
      blockedReason: '',
    },
  });

  const isBlocked = watch('isBlocked');

  const onSubmit = async (data: CreateTaskDTO) => {
    try {
      await createMutation.mutateAsync({
        ...data,
        storyId,
        assigneeId: data.assigneeId && data.assigneeId !== 'NONE' ? data.assigneeId : undefined,
        description: data.description || undefined,
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : undefined,
        blockedReason: data.isBlocked ? data.blockedReason : undefined,
      });
      reset();
      onOpenChange(false);
    } catch {
      // error handled in mutation
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
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

          {/* Penanggung Jawab (Assignee) */}
          <div className="space-y-1.5">
            <Label htmlFor="task-assignee" className="flex items-center gap-1.5 text-xs font-semibold">
              <User className="size-3.5 text-muted-foreground" />
              Penanggung Jawab (Assignee)
            </Label>
            <select
              id="task-assignee"
              {...register('assigneeId')}
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="NONE">-- Belum Ditugaskan --</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.email}) - {m.role}
                </option>
              ))}
            </select>
          </div>

          {/* Grid: Prioritas & Tenggat Waktu */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="task-priority" className="flex items-center gap-1.5 text-xs font-semibold">
                <Flag className="size-3.5 text-muted-foreground" />
                Prioritas
              </Label>
              <select
                id="task-priority"
                {...register('priority')}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="LOW">Rendah (LOW)</option>
                <option value="MEDIUM">Sedang (MEDIUM)</option>
                <option value="HIGH">Tinggi (HIGH)</option>
                <option value="URGENT">Mendesak (URGENT)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="task-duedate" className="flex items-center gap-1.5 text-xs font-semibold">
                <Calendar className="size-3.5 text-muted-foreground" />
                Tenggat Waktu
              </Label>
              <Input
                id="task-duedate"
                type="date"
                {...register('dueDate')}
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
  );
}
