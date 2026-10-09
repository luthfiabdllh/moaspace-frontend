'use client';

import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Target, Loader2, Plus, Layers, Network } from 'lucide-react';
import { createEpicSchema, type CreateEpicDTO } from '../types';
import { useCreateEpic } from '../api/use-mutations';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { NotionEditor } from '@/components/ui/notion-editor';
import { DatePicker } from '@/components/ui/date-picker';

interface CreateEpicDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDivisionId?: string;
}

export function CreateEpicDialog({
  open,
  onOpenChange,
  defaultDivisionId,
}: CreateEpicDialogProps) {
  const createMutation = useCreateEpic();
  const { data: user } = useCurrentUser();
  const { data: divisions = [] } = useDivisions();

  const isGlobalAdmin = Boolean(user?.isSuperAdmin || user?.isKormanit);

  // User coordinator divisions
  const userCoordinatorDivisions = user?.divisions?.filter(
    (d) => d.role === 'COORDINATOR'
  ) ?? [];

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<CreateEpicDTO>({
    resolver: zodResolver(createEpicSchema),
    defaultValues: {
      title: '',
      description: '',
      prokerTag: '',
      startDate: '',
      endDate: '',
      scope: 'DIVISION',
      ownerDivisionId: defaultDivisionId || userCoordinatorDivisions[0]?.divisionId || '',
      participatingDivisionIds: [],
    },
  });

  const scope = useWatch({ control, name: 'scope' });
  const ownerDivisionId = useWatch({ control, name: 'ownerDivisionId' });
  const participatingIds = useWatch({ control, name: 'participatingDivisionIds' }) || [];
  const startDate = useWatch({ control, name: 'startDate' });
  const endDate = useWatch({ control, name: 'endDate' });
  const description = useWatch({ control, name: 'description' });

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

  const onSubmit = async (data: CreateEpicDTO) => {
    await createMutation.mutateAsync(data);
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Target className="size-4" />
            </div>
            <DialogTitle>Buat Epic Pekerjaan Baru</DialogTitle>
          </div>
          <DialogDescription>
            Epic adalah kumpulan pekerjaan besar atau inisiatif strategis yang mewadahi deliverable stories.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="epic-title">Judul Epic</Label>
            <Input
              id="epic-title"
              placeholder="Contoh: Digitalisasi UMKM Desa Moa 2026"
              {...register('title')}
              aria-invalid={!!errors.title}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* Scope Picker */}
          <div className="space-y-2">
            <Label>Cakupan Epic (Scope)</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setValue('scope', 'DIVISION')}
                className={`flex items-center gap-2 p-3 rounded-xl border text-left text-sm font-medium transition-colors ${
                  scope === 'DIVISION'
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border/80 bg-card hover:bg-muted/40 text-muted-foreground'
                }`}
              >
                <Layers className="size-4 shrink-0" />
                <div>
                  <div>Divisi Tertentu</div>
                  <div className="text-2xs font-normal opacity-80">
                    Dikelola 1 divisi kerja
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (isGlobalAdmin) setValue('scope', 'CROSS');
                }}
                disabled={!isGlobalAdmin}
                className={`flex items-center gap-2 p-3 rounded-xl border text-left text-sm font-medium transition-colors ${
                  scope === 'CROSS'
                    ? 'border-indigo-600 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                    : 'border-border/80 bg-card hover:bg-muted/40 text-muted-foreground'
                } ${!isGlobalAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={!isGlobalAdmin ? 'Hanya Super Admin & Kormanit' : ''}
              >
                <Network className="size-4 shrink-0" />
                <div>
                  <div>Lintas Divisi (Cross)</div>
                  <div className="text-2xs font-normal opacity-80">
                    {isGlobalAdmin ? 'Kolaborasi beberapa divisi' : 'Khusus Admin/Kormanit'}
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Division Selector if DIVISION scope */}
          {scope === 'DIVISION' && (
            <div className="space-y-2">
              <Label htmlFor="owner-division">Divisi Penanggung Jawab</Label>
              <Select
                value={ownerDivisionId || undefined}
                onValueChange={(v) => setValue('ownerDivisionId', v)}
              >
                <SelectTrigger id="owner-division" className="w-full text-sm">
                  <SelectValue placeholder="-- Pilih Divisi --" />
                </SelectTrigger>
                <SelectContent>
                  {divisions.map((div) => (
                    <SelectItem key={div.id} value={div.id}>
                      {div.name} (/{div.slug})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Participating Divisions if CROSS scope */}
          {scope === 'CROSS' && (
            <div className="space-y-2">
              <Label>Pilih Divisi yang Berpartisipasi</Label>
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
              <Label htmlFor="start-date" className="text-xs">
                Tanggal Mulai
              </Label>
              <DatePicker
                id="start-date"
                value={startDate}
                onChange={(v) => setValue('startDate', v || '')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date" className="text-xs">
                Tanggal Selesai
              </Label>
              <DatePicker
                id="end-date"
                value={endDate}
                onChange={(v) => setValue('endDate', v || '')}
              />
            </div>
          </div>

          {/* Proker Tag & Description */}
          <div className="space-y-2">
            <Label htmlFor="proker-tag">Tag Proker (Opsional)</Label>
            <Input
              id="proker-tag"
              placeholder="Contoh: PROKER-01 atau SOSMED-BRANDING"
              {...register('prokerTag')}
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="epic-description">Deskripsi Lengkap (Opsional)</Label>
              <span className="text-3xs text-muted-foreground font-normal">
                Ketik &apos;/&apos; untuk opsi format blok (Heading, Checklist, dll)
              </span>
            </div>
            <NotionEditor
              value={description || ''}
              onChange={(html) => setValue('description', html, { shouldDirty: true })}
              placeholder="Jelaskan tujuan akhir atau sasaran dari inisiatif ini... (Ketik '/' untuk format blok Notion)"
              minHeight="min-h-[140px]"
            />
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
            <Button type="submit" disabled={createMutation.isPending} className="gap-2">
              {createMutation.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Membuat...
                </>
              ) : (
                <>
                  <Plus className="size-4" />
                  Buat Epic
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
