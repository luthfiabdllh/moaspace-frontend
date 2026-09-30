'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCurrentUser } from '@/features/auth/api/use-queries';
import { useDivisions } from '@/features/divisions/api/use-queries';
import { useDivisionTemplates } from '../api/use-queries';
import { useCreateRequest } from '../api/use-mutations';
import { DynamicFormRenderer } from './dynamic-form-renderer';
import { ArrowLeft, ArrowRight, Calendar, Layers, Send, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export function CreateRequestContent() {
  const router = useRouter();
  const { data: user } = useCurrentUser();
  const { data: divisions } = useDivisions();

  const [fromDivisionId, setFromDivisionId] = useState('');
  const [toDivisionId, setToDivisionId] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [title, setTitle] = useState('');
  const [deadline, setDeadline] = useState('');
  const [brief, setBrief] = useState<Record<string, any>>({});

  const { data: templates, isLoading: loadingTemplates } = useDivisionTemplates(toDivisionId);
  const createMutation = useCreateRequest();

  // Set default origin division to user's first division
  useEffect(() => {
    if (user?.divisions && user.divisions.length > 0 && !fromDivisionId) {
      setFromDivisionId(user.divisions[0].divisionId);
    }
  }, [user, fromDivisionId]);

  // When toDivisionId changes, reset templateId and brief
  const handleToDivisionChange = (newToDivId: string) => {
    setToDivisionId(newToDivId);
    setTemplateId('');
    setBrief({});
  };

  // When templateId changes, reset brief
  const handleTemplateChange = (newTmplId: string) => {
    setTemplateId(newTmplId);
    setBrief({});
  };

  const selectedTemplate = templates?.find((t) => t.id === templateId);

  // Available origin divisions (user's divisions, or all if super admin)
  const availableOriginDivisions =
    user?.isSuperAdmin || user?.isKormanit
      ? divisions || []
      : user?.divisions?.map((d) => ({ id: d.divisionId, name: d.divisionName })) || [];

  // Available destination divisions (exclude chosen origin division)
  const availableTargetDivisions =
    divisions?.filter((d) => d.id !== fromDivisionId) || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fromDivisionId) {
      toast.error('Pilih divisi asal pembuat request.');
      return;
    }
    if (!toDivisionId) {
      toast.error('Pilih divisi tujuan.');
      return;
    }
    if (!title.trim()) {
      toast.error('Judul permohonan wajib diisi.');
      return;
    }

    // Validate required fields in template
    if (selectedTemplate?.fields) {
      for (const f of selectedTemplate.fields) {
        if (f.required && (brief[f.key] === undefined || brief[f.key] === '')) {
          toast.error(`Field "${f.label}" wajib diisi.`);
          return;
        }
      }
    } else {
      if (!brief.deskripsi || !String(brief.deskripsi).trim()) {
        toast.error('Deskripsi brief permohonan wajib diisi.');
        return;
      }
    }

    try {
      await createMutation.mutateAsync({
        fromDivisionId,
        toDivisionId,
        templateId: templateId || undefined,
        title: title.trim(),
        brief,
        deadline: deadline || undefined,
      });

      router.push('/requests');
    } catch {
      // Error handled by mutation
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      {/* Back button */}
      <Link
        href="/requests"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Kembali ke Daftar Request
      </Link>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Layers className="h-6 w-6 text-primary" />
          Buat Request Antar Divisi
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Ajukan permohonan bantuan pengerjaan tugas kepada divisi lain menggunakan formulir terstruktur.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Routing Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                1
              </span>
              Pilih Divisi Asal &amp; Divisi Tujuan
            </CardTitle>
            <CardDescription className="text-xs">
              Tentukan divisi Anda sebagai pemohon dan divisi yang dituju untuk berkolaborasi.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="fromDivision" className="text-xs font-medium">
                Divisi Asal (Pemohon) <span className="text-destructive">*</span>
              </Label>
              <select
                id="fromDivision"
                value={fromDivisionId}
                onChange={(e) => {
                  setFromDivisionId(e.target.value);
                  if (toDivisionId === e.target.value) {
                    setToDivisionId('');
                  }
                }}
                className="h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:bg-zinc-900"
              >
                <option value="">Pilih Divisi Asal...</option>
                {availableOriginDivisions.map((div) => (
                  <option key={div.id} value={div.id}>
                    {div.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="toDivision" className="text-xs font-medium">
                Divisi Tujuan <span className="text-destructive">*</span>
              </Label>
              <select
                id="toDivision"
                value={toDivisionId}
                onChange={(e) => handleToDivisionChange(e.target.value)}
                disabled={!fromDivisionId}
                className="h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:bg-zinc-900 disabled:opacity-50"
              >
                <option value="">Pilih Divisi Tujuan...</option>
                {availableTargetDivisions.map((div) => (
                  <option key={div.id} value={div.id}>
                    {div.name}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Step 2: Template Selection Card (Active when toDivision selected) */}
        {toDivisionId && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                  2
                </span>
                Pilih Template Formulir Permohonan
              </CardTitle>
              <CardDescription className="text-xs">
                Divisi tujuan dapat menyediakan template formulir dengan format field spesifik.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {loadingTemplates ? (
                <div className="h-9 bg-muted animate-pulse rounded-lg" />
              ) : (
                <div className="space-y-1.5">
                  <Label htmlFor="templateSelect" className="text-xs font-medium">
                    Template Tersedia
                  </Label>
                  <select
                    id="templateSelect"
                    value={templateId}
                    onChange={(e) => handleTemplateChange(e.target.value)}
                    className="h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:bg-zinc-900"
                  >
                    <option value="">Formulir Umum (Tanpa Template Khusus)</option>
                    {templates?.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                  {selectedTemplate?.description && (
                    <p className="text-xs text-muted-foreground mt-1 bg-muted/30 p-2 rounded">
                      {selectedTemplate.description}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 3: Request Title, Deadline & Brief */}
        {toDivisionId && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                  3
                </span>
                Rincian Permohonan &amp; Brief
              </CardTitle>
              <CardDescription className="text-xs">
                Lengkapi judul, tenggat waktu (deadline), dan data brief kebutuhan kerja.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <Label htmlFor="reqTitle" className="text-xs font-medium">
                    Judul Permohonan <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="reqTitle"
                    placeholder="Contoh: Kebutuhan Poster dan Feed Expo KKN 2026"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="reqDeadline" className="text-xs font-medium">
                    Target Deadline (Opsional)
                  </Label>
                  <Input
                    id="reqDeadline"
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                  />
                </div>
              </div>

              {/* Dynamic form or General brief */}
              <div className="pt-2 border-t space-y-3">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {selectedTemplate ? `Brief Khusus: ${selectedTemplate.name}` : 'Brief Permohonan'}
                </Label>

                {selectedTemplate?.fields && selectedTemplate.fields.length > 0 ? (
                  <DynamicFormRenderer
                    fields={selectedTemplate.fields}
                    values={brief}
                    onChange={setBrief}
                  />
                ) : (
                  <div className="space-y-1.5">
                    <Label htmlFor="generalDeskripsi" className="text-xs font-medium">
                      Deskripsi Kebutuhan &amp; Spesifikasi <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="generalDeskripsi"
                      rows={5}
                      placeholder="Jelaskan secara mendetail apa yang dibutuhkan, konteks program kerja, referensi, dan ekspektasi hasil..."
                      value={brief.deskripsi || ''}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        setBrief({ ...brief, deskripsi: e.target.value })
                      }
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link href="/requests">
            <Button type="button" variant="outline">
              Batal
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={createMutation.isPending || !toDivisionId}
            className="gap-2"
          >
            <Send className="h-4 w-4" />
            {createMutation.isPending ? 'Mengajukan...' : 'Kirim Permohonan'}
          </Button>
        </div>
      </form>
    </div>
  );
}
