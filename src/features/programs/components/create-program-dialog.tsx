'use client';

import React from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Briefcase, Loader2, Plus, Calendar as CalendarIcon } from 'lucide-react';
import { createProgramSchema, type CreateProgramDTO, type ProgramCluster } from '../types';
import { useCreateProgram } from '../api/use-mutations';
import { useSubunits } from '@/features/subunits/api/use-queries';
import { useUsers } from '@/features/users/api/use-queries';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';

interface CreateProgramDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultSubunitId?: string;
}

export function CreateProgramDialog({
  open,
  onOpenChange,
  defaultSubunitId,
}: CreateProgramDialogProps) {
  const createMutation = useCreateProgram();
  const { data: user } = useCurrentUser();
  const { data: subunits = [] } = useSubunits();
  const { data: users = [] } = useUsers();

  const activeUsers = users.filter((u) => u.status === 'ACTIVE');

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<CreateProgramDTO>({
    resolver: zodResolver(createProgramSchema),
    defaultValues: {
      title: '',
      description: '',
      scope: defaultSubunitId ? 'SUBUNIT' : 'SUBUNIT',
      subunitId: defaultSubunitId || '',
      cluster: 'UNIT_SHARED',
      primaryPicId: user?.id || '',
      startDate: '',
      endDate: '',
    },
  });

  const selectedScope = useWatch({ control, name: 'scope' });
  const selectedCluster = useWatch({ control, name: 'cluster' });
  const selectedSubunitId = useWatch({ control, name: 'subunitId' });
  const selectedPicId = useWatch({ control, name: 'primaryPicId' });
  const startDate = useWatch({ control, name: 'startDate' });
  const endDate = useWatch({ control, name: 'endDate' });

  const onSubmit = async (values: CreateProgramDTO) => {
    try {
      const payload: CreateProgramDTO = {
        ...values,
        subunitId: values.scope === 'SUBUNIT' ? values.subunitId : undefined,
      };
      await createMutation.mutateAsync(payload);
      reset();
      onOpenChange(false);
    } catch {
      // error handled in mutation
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary font-semibold">
            <Briefcase className="size-5" />
            <span>Program Kerja KKN</span>
          </div>
          <DialogTitle className="text-xl font-bold">
            Ajukan Program Kerja Baru
          </DialogTitle>
          <DialogDescription>
            Usulkan rencana program kerja tingkat unit atau subunit posko dusun.
            Program memerlukan persetujuan paralel dari Koordinator Klaster (Kormater) & Koordinator Subunit/Unit.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          {/* Judul Program */}
          <div className="space-y-1.5">
            <Label htmlFor="title">
              Judul Program Kerja <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              placeholder="Contoh: Digitalisasi UMKM Pengrajin Bambu Dusun Tirto"
              {...register('title')}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* Cakupan (Scope) & Subunit */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>
                Lingkup Pelaksanaan <span className="text-destructive">*</span>
              </Label>
              <Select
                value={selectedScope}
                onValueChange={(val: 'UNIT' | 'SUBUNIT') => setValue('scope', val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih lingkup" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SUBUNIT">Tingkat Subunit (Posko Dusun)</SelectItem>
                  <SelectItem value="UNIT">Tingkat Unit (Seluruh KKN)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedScope === 'SUBUNIT' ? (
              <div className="space-y-1.5">
                <Label>
                  Subunit Posko <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={selectedSubunitId || ''}
                  onValueChange={(val) => setValue('subunitId', val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih subunit posko" />
                  </SelectTrigger>
                  <SelectContent>
                    {subunits.map((sub) => (
                      <SelectItem key={sub.id} value={sub.id}>
                        {sub.name} {sub.location ? `(${sub.location})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.subunitId && (
                  <p className="text-xs text-destructive">{errors.subunitId.message}</p>
                )}
              </div>
            ) : (
              <div className="space-y-1.5">
                <Label className="text-muted-foreground">Posko Dusun</Label>
                <Input disabled value="Berlaku untuk seluruh unit KKN" className="bg-muted text-muted-foreground text-xs" />
              </div>
            )}
          </div>

          {/* Klaster & PIC Utama */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>
                Rumpun Klaster Keilmuan <span className="text-destructive">*</span>
              </Label>
              <Select
                value={selectedCluster}
                onValueChange={(val: ProgramCluster) => setValue('cluster', val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih klaster" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SAINTEK">🔵 Saintek (Sains & Teknologi)</SelectItem>
                  <SelectItem value="SOSHUM">🟢 Soshum (Sosial Humaniora)</SelectItem>
                  <SelectItem value="MEDIKA">🔴 Medika (Kesehatan)</SelectItem>
                  <SelectItem value="AGRO">🟡 Agro (Pertanian & Kehutanan)</SelectItem>
                  <SelectItem value="UNIT_SHARED">🟣 Lintas Klaster (Unit Shared)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>
                PIC Utama <span className="text-destructive">*</span>
              </Label>
              <Select
                value={selectedPicId || ''}
                onValueChange={(val) => setValue('primaryPicId', val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih penanggung jawab" />
                </SelectTrigger>
                <SelectContent>
                  {activeUsers.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name} {u.cluster ? `(${u.cluster})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.primaryPicId && (
                <p className="text-xs text-destructive">{errors.primaryPicId.message}</p>
              )}
            </div>
          </div>

          {/* Tanggal Pelaksanaan */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5">
                <CalendarIcon className="size-3.5 text-muted-foreground" />
                Tanggal Mulai
              </Label>
              <DatePicker
                value={startDate || undefined}
                onChange={(val) => setValue('startDate', val || '')}
                placeholder="Pilih tanggal mulai"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5">
                <CalendarIcon className="size-3.5 text-muted-foreground" />
                Target Selesai
              </Label>
              <DatePicker
                value={endDate || undefined}
                onChange={(val) => setValue('endDate', val || '')}
                placeholder="Pilih target selesai"
              />
            </div>
          </div>

          {/* Deskripsi */}
          <div className="space-y-1.5">
            <Label htmlFor="description">Deskripsi & Tujuan Program Kerja</Label>
            <Textarea
              id="description"
              rows={4}
              placeholder="Rincian latar belakang masalah di posko dusun, tujuan kegiatan, serta indikator keberhasilan..."
              {...register('description')}
            />
          </div>

          <DialogFooter className="pt-3">
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
                  Menyimpan...
                </>
              ) : (
                <>
                  <Plus className="size-4" />
                  Ajukan Program
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
