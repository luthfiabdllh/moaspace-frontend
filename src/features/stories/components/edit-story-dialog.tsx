'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FileEdit, Loader2, Calendar, Tag, Target, CheckSquare } from 'lucide-react';
import { updateStorySchema, type UpdateStoryDTO, type StoryItem } from '../types';
import { useUpdateStory } from '../api/use-mutations';
import { useEpics } from '@/features/epics/api/use-queries';
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

interface EditStoryDialogProps {
  story: StoryItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditStoryDialog({ story, open, onOpenChange }: EditStoryDialogProps) {
  const updateMutation = useUpdateStory();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<UpdateStoryDTO>({
    resolver: zodResolver(updateStorySchema),
    defaultValues: {
      epicId: story.epicId || 'NONE',
      title: story.title,
      doneCriteria: story.doneCriteria || '',
      targetDate: story.targetDate ? story.targetDate.split('T')[0] : '',
      prokerTag: story.prokerTag || '',
    },
  });

  // Re-sync the form whenever a different story is opened for editing.
  useEffect(() => {
    if (open) {
      reset({
        epicId: story.epicId || 'NONE',
        title: story.title,
        doneCriteria: story.doneCriteria || '',
        targetDate: story.targetDate ? story.targetDate.split('T')[0] : '',
        prokerTag: story.prokerTag || '',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, story.id]);

  const { data: epics = [] } = useEpics({ isClosed: false, divisionId: story.divisionId });

  const onSubmit = async (data: UpdateStoryDTO) => {
    try {
      await updateMutation.mutateAsync({
        id: story.id,
        dto: {
          ...data,
          epicId: data.epicId && data.epicId !== 'NONE' ? data.epicId : null,
          doneCriteria: data.doneCriteria || undefined,
          targetDate: data.targetDate
            ? new Date(data.targetDate).toISOString()
            : undefined,
          prokerTag: data.prokerTag || undefined,
        },
      });
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
            <FileEdit className="size-5 text-primary" />
            Edit Deliverable Story
          </DialogTitle>
          <DialogDescription>
            Perbarui judul, target tanggal, atau rincian lain dari story &quot;{story.title}&quot;.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          {/* Induk Epic (Opsional) */}
          <div className="space-y-1.5">
            <Label htmlFor="editEpicId" className="flex items-center gap-1.5 text-xs font-semibold">
              <Target className="size-3.5 text-muted-foreground" />
              Inisiatif / Induk Epic (Opsional)
            </Label>
            <select
              id="editEpicId"
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
          </div>

          {/* Judul Story */}
          <div className="space-y-1.5">
            <Label htmlFor="editStoryTitle" className="text-xs font-semibold">
              Judul Story <span className="text-destructive">*</span>
            </Label>
            <Input id="editStoryTitle" {...register('title')} className="text-xs" />
            {errors.title && (
              <p className="text-2xs text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* Definition of Done / Kriteria Selesai */}
          <div className="space-y-1.5">
            <Label htmlFor="editDoneCriteria" className="flex items-center gap-1.5 text-xs font-semibold">
              <CheckSquare className="size-3.5 text-muted-foreground" />
              Kriteria Selesai (Definition of Done)
            </Label>
            <textarea
              id="editDoneCriteria"
              rows={2}
              placeholder="Syarat agar story dianggap tuntas..."
              {...register('doneCriteria')}
              className="w-full rounded-md border border-input bg-background p-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            />
          </div>

          {/* Grid: Target Tanggal & Proker Tag */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="editTargetDate" className="flex items-center gap-1.5 text-xs font-semibold">
                <Calendar className="size-3.5 text-muted-foreground" />
                Target Tanggal
              </Label>
              <DatePicker
                id="editTargetDate"
                value={watch('targetDate')}
                onChange={(v) => setValue('targetDate', v || '')}
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="editProkerTag" className="flex items-center gap-1.5 text-xs font-semibold">
                <Tag className="size-3.5 text-muted-foreground" />
                Tag Program Kerja
              </Label>
              <Input
                id="editProkerTag"
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
              disabled={updateMutation.isPending}
            >
              Batal
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                'Simpan Perubahan'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
