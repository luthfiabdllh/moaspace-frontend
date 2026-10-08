'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FileEdit, Loader2, Calendar, Tag, Layers, Network } from 'lucide-react';
import { updateEpicSchema, type UpdateEpicDTO, type EpicItem } from '../types';
import { useUpdateEpic } from '../api/use-mutations';
import { useDivisions } from '@/features/divisions/api/use-queries';
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

interface EditEpicDialogProps {
  epic: EpicItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditEpicDialog({ epic, open, onOpenChange }: EditEpicDialogProps) {
  const updateMutation = useUpdateEpic();
  const { data: divisions = [] } = useDivisions();

  const buildDefaults = (): UpdateEpicDTO => ({
    title: epic.title,
    startDate: epic.startDate ? epic.startDate.split('T')[0] : '',
    endDate: epic.endDate ? epic.endDate.split('T')[0] : '',
    prokerTag: epic.prokerTag || '',
    ownerDivisionId: epic.ownerDivisionId || undefined,
    participatingDivisionIds: epic.participatingDivisions.map((p) => p.id),
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<UpdateEpicDTO>({
    resolver: zodResolver(updateEpicSchema),
    defaultValues: buildDefaults(),
  });

  // Re-sync the form whenever a different epic is opened for editing.
  useEffect(() => {
    if (open) {
      reset(buildDefaults());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, epic.id]);

  const isCross = epic.scope === 'CROSS';
  const participatingIds = watch('participatingDivisionIds') || [];

  const toggleParticipatingDivision = (divId: string) => {
    if (participatingIds.includes(divId)) {
      setValue(
        'participatingDivisionIds',
        participatingIds.filter((id) => id !== divId)
      );
    } else {
      setValue('participatingDivisionIds', [...participatingIds, divId]);
    }
  };

  const onSubmit = async (data: UpdateEpicDTO) => {
    try {
      await updateMutation.mutateAsync({
        id: epic.id,
        dto: {
          ...data,
          startDate: data.startDate || undefined,
          endDate: data.endDate || undefined,
          prokerTag: data.prokerTag || undefined,
          participatingDivisionIds: isCross ? data.participatingDivisionIds : undefined,
        },
      });
      onOpenChange(false);
    } catch {
      // handled in mutation onError
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <FileEdit className="size-4" />
            </div>
            <DialogTitle>Edit Inisiatif / Epic</DialogTitle>
          </div>
          <DialogDescription>
            Perbarui judul, periode pelaksanaan, atau rincian lain dari &quot;{epic.title}&quot;.
            Cakupan (scope) epic tidak dapat diubah setelah dibuat.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="edit-epic-title">Judul Epic</Label>
            <Input id="edit-epic-title" {...register('title')} aria-invalid={!!errors.title} />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* Scope (read-only indicator) */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Cakupan (Tidak dapat diubah)</Label>
            <div className="flex items-center gap-2 p-3 rounded-xl border border-border/80 bg-muted/30 text-sm font-medium text-muted-foreground">
              {isCross ? (
                <>
                  <Network className="size-4 shrink-0" />
                  Lintas Divisi (Cross)
                </>
              ) : (
                <>
                  <Layers className="size-4 shrink-0" />
                  Divisi Tertentu
                </>
              )}
            </div>
          </div>

          {/* Division Selector if DIVISION scope */}
          {!isCross && (
            <div className="space-y-2">
              <Label htmlFor="edit-owner-division">Divisi Penanggung Jawab</Label>
              <select
                id="edit-owner-division"
                {...register('ownerDivisionId')}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {divisions.map((div) => (
                  <option key={div.id} value={div.id}>
                    {div.name} (/{div.slug})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Participating Divisions if CROSS scope */}
          {isCross && (
            <div className="space-y-2">
              <Label>Divisi yang Berpartisipasi</Label>
              <div className="grid grid-cols-2 gap-2 p-3 rounded-xl border border-border/80 bg-muted/20">
                {divisions.map((div) => {
                  const isChecked = participatingIds.includes(div.id);
                  return (
                    <label
                      key={div.id}
                      className="flex items-center gap-2 text-xs font-medium cursor-pointer p-1.5 rounded-lg hover:bg-muted/50"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleParticipatingDivision(div.id)}
                        className="size-3.5 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="truncate">{div.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="edit-start-date" className="flex items-center gap-1.5 text-xs">
                <Calendar className="size-3.5 text-muted-foreground" />
                Tanggal Mulai
              </Label>
              <DatePicker
                id="edit-start-date"
                value={watch('startDate')}
                onChange={(v) => setValue('startDate', v || '')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-end-date" className="flex items-center gap-1.5 text-xs">
                <Calendar className="size-3.5 text-muted-foreground" />
                Tanggal Selesai
              </Label>
              <DatePicker
                id="edit-end-date"
                value={watch('endDate')}
                onChange={(v) => setValue('endDate', v || '')}
              />
            </div>
          </div>

          {/* Proker Tag */}
          <div className="space-y-2">
            <Label htmlFor="edit-proker-tag" className="flex items-center gap-1.5 text-xs">
              <Tag className="size-3.5 text-muted-foreground" />
              Tag Proker (Opsional)
            </Label>
            <Input
              id="edit-proker-tag"
              placeholder="Contoh: PROKER-01 atau SOSMED-BRANDING"
              {...register('prokerTag')}
            />
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
            <Button type="submit" disabled={updateMutation.isPending} className="gap-2">
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
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
