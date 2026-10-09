'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  Target,
  ArrowLeft,
  Loader2,
  Network,
  Layers,
  Calendar,
  Tag,
  Sparkles,
} from 'lucide-react';
import { useRequest } from '../api/use-queries';
import { useConvertToEpic } from '../api/use-mutations';
import { useDivisions } from '@/features/divisions/api/use-queries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { NotionEditor } from '@/components/ui/notion-editor';
import { DatePicker } from '@/components/ui/date-picker';
import { cn } from '@/lib/utils';

interface ConvertToEpicContentProps {
  requestId: string;
}

export function ConvertToEpicContent({ requestId }: ConvertToEpicContentProps) {
  const router = useRouter();
  const { data: request, isLoading } = useRequest(requestId);
  const { data: divisions = [] } = useDivisions();
  const mutation = useConvertToEpic(requestId);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scope, setScope] = useState<'CROSS' | 'DIVISION'>('CROSS');
  const [participatingDivisionIds, setParticipatingDivisionIds] = useState<string[]>([]);
  const [prokerTag, setProkerTag] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [createInitialStory, setCreateInitialStory] = useState(true);

  // Adjusted during render (not in an effect) once the request loads — see
  // react-hooks/set-state-in-effect.
  const [prevRequestId, setPrevRequestId] = useState<string | undefined>(undefined);
  if (request && request.id !== prevRequestId) {
    setPrevRequestId(request.id);
    setTitle(request.title);
    setDescription(typeof request.brief?.deskripsi === 'string' ? request.brief.deskripsi : '');
    setParticipatingDivisionIds([request.fromDivisionId, request.toDivisionId]);
    setTargetDate(request.deadline ? request.deadline.split('T')[0] : '');
  }

  const toggleDivision = (divId: string) => {
    if (participatingDivisionIds.includes(divId)) {
      setParticipatingDivisionIds(participatingDivisionIds.filter((id) => id !== divId));
    } else {
      setParticipatingDivisionIds([...participatingDivisionIds, divId]);
    }
  };

  const handleSubmit = async () => {
    if (!request) return;

    if (scope === 'CROSS' && participatingDivisionIds.length < 2) {
      toast.error('Pilih minimal 2 divisi untuk inisiatif lintas divisi');
      return;
    }

    await mutation.mutateAsync({
      title: title.trim() || request.title,
      description: description.trim() || undefined,
      scope,
      participatingDivisionIds: scope === 'CROSS' ? participatingDivisionIds : undefined,
      prokerTag: prokerTag.trim() || undefined,
      targetDate: targetDate || undefined,
      createInitialStory,
    });
    router.push(`/requests/${requestId}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-4xl mx-auto py-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-64 bg-card border rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center space-y-3">
        <h2 className="text-xl font-bold">Request Tidak Ditemukan</h2>
        <p className="text-sm text-muted-foreground">
          Permohonan yang Anda cari mungkin telah dihapus atau Anda tidak memiliki akses.
        </p>
        <Link href="/requests">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Daftar
          </Button>
        </Link>
      </div>
    );
  }

  if (!request.permissions.canConvertToEpic) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center space-y-3">
        <h2 className="text-xl font-bold">Tidak Dapat Mengonversi</h2>
        <p className="text-sm text-muted-foreground">
          Permohonan ini tidak (lagi) dapat dijadikan Inisiatif / Epic, atau Anda tidak memiliki
          wewenang untuk melakukannya.
        </p>
        <Link href={`/requests/${requestId}`}>
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Request
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto space-y-6">
      {/* Top Navigation / Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link
          href={`/requests/${requestId}`}
          className="hover:text-foreground transition-colors inline-flex items-center gap-1.5 font-medium -ml-1 py-1 px-2 rounded-lg hover:bg-muted/40"
        >
          <ArrowLeft className="size-3.5" />
          <span>{request.title}</span>
        </Link>
        <span className="text-muted-foreground/40">/</span>
        <span className="text-foreground font-semibold">Jadikan Inisiatif / Epic</span>
      </div>

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-2xs">
              <Target className="size-5" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Jadikan Inisiatif / Epic
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Tingkatkan Permohonan Menjadi Inisiatif / Epic
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed">
            Tingkatkan permohonan kolaborasi &quot;{request.title}&quot; menjadi Inisiatif
            Strategis / Epic tingkat program kerja dengan tracking progres multi-story.
          </p>
        </div>
      </div>

      {/* Form Content */}
      <div className="space-y-6">
        <Card className="rounded-2xl shadow-2xs border-border/80 bg-card">
          <CardHeader className="pb-4 border-b border-border/40">
            <CardTitle className="text-base font-semibold">1. Rincian Utama Inisiatif</CardTitle>
            <CardDescription className="text-xs">
              Tentukan judul, cakupan divisi, dan program kerja yang menaungi inisiatif ini.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Scope Selector */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Tingkat Cakupan (Scope)</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setScope('CROSS')}
                  className={cn(
                    'flex items-start gap-3 p-4 rounded-xl border text-left transition-all duration-150',
                    scope === 'CROSS'
                      ? 'border-indigo-600 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-2xs ring-1 ring-indigo-500/30'
                      : 'border-border/80 bg-card hover:bg-muted/30 text-muted-foreground'
                  )}
                >
                  <div
                    className={cn(
                      'p-2 rounded-lg shrink-0 mt-0.5',
                      scope === 'CROSS' ? 'bg-indigo-600 text-white' : 'bg-muted text-muted-foreground'
                    )}
                  >
                    <Network className="size-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">
                      Lintas Divisi (Multi-divisi)
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Melibatkan kolaborasi beberapa divisi kerja sekaligus.
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setScope('DIVISION')}
                  className={cn(
                    'flex items-start gap-3 p-4 rounded-xl border text-left transition-all duration-150',
                    scope === 'DIVISION'
                      ? 'border-primary bg-primary/5 text-primary shadow-2xs ring-1 ring-primary/30'
                      : 'border-border/80 bg-card hover:bg-muted/30 text-muted-foreground'
                  )}
                >
                  <div
                    className={cn(
                      'p-2 rounded-lg shrink-0 mt-0.5',
                      scope === 'DIVISION' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                    )}
                  >
                    <Layers className="size-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">Internal Satu Divisi</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Hanya dikelola secara internal pada divisi yang dituju (
                      {request.toDivisionName}).
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* If DIVISION scope: explicit callout that it belongs only to the destination division */}
            {scope === 'DIVISION' && (
              <div className="p-3 rounded-xl border border-border/80 bg-muted/30 space-y-1 text-xs">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <Layers className="size-3.5 text-primary" />
                  Divisi Penanggung Jawab
                </span>
                <p className="text-muted-foreground text-2xs">
                  Inisiatif / Epic ini akan ditempatkan dan dikelola khusus pada divisi yang
                  dituju: <strong className="text-foreground">{request.toDivisionName}</strong>.
                </p>
              </div>
            )}

            {/* If CROSS scope: Checklist of participating divisions */}
            {scope === 'CROSS' && (
              <div className="space-y-2.5 p-4 rounded-xl border border-border/80 bg-muted/20">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold flex items-center gap-1.5">
                    <Network className="size-3.5 text-indigo-500" />
                    Daftar Divisi yang Berpartisipasi
                  </Label>
                  <span className="text-3xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
                    {participatingDivisionIds.length} divisi dipilih
                  </span>
                </div>
                <p className="text-2xs text-muted-foreground">
                  Centang divisi mana saja yang terlibat dalam inisiatif lintas divisi ini:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 max-h-56 overflow-y-auto">
                  {divisions.map((div) => {
                    const isChecked = participatingDivisionIds.includes(div.id);
                    const isTarget = div.id === request.toDivisionId;
                    const isOrigin = div.id === request.fromDivisionId;

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
                          onChange={() => toggleDivision(div.id)}
                          className="size-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <span className="truncate">
                          {div.name}
                          {isTarget && ' (Tujuan)'}
                          {isOrigin && ' (Pemohon)'}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Title */}
            <div className="space-y-1.5">
              <Label htmlFor="epicTitle" className="text-xs font-semibold">
                Judul Inisiatif / Epic
              </Label>
              <Input
                id="epicTitle"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-sm font-medium"
              />
            </div>

            {/* Dates & Proker Tag */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="epicTargetDate" className="text-xs font-semibold flex items-center gap-1.5">
                  <Calendar className="size-3.5 text-muted-foreground" />
                  Target Selesai
                </Label>
                <DatePicker
                  id="epicTargetDate"
                  className="text-xs h-9"
                  value={targetDate}
                  onChange={(v) => setTargetDate(v || '')}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="epicProkerTag" className="text-xs font-semibold flex items-center gap-1.5">
                  <Tag className="size-3.5 text-muted-foreground" />
                  Tag Proker (Opsional)
                </Label>
                <Input
                  id="epicProkerTag"
                  placeholder="Misal: EXPO, KKN"
                  className="text-xs h-9 font-mono"
                  value={prokerTag}
                  onChange={(e) => setProkerTag(e.target.value)}
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
                  Jelaskan tujuan dan sasaran besar inisiatif ini.
                </CardDescription>
              </div>
              <span className="text-3xs text-muted-foreground font-mono bg-muted/60 px-2.5 py-1 rounded-lg border border-border/40 self-start sm:self-auto">
                Ketik &apos;/&apos; untuk perintah blok
              </span>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <NotionEditor
              value={description}
              onChange={setDescription}
              placeholder="Jelaskan tujuan dan sasaran besar inisiatif ini... (Ketik '/' untuk opsi format blok)"
              minHeight="min-h-[180px]"
            />
          </CardContent>
        </Card>

        {/* Initial Story Checkbox */}
        <div className="flex items-center gap-2 px-1">
          <input
            type="checkbox"
            id="createInitialStoryCheck"
            checked={createInitialStory}
            onChange={(e) => setCreateInitialStory(e.target.checked)}
            className="size-4 rounded border-input text-primary focus:ring-primary"
          />
          <label
            htmlFor="createInitialStoryCheck"
            className="text-xs font-medium text-foreground cursor-pointer"
          >
            Buat Deliverable Story &amp; Task awal secara otomatis di Kanban
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link href={`/requests/${requestId}`}>
            <Button
              type="button"
              variant="outline"
              disabled={mutation.isPending}
              className="rounded-xl h-10 px-5"
            >
              Batal
            </Button>
          </Link>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={mutation.isPending}
            className="rounded-xl h-10 px-6 gap-2 shadow-xs min-w-44 font-semibold bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Mengonversi...
              </>
            ) : (
              <>
                <Target className="size-4" />
                Buat Inisiatif / Epic
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
