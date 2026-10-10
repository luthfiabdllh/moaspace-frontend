'use client';

import React from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Edit, Loader2, Save, Calendar as CalendarIcon } from 'lucide-react';
import {
  updateProgramSchema,
  type UpdateProgramDTO,
  type ProgramItem,
  type ProgramCluster,
  type ProgramStatus,
} from '../types';
import { useUpdateProgram } from '../api/use-mutations';
import { useSubunits } from '@/features/subunits/api/use-queries';
import { useUsers } from '@/features/users/api/use-queries';
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

interface EditProgramDialogProps {
  program: ProgramItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function EditProgramForm({
  program,
  onClose,
}: {
  program: ProgramItem;
  onClose: () => void;
}) {
  const updateMutation = useUpdateProgram();
  const { data: subunits = [] } = useSubunits();
  const { data: users = [] } = useUsers();

  const activeUsers = users.filter((u) => u.status === 'ACTIVE');

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<UpdateProgramDTO>({
    resolver: zodResolver(updateProgramSchema),
    defaultValues: {
      title: program.title,
      description: program.description || '',
      scope: program.scope,
      subunitId: program.subunitId || '',
      cluster: program.cluster,
      primaryPicId: program.primaryPicId,
      status: program.status,
      startDate: program.startDate || '',
      endDate: program.endDate || '',
    },
  });

  const selectedScope = useWatch({ control, name: 'scope' });
  const selectedCluster = useWatch({ control, name: 'cluster' });
  const selectedSubunitId = useWatch({ control, name: 'subunitId' });
  const selectedPicId = useWatch({ control, name: 'primaryPicId' });
  const selectedStatus = useWatch({ control, name: 'status' });
  const startDate = useWatch({ control, name: 'startDate' });
  const endDate = useWatch({ control, name: 'endDate' });

  const onSubmit = async (values: UpdateProgramDTO) => {
    try {
      const payload: UpdateProgramDTO = {
        ...values,
        subunitId: values.scope === 'SUBUNIT' ? values.subunitId : undefined,
      };
      await updateMutation.mutateAsync({ id: program.id, payload });
      onClose();
    } catch {
      // error handled in mutation
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
      <div className="space-y-1.5">
        <Label htmlFor="title">
          Judul Program Kerja <span className="text-destructive">*</span>
        </Label>
        <Input id="title" {...register('title')} />
        {errors.title && (
          <p className="text-xs text-destructive">{errors.title.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Lingkup Pelaksanaan</Label>
          <Select
            value={selectedScope}
            onValueChange={(val: 'UNIT' | 'SUBUNIT') => setValue('scope', val)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SUBUNIT">Tingkat Subunit (Posko Dusun)</SelectItem>
              <SelectItem value="UNIT">Tingkat Unit (Seluruh KKN)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {selectedScope === 'SUBUNIT' ? (
          <div className="space-y-1.5">
            <Label>Subunit Posko</Label>
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
                    {sub.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <div className="space-y-1.5">
            <Label className="text-muted-foreground">Posko Dusun</Label>
            <Input disabled value="Berlaku untuk seluruh unit KKN" className="bg-muted text-muted-foreground text-xs" />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label>Rumpun Klaster</Label>
          <Select
            value={selectedCluster}
            onValueChange={(val: ProgramCluster) => setValue('cluster', val)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SAINTEK">🔵 Saintek</SelectItem>
              <SelectItem value="SOSHUM">🟢 Soshum</SelectItem>
              <SelectItem value="MEDIKA">🔴 Medika</SelectItem>
              <SelectItem value="AGRO">🟡 Agro</SelectItem>
              <SelectItem value="UNIT_SHARED">🟣 Lintas Klaster</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>PIC Utama</Label>
          <Select
            value={selectedPicId || undefined}
            onValueChange={(val) => setValue('primaryPicId', val)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {activeUsers.map((u) => {
                const metaParts: string[] = [];
                if (u.cluster) metaParts.push(u.cluster);
                if (u.subunit?.name) metaParts.push(u.subunit.name);
                const metaText = metaParts.length > 0 ? ` (${metaParts.join(' • ')})` : '';
                return (
                  <SelectItem key={u.id} value={u.id}>
                    {u.name}{metaText}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Status Siklus</Label>
          <Select
            value={selectedStatus}
            onValueChange={(val: ProgramStatus) => setValue('status', val)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PROPOSED">Usulan (Proposed)</SelectItem>
              <SelectItem value="ACTIVE">Aktif (Active)</SelectItem>
              <SelectItem value="COMPLETED">Selesai (Completed)</SelectItem>
              <SelectItem value="CANCELLED">Dibatalkan</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

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

      <div className="space-y-1.5">
        <Label htmlFor="edit-description">Deskripsi</Label>
        <Textarea
          id="edit-description"
          rows={4}
          {...register('description')}
        />
      </div>

      <DialogFooter className="pt-3">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
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
            <>
              <Save className="size-4" />
              Simpan Perubahan
            </>
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function EditProgramDialog({
  program,
  open,
  onOpenChange,
}: EditProgramDialogProps) {
  if (!program) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary font-semibold">
            <Edit className="size-5" />
            <span>Edit Program Kerja</span>
          </div>
          <DialogTitle className="text-xl font-bold">
            Perbarui Informasi Program
          </DialogTitle>
          <DialogDescription>
            Ubah deskripsi, jadwal, penanggung jawab, atau status eksekusi program kerja.
          </DialogDescription>
        </DialogHeader>

        <EditProgramForm
          key={program.id}
          program={program}
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
