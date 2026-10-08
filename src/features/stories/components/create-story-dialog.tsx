'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Bookmark, Loader2, Calendar, Tag, Target, CheckSquare, Layers } from 'lucide-react';
import { createStorySchema, type CreateStoryDTO } from '../types';
import { useCreateStory } from '../api/use-mutations';
import { useEpics } from '@/features/epics/api/use-queries';
import { useDivisions } from '@/features/divisions/api/use-queries';
import { useCurrentUser } from '@/features/auth/api/use-queries';
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

interface CreateStoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDivisionId?: string;
  defaultEpicId?: string;
}

export function CreateStoryDialog({
  open,
  onOpenChange,
  defaultDivisionId,
  defaultEpicId,
}: CreateStoryDialogProps) {
  const createMutation = useCreateStory();
  const { data: user } = useCurrentUser();
  const { data: divisions = [] } = useDivisions();

  const isGlobalAdmin = Boolean(user?.isSuperAdmin || user?.isKormanit);
  const userDivisions = user?.divisions ?? [];

  // Filter divisions where user can create stories (coordinator of division or admin)
  const allowedDivisions = isGlobalAdmin
    ? divisions
    : divisions.filter((d) =>
        userDivisions.some(
          (ud) => ud.divisionId === d.id && ud.role === 'COORDINATOR'
        )
      );

  const initialDivisionId =
    defaultDivisionId ||
    (allowedDivisions.length > 0 ? allowedDivisions[0].id : '');

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateStoryDTO>({
    resolver: zodResolver(createStorySchema),
    defaultValues: {
      divisionId: initialDivisionId,
      epicId: defaultEpicId || '',
      title: '',
      doneCriteria: '',
      targetDate: '',
      prokerTag: '',
    },
  });

  const selectedDivisionId = watch('divisionId') || initialDivisionId;

  // Fetch epics available for this division (or cross)
  const { data: epics = [] } = useEpics({
    isClosed: false,
    divisionId: selectedDivisionId,
  });

  const onSubmit = async (data: CreateStoryDTO) => {
    try {
      await createMutation.mutateAsync({
        ...data,
        epicId: data.epicId && data.epicId !== 'NONE' ? data.epicId : undefined,
        doneCriteria: data.doneCriteria || undefined,
        targetDate: data.targetDate ? new Date(data.targetDate).toISOString() : undefined,
        prokerTag: data.prokerTag || undefined,
      });
      reset();
      onOpenChange(false);
    } catch {
      // handled in mutation onError
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bookmark className="size-5 text-primary" />
            Buat Deliverable Story Baru
          </DialogTitle>
          <DialogDescription>
            Story adalah unit deliverable divisi yang dapat dinaungi Epic atau berdiri sendiri sebagai pekerjaan rutin.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          {/* Divisi Penanggung Jawab */}
          <div className="space-y-1.5">
            <Label htmlFor="divisionId" className="flex items-center gap-1.5 text-xs font-semibold">
              <Layers className="size-3.5 text-muted-foreground" />
              Divisi Penanggung Jawab <span className="text-destructive">*</span>
            </Label>
            {defaultDivisionId ? (
              <Input
                disabled
                value={
                  divisions.find((d) => d.id === defaultDivisionId)?.name ||
                  defaultDivisionId
                }
                className="bg-muted text-muted-foreground text-xs"
              />
            ) : (
              <select
                id="divisionId"
                {...register('divisionId')}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {allowedDivisions.map((div) => (
                  <option key={div.id} value={div.id}>
                    {div.name}
                  </option>
                ))}
              </select>
            )}
            {errors.divisionId && (
              <p className="text-2xs text-destructive">{errors.divisionId.message}</p>
            )}
          </div>

          {/* Induk Epic (Opsional) */}
          <div className="space-y-1.5">
            <Label htmlFor="epicId" className="flex items-center gap-1.5 text-xs font-semibold">
              <Target className="size-3.5 text-muted-foreground" />
              Inisiatif / Induk Epic (Opsional)
            </Label>
            <select
              id="epicId"
              {...register('epicId')}
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="NONE">-- Tanpa Epic (Pekerjaan Rutin Divisi) --</option>
              {epics.map((epic) => (
                <option key={epic.id} value={epic.id}>
                  {epic.scope === 'CROSS' ? '[Lintas Divisi] ' : ''}
                  {epic.title}
                </option>
              ))}
            </select>
            <p className="text-2xs text-muted-foreground">
              Kosongkan jika story ini bukan bagian dari inisiatif besar.
            </p>
          </div>

          {/* Judul Story */}
          <div className="space-y-1.5">
            <Label htmlFor="title" className="text-xs font-semibold">
              Judul Story <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              placeholder="Contoh: Desain Banner Utama & Template Feed Instagram"
              {...register('title')}
              className="text-xs"
            />
            {errors.title && (
              <p className="text-2xs text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* Definition of Done / Kriteria Selesai */}
          <div className="space-y-1.5">
            <Label htmlFor="doneCriteria" className="flex items-center gap-1.5 text-xs font-semibold">
              <CheckSquare className="size-3.5 text-muted-foreground" />
              Kriteria Selesai (Definition of Done)
            </Label>
            <textarea
              id="doneCriteria"
              rows={2}
              placeholder="Syarat agar story dianggap tuntas (cth: Format PNG/SVG resolusi tinggi, disetujui koordinator)..."
              {...register('doneCriteria')}
              className="w-full rounded-md border border-input bg-background p-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            />
          </div>

          {/* Grid: Target Tanggal & Proker Tag */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="targetDate" className="flex items-center gap-1.5 text-xs font-semibold">
                <Calendar className="size-3.5 text-muted-foreground" />
                Target Tanggal
              </Label>
              <DatePicker
                id="targetDate"
                value={watch('targetDate')}
                onChange={(v) => setValue('targetDate', v || '')}
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="prokerTag" className="flex items-center gap-1.5 text-xs font-semibold">
                <Tag className="size-3.5 text-muted-foreground" />
                Tag Program Kerja
              </Label>
              <Input
                id="prokerTag"
                placeholder="cth: ig-feeds-2026"
                {...register('prokerTag')}
                className="text-xs font-mono"
              />
            </div>
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
                'Buat Story'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
