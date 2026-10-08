'use client';

import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Layers, Loader2, Save } from 'lucide-react';
import {
  createDivisionSchema,
  type CreateDivisionDTO,
  type DivisionItem,
} from '../types';
import { useCreateDivision, useUpdateDivision } from '../api/use-mutations';
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

interface DivisionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  divisionToEdit?: DivisionItem | null;
}

export function DivisionDialog({
  open,
  onOpenChange,
  divisionToEdit,
}: DivisionDialogProps) {
  const isEditing = Boolean(divisionToEdit);
  const createMutation = useCreateDivision();
  const updateMutation = useUpdateDivision();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<CreateDivisionDTO>({
    resolver: zodResolver(createDivisionSchema),
    defaultValues: {
      name: '',
      slug: '',
      requestApprovalEnabled: false,
    },
  });

  const requestApproval = useWatch({ control, name: 'requestApprovalEnabled' });

  useEffect(() => {
    if (divisionToEdit) {
      reset({
        name: divisionToEdit.name,
        slug: divisionToEdit.slug,
        requestApprovalEnabled: divisionToEdit.requestApprovalEnabled,
      });
    } else {
      reset({
        name: '',
        slug: '',
        requestApprovalEnabled: false,
      });
    }
  }, [divisionToEdit, reset, open]);

  const onSubmit = async (data: CreateDivisionDTO) => {
    if (isEditing && divisionToEdit) {
      await updateMutation.mutateAsync({
        id: divisionToEdit.id,
        dto: data,
      });
    } else {
      await createMutation.mutateAsync(data);
    }
    onOpenChange(false);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Layers className="size-4" />
            </div>
            <DialogTitle>
              {isEditing ? 'Ubah Informasi Divisi' : 'Tambah Divisi KKN Baru'}
            </DialogTitle>
          </div>
          <DialogDescription>
            {isEditing
              ? 'Perbarui nama divisi, URL slug, atau pengaturan persetujuan request.'
              : 'Daftarkan divisi kerja baru untuk pengelolaan program kerja KKN.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="division-name">Nama Divisi</Label>
            <Input
              id="division-name"
              placeholder="Contoh: Media Kreatif"
              {...register('name')}
              aria-invalid={!!errors.name}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="division-slug">Slug URL (Opsional)</Label>
            <Input
              id="division-slug"
              placeholder="Contoh: media-kreatif"
              {...register('slug')}
              aria-invalid={!!errors.slug}
            />
            {errors.slug ? (
              <p className="text-xs text-destructive">{errors.slug.message}</p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Jika dikosongkan, slug akan otomatis dibuat dari nama divisi.
              </p>
            )}
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg border border-border/80 bg-muted/30">
            <input
              type="checkbox"
              id="approval-toggle"
              checked={requestApproval}
              onChange={(e) => setValue('requestApprovalEnabled', e.target.checked)}
              className="mt-1 size-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
            />
            <div className="space-y-1">
              <Label htmlFor="approval-toggle" className="font-medium cursor-pointer">
                Wajibkan Approval Request Pekerjaan
              </Label>
              <p className="text-xs text-muted-foreground">
                Jika diaktifkan, seluruh permintaan bantuan kerja ke divisi ini harus disetujui oleh Koordinator Divisi sebelum masuk ke backlog.
              </p>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isPending} className="gap-2">
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="size-4" />
                  {isEditing ? 'Simpan Perubahan' : 'Buat Divisi'}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
