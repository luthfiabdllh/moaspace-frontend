'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Target,
  ArrowLeft,
  Loader2,
  Plus,
  Calendar,
  Tag,
  Layers,
  Network,
  Sparkles,
} from 'lucide-react';
import { createEpicSchema, type CreateEpicDTO } from '../types';
import { useCreateEpic } from '../api/use-mutations';
import { useDivisions } from '@/features/divisions/api/use-queries';
import { useCurrentUser } from '@/features/auth/api/use-queries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { NotionEditor } from '@/components/ui/notion-editor';
import { DatePicker } from '@/components/ui/date-picker';
import { cn } from '@/lib/utils';

interface CreateEpicContentProps {
  defaultDivisionId?: string;
}

export function CreateEpicContent({ defaultDivisionId }: CreateEpicContentProps) {
  const router = useRouter();
  const createMutation = useCreateEpic();
  const { data: user } = useCurrentUser();
  const { data: divisions = [] } = useDivisions();

  const isGlobalAdmin = Boolean(user?.isSuperAdmin || user?.isKormanit);

  // User coordinator divisions
  const userCoordinatorDivisions =
    user?.divisions?.filter((d) => d.role === 'COORDINATOR') ?? [];

  const {
    register,
    handleSubmit,
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
        participatingIds.filter((id) => id !== divId),
        { shouldDirty: true }
      );
    } else {
      setValue('participatingDivisionIds', [...participatingIds, divId], {
        shouldDirty: true,
      });
    }
  };

  const onSubmit = async (data: CreateEpicDTO) => {
    const created = await createMutation.mutateAsync(data);
    if (created?.id) {
      router.push(`/epics/${created.id}`);
    } else {
      router.push('/epics');
    }
  };

  return (
    <div className="mx-auto space-y-6">
      {/* Top Navigation / Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link
          href="/epics"
          className="hover:text-foreground transition-colors inline-flex items-center gap-1.5 font-medium -ml-1 py-1 px-2 rounded-lg hover:bg-muted/40"
        >
          <ArrowLeft className="size-3.5" />
          <span>Inisiatif &amp; Epic</span>
        </Link>
        <span className="text-muted-foreground/40">/</span>
        <span className="text-foreground font-semibold">Buat Inisiatif Baru</span>
      </div>

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary shadow-2xs">
              <Target className="size-5" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              Inisiatif Strategis
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Buat Inisiatif &amp; Epic Baru
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed">
            Epic adalah payung program kerja besar yang menaungi rangkaian deliverable stories dan task kolaborasi tim.
          </p>
        </div>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="rounded-2xl shadow-2xs border-border/80 bg-card">
          <CardHeader className="pb-4 border-b border-border/40">
            <CardTitle className="text-base font-semibold">1. Rincian Utama Inisiatif</CardTitle>
            <CardDescription className="text-xs">
              Tentukan judul, cakupan divisi, dan program kerja yang menaungi inisiatif ini.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Judul Epic */}
            <div className="space-y-2">
              <Label htmlFor="epic-title" className="text-xs font-semibold">
                Judul Inisiatif / Epic <span className="text-destructive">*</span>
              </Label>
              <Input
                id="epic-title"
                placeholder="Contoh: Digitalisasi UMKM Desa Moa 2026 atau Kampanye Sosmed Q3"
                className="text-sm font-medium"
                {...register('title')}
                aria-invalid={!!errors.title}
              />
              {errors.title && (
                <p className="text-xs text-destructive">{errors.title.message}</p>
              )}
            </div>

            {/* Scope Picker */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Cakupan Inisiatif (Scope)</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setValue('scope', 'DIVISION', { shouldDirty: true })}
                  className={cn(
                    'flex items-start gap-3 p-4 rounded-xl border text-left transition-all duration-150',
                    scope === 'DIVISION'
                      ? 'border-primary bg-primary/5 text-primary shadow-2xs ring-1 ring-primary/30'
                      : 'border-border/80 bg-card hover:bg-muted/30 text-muted-foreground'
                  )}
                >
                  <div className={cn(
                    'p-2 rounded-lg shrink-0 mt-0.5',
                    scope === 'DIVISION' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  )}>
                    <Layers className="size-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">Internal Divisi Tertentu</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Dikelola khusus oleh satu divisi penanggung jawab.
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (isGlobalAdmin) setValue('scope', 'CROSS', { shouldDirty: true });
                  }}
                  disabled={!isGlobalAdmin}
                  className={cn(
                    'flex items-start gap-3 p-4 rounded-xl border text-left transition-all duration-150',
                    scope === 'CROSS'
                      ? 'border-indigo-600 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-2xs ring-1 ring-indigo-500/30'
                      : 'border-border/80 bg-card hover:bg-muted/30 text-muted-foreground',
                    !isGlobalAdmin && 'opacity-60 cursor-not-allowed'
                  )}
                  title={!isGlobalAdmin ? 'Khusus Super Admin & Kormanit' : ''}
                >
                  <div className={cn(
                    'p-2 rounded-lg shrink-0 mt-0.5',
                    scope === 'CROSS' ? 'bg-indigo-600 text-white' : 'bg-muted text-muted-foreground'
                  )}>
                    <Network className="size-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                      Lintas Divisi (Cross)
                      {!isGlobalAdmin && (
                        <Badge variant="outline" className="text-3xs py-0">Admin/Kormanit</Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Kolaborasi beberapa divisi kerja sekaligus untuk program gabungan.
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Division Selector if DIVISION scope */}
            {scope === 'DIVISION' && (
              <div className="space-y-2 p-4 rounded-xl border border-border/80 bg-muted/20">
                <Label htmlFor="owner-division" className="text-xs font-semibold flex items-center gap-1.5">
                  <Layers className="size-3.5 text-primary" />
                  Divisi Penanggung Jawab <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={ownerDivisionId || undefined}
                  onValueChange={(v) => setValue('ownerDivisionId', v)}
                >
                  <SelectTrigger id="owner-division" className="w-full text-sm">
                    <SelectValue placeholder="-- Pilih Divisi Penanggung Jawab --" />
                  </SelectTrigger>
                  <SelectContent>
                    {divisions.map((div) => (
                      <SelectItem key={div.id} value={div.id}>
                        {div.name} (/{div.slug})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-2xs text-muted-foreground">
                  Inisiatif ini akan dikelompokkan dan ditampilkan di bawah divisi penanggung jawab tersebut.
                </p>
              </div>
            )}

            {/* Participating Divisions if CROSS scope */}
            {scope === 'CROSS' && (
              <div className="space-y-2.5 p-4 rounded-xl border border-border/80 bg-muted/20">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold flex items-center gap-1.5">
                    <Network className="size-3.5 text-indigo-500" />
                    Pilih Divisi yang Berpartisipasi
                  </Label>
                  <span className="text-3xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
                    {participatingIds.length} divisi dipilih
                  </span>
                </div>
                <p className="text-2xs text-muted-foreground">
                  Centang divisi apa saja yang terlibat dan memiliki stories/task dalam inisiatif ini.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 max-h-56 overflow-y-auto">
                  {divisions.map((div) => {
                    const isChecked = participatingIds.includes(div.id);
                    return (
                      <label
                        key={div.id}
                        className={cn(
                          'flex items-center gap-2.5 text-xs font-medium cursor-pointer p-2.5 rounded-lg border transition-colors',
                          isChecked
                            ? 'bg-primary/10 border-primary/30 text-foreground'
                            : 'bg-card border-border/60 hover:bg-muted/40 text-muted-foreground'
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleParticipatingDivision(div.id)}
                          className="size-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <span className="truncate">{div.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Dates & Proker Tag */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="start-date" className="text-xs font-semibold flex items-center gap-1.5">
                  <Calendar className="size-3.5 text-muted-foreground" />
                  Tanggal Mulai
                </Label>
                <DatePicker
                  id="start-date"
                  className="text-xs h-9"
                  value={startDate}
                  onChange={(v) => setValue('startDate', v || '')}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="end-date" className="text-xs font-semibold flex items-center gap-1.5">
                  <Calendar className="size-3.5 text-muted-foreground" />
                  Target Selesai
                </Label>
                <DatePicker
                  id="end-date"
                  className="text-xs h-9"
                  value={endDate}
                  onChange={(v) => setValue('endDate', v || '')}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="proker-tag" className="text-xs font-semibold flex items-center gap-1.5">
                  <Tag className="size-3.5 text-muted-foreground" />
                  Tag Proker (Opsional)
                </Label>
                <Input
                  id="proker-tag"
                  placeholder="Misal: PROKER-01"
                  className="text-xs h-9 font-mono"
                  {...register('prokerTag')}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notion Editor Description Card */}
        <Card className="rounded-2xl shadow-2xs border-border/80 bg-card">
          <CardHeader className="pb-3 border-b border-border/40">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Sparkles className="size-4 text-primary" />
                  2. Deskripsi &amp; Sasaran Inisiatif (Notion-like)
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Uraikan sasaran strategis, latar belakang, KPI, atau daftar rencana dengan format rich-text.
                </CardDescription>
              </div>
              <span className="text-3xs text-muted-foreground font-mono bg-muted/60 px-2.5 py-1 rounded-lg border border-border/40 self-start sm:self-auto">
                Ketik &apos;/&apos; untuk perintah blok
              </span>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <NotionEditor
              value={description || ''}
              onChange={(html) => setValue('description', html, { shouldDirty: true })}
              placeholder="Tuliskan tujuan akhir, latar belakang inisiatif, atau matriks keberhasilan... (Ketik '/' untuk opsi blok seperti heading, checklist, tabel, dan callout)"
              minHeight="min-h-[220px]"
            />
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link href="/epics">
            <Button
              type="button"
              variant="outline"
              disabled={createMutation.isPending}
              className="rounded-xl h-10 px-5"
            >
              Batal
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={createMutation.isPending}
            className="rounded-xl h-10 px-6 gap-2 shadow-xs min-w-36 font-semibold"
          >
            {createMutation.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Membuat Inisiatif...
              </>
            ) : (
              <>
                <Plus className="size-4" />
                Buat Inisiatif
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
