'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { NotionEditor } from '@/components/ui/notion-editor';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Stepper,
  StepperItem,
  StepperTrigger,
  StepperIndicator,
  StepperTitle,
  StepperDescription,
  StepperSeparator,
  type StepState,
} from '@/components/ui/stepper';
import { useCurrentUser } from '@/features/auth/api/use-queries';
import { useDivisions } from '@/features/divisions/api/use-queries';
import { useDivisionTemplates } from '../api/use-queries';
import { useUpdateDraft, useSubmitDraft } from '../api/use-mutations';
import { DynamicFormRenderer } from './dynamic-form-renderer';
import { RequestStatusBadge } from './request-status-badge';
import {
  ArrowLeft,
  ArrowRight,
  Send,
  Sparkles,
  FileText,
  Check,
  GitPullRequest,
  Calendar,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { RequestDetail } from '../types';

interface DraftRequestContentProps {
  request: RequestDetail;
}

export function DraftRequestContent({ request }: DraftRequestContentProps) {
  const { data: user } = useCurrentUser();
  const { data: divisions } = useDivisions();

  // Wizard state: 1 = Rute Divisi, 2 = Template, 3 = Rincian & Brief
  // Default to step 3 for existing drafts with divisions already set
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(
    request.fromDivisionId && request.toDivisionId ? 3 : 1
  );

  const [fromDivisionId, setFromDivisionId] = useState(request.fromDivisionId || '');
  const [toDivisionId, setToDivisionId] = useState(request.toDivisionId || '');
  const [templateId, setTemplateId] = useState(request.templateId || '');
  const [title, setTitle] = useState(request.title || '');
  const [deadline, setDeadline] = useState(
    request.deadline ? request.deadline.split('T')[0] : ''
  );
  const [brief, setBrief] = useState<Record<string, any>>(request.brief || {});

  const { data: templates, isLoading: loadingTemplates } =
    useDivisionTemplates(toDivisionId);

  const updateDraftMutation = useUpdateDraft(request.id);
  const submitDraftMutation = useSubmitDraft(request.id);

  // Sync state if request updates from server
  useEffect(() => {
    if (request) {
      setFromDivisionId(request.fromDivisionId || '');
      setToDivisionId(request.toDivisionId || '');
      setTemplateId(request.templateId || '');
      setTitle(request.title || '');
      setDeadline(request.deadline ? request.deadline.split('T')[0] : '');
      setBrief(request.brief || {});
    }
  }, [request.id]);

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

  // Available origin divisions (user's divisions, or all if super admin/kormanit)
  const availableOriginDivisions =
    user?.isSuperAdmin || user?.isKormanit
      ? divisions || []
      : user?.divisions?.map((d) => ({
          id: d.divisionId,
          name: d.divisionName,
        })) || [];

  // Available destination divisions (exclude chosen origin division)
  const availableTargetDivisions =
    divisions?.filter((d) => d.id !== fromDivisionId) || [];

  const fromDivisionName =
    divisions?.find((d) => d.id === fromDivisionId)?.name ||
    request.fromDivisionName ||
    'Pilih Divisi';
  const toDivisionName =
    divisions?.find((d) => d.id === toDivisionId)?.name ||
    request.toDivisionName ||
    'Pilih Divisi';

  // Navigation handlers
  const handleNextFromStep1 = () => {
    if (!fromDivisionId) {
      toast.error('Pilih divisi asal pemohon.');
      return;
    }
    if (!toDivisionId) {
      toast.error('Pilih divisi tujuan permohonan.');
      return;
    }
    setCurrentStep(2);
  };

  const handleNextFromStep2 = () => {
    setCurrentStep(3);
  };

  const handleStepClick = (stepIndex: 1 | 2 | 3) => {
    if (stepIndex === 1) {
      setCurrentStep(1);
      return;
    }
    if (stepIndex === 2) {
      if (!fromDivisionId || !toDivisionId) {
        toast.info('Lengkapi divisi asal dan tujuan terlebih dahulu.');
        return;
      }
      setCurrentStep(2);
      return;
    }
    if (stepIndex === 3) {
      if (!fromDivisionId || !toDivisionId) {
        toast.info('Lengkapi divisi asal dan tujuan terlebih dahulu.');
        return;
      }
      setCurrentStep(3);
    }
  };

  const handleSaveDraft = async () => {
    if (!fromDivisionId) {
      toast.error('Pilih divisi asal pembuat request.');
      setCurrentStep(1);
      return;
    }
    if (!toDivisionId) {
      toast.error('Pilih divisi tujuan.');
      setCurrentStep(1);
      return;
    }
    if (!title.trim()) {
      toast.error('Judul permohonan wajib diisi untuk menyimpan draft.');
      setCurrentStep(3);
      return;
    }

    try {
      await updateDraftMutation.mutateAsync({
        fromDivisionId,
        toDivisionId,
        templateId: templateId || undefined,
        title: title.trim(),
        brief,
        deadline: deadline || undefined,
      });
    } catch {
      // Error handled by mutation
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fromDivisionId) {
      toast.error('Pilih divisi asal pembuat request.');
      setCurrentStep(1);
      return;
    }
    if (!toDivisionId) {
      toast.error('Pilih divisi tujuan.');
      setCurrentStep(1);
      return;
    }
    if (!title.trim()) {
      toast.error('Judul permohonan wajib diisi.');
      setCurrentStep(3);
      return;
    }

    // Validate required fields in template
    if (selectedTemplate?.fields) {
      for (const f of selectedTemplate.fields) {
        if (f.required && (brief[f.key] === undefined || brief[f.key] === '')) {
          toast.error(`Field "${f.label}" wajib diisi.`);
          setCurrentStep(3);
          return;
        }
      }
    } else {
      const plainText = String(brief.deskripsi || '')
        .replace(/<[^>]*>/g, '')
        .trim();
      if (!plainText) {
        toast.error('Deskripsi brief permohonan wajib diisi.');
        setCurrentStep(3);
        return;
      }
    }

    try {
      // Save changes first
      await updateDraftMutation.mutateAsync({
        fromDivisionId,
        toDivisionId,
        templateId: templateId || undefined,
        title: title.trim(),
        brief,
        deadline: deadline || undefined,
      });

      // Then submit the draft
      await submitDraftMutation.mutateAsync();
    } catch {
      // Error handled by mutation
    }
  };

  const isSaving = updateDraftMutation.isPending;
  const isSubmitting = submitDraftMutation.isPending;
  const isBusy = isSaving || isSubmitting;

  // Stepper state calculation
  const step1State: StepState =
    currentStep === 1
      ? 'active'
      : fromDivisionId && toDivisionId
        ? 'completed'
        : 'active';

  const step2State: StepState =
    currentStep === 2
      ? 'active'
      : currentStep > 2 || templateId !== undefined
        ? 'completed'
        : 'upcoming';

  const step3State: StepState = currentStep === 3 ? 'active' : 'upcoming';

  const steps = [
    {
      step: 1 as const,
      title: 'Rute Divisi',
      desc:
        fromDivisionId && toDivisionId
          ? `${fromDivisionName} ➔ ${toDivisionName}`
          : 'Pilih divisi asal & tujuan',
      state: step1State,
    },
    {
      step: 2 as const,
      title: 'Format Template',
      desc: selectedTemplate ? selectedTemplate.name : 'Formulir Umum',
      state: step2State,
    },
    {
      step: 3 as const,
      title: 'Rincian & Brief',
      desc: title ? title : 'Isi formulir kebutuhan',
      state: step3State,
    },
  ];

  return (
    <div className="w-full min-w-0 space-y-6 pb-16">
      {/* Back button */}
      <div>
        <Link
          href="/requests"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <ArrowLeft className="size-3.5" />
          <span>Kembali ke Daftar Request</span>
        </Link>
      </div>

      {/* Header title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-2xs shrink-0">
            <GitPullRequest className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Draft Permohonan: {title || 'Tanpa Judul'}
              </h1>
              <RequestStatusBadge status="DRAFT" />
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Lengkapi atau sesuaikan formulir bertahap rute divisi, format template, dan brief kebutuhan sebelum diajukan resmi.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Form Stepper Header */}
      <Card className="border-border/80 shadow-xs overflow-hidden">
        <CardContent className="p-4 sm:p-5">
          <div className="overflow-x-auto pb-1 -mx-2 px-2 sm:mx-0 sm:px-0">
            <Stepper className="min-w-140 sm:min-w-0 max-w-4xl mx-auto">
              {steps.map((st, index) => {
                const isLast = index === steps.length - 1;
                return (
                  <React.Fragment key={st.step}>
                    <StepperItem step={st.step} state={st.state}>
                      <StepperTrigger
                        onClick={() => handleStepClick(st.step)}
                        title={`Lompat ke Tahap ${st.step}: ${st.title}`}
                        className="cursor-pointer hover:bg-muted/40"
                      >
                        <StepperIndicator
                          state={st.state}
                          stepNumber={st.step}
                        />
                        <div className="flex flex-col text-left min-w-0">
                          <StepperTitle
                            className={cn(
                              st.state === 'active' && 'text-primary font-bold'
                            )}
                          >
                            {st.title}
                          </StepperTitle>
                          <StepperDescription className="max-w-40 truncate">
                            {st.desc}
                          </StepperDescription>
                        </div>
                      </StepperTrigger>
                    </StepperItem>
                    {!isLast && <StepperSeparator state={st.state} />}
                  </React.Fragment>
                );
              })}
            </Stepper>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ─── TAHAP 1: RUTE DIVISI ────────────────────────────────────────── */}
        {currentStep === 1 && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                    1
                  </span>
                  Pilih Divisi Asal (Pemohon) &amp; Divisi Tujuan
                </CardTitle>
                <Badge variant="outline" className="text-3xs font-mono">
                  Langkah 1 dari 3
                </Badge>
              </div>
              <CardDescription className="text-xs">
                Tentukan divisi Anda sebagai pemohon dan divisi yang dituju untuk berkolaborasi.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="draftFromDivision" className="text-xs font-medium">
                    Divisi Asal (Pemohon) <span className="text-destructive">*</span>
                  </Label>
                  <select
                    id="draftFromDivision"
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
                  <Label htmlFor="draftToDivision" className="text-xs font-medium">
                    Divisi Tujuan <span className="text-destructive">*</span>
                  </Label>
                  <select
                    id="draftToDivision"
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
              </div>

              {fromDivisionId && toDivisionId && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20 text-xs">
                  <Sparkles className="size-4 text-primary shrink-0" />
                  <span className="text-muted-foreground">
                    Rute kolaborasi:{' '}
                    <strong className="text-foreground">{fromDivisionName}</strong>{' '}
                    akan mengajukan permohonan ke{' '}
                    <strong className="text-foreground">{toDivisionName}</strong>.
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t">
                <Link href="/requests">
                  <Button type="button" variant="outline" size="sm">
                    Kembali ke Daftar
                  </Button>
                </Link>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handleSaveDraft}
                    disabled={isBusy || !toDivisionId}
                    className="gap-1.5"
                  >
                    <FileText className="h-4 w-4" />
                    Simpan Perubahan
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleNextFromStep1}
                    disabled={!fromDivisionId || !toDivisionId}
                    className="gap-2"
                  >
                    Lanjut ke Pilih Template
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ─── TAHAP 2: TEMPLATE PERMOHONAN ─────────────────────────────────── */}
        {currentStep === 2 && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                    2
                  </span>
                  Pilih Format Template Formulir
                </CardTitle>
                <Badge variant="outline" className="text-3xs font-mono">
                  Langkah 2 dari 3
                </Badge>
              </div>
              <CardDescription className="text-xs">
                Pilih format formulir umum atau gunakan template khusus yang telah disediakan oleh divisi {toDivisionName}.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingTemplates ? (
                <div className="space-y-2">
                  <div className="h-16 bg-muted animate-pulse rounded-lg" />
                  <div className="h-16 bg-muted animate-pulse rounded-lg" />
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2.5">
                  {/* Option 1: Formulir Umum */}
                  <div
                    onClick={() => handleTemplateChange('')}
                    className={cn(
                      'flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer select-none',
                      templateId === ''
                        ? 'border-primary bg-primary/5 ring-2 ring-primary/20 shadow-xs'
                        : 'border-border/80 bg-background hover:bg-muted/40'
                    )}
                  >
                    <div
                      className={cn(
                        'flex size-5 shrink-0 items-center justify-center rounded-full border mt-0.5',
                        templateId === ''
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-muted-foreground/40'
                      )}
                    >
                      {templateId === '' && (
                        <Check className="size-3 stroke-3" />
                      )}
                    </div>
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-foreground">
                          Formulir Umum
                        </span>
                        <Badge
                          variant="secondary"
                          className="text-3xs font-normal"
                        >
                          Bebas Deskripsi
                        </Badge>
                      </div>
                      <p className="text-2xs text-muted-foreground">
                        Cocok untuk kebutuhan permohonan umum tanpa spesifikasi field dinamis khusus.
                      </p>
                    </div>
                  </div>

                  {/* Option 2+: Divisi Templates */}
                  {templates && templates.length > 0 ? (
                    templates.map((t) => {
                      const isSelected = templateId === t.id;
                      return (
                        <div
                          key={t.id}
                          onClick={() => handleTemplateChange(t.id)}
                          className={cn(
                            'flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer select-none',
                            isSelected
                              ? 'border-primary bg-primary/5 ring-2 ring-primary/20 shadow-xs'
                              : 'border-border/80 bg-background hover:bg-muted/40'
                          )}
                        >
                          <div
                            className={cn(
                              'flex size-5 shrink-0 items-center justify-center rounded-full border mt-0.5',
                              isSelected
                                ? 'border-primary bg-primary text-primary-foreground'
                                : 'border-muted-foreground/40'
                            )}
                          >
                            {isSelected && (
                              <Check className="size-3 stroke-3" />
                            )}
                          </div>
                          <div className="space-y-0.5 flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-semibold text-foreground">
                                {t.name}
                              </span>
                              <Badge
                                variant="outline"
                                className="text-3xs font-mono text-primary border-primary/30"
                              >
                                {t.fields?.length || 0} Field Terstruktur
                              </Badge>
                            </div>
                            {t.description && (
                              <p className="text-2xs text-muted-foreground line-clamp-2">
                                {t.description}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-2xs text-muted-foreground italic px-1">
                      Divisi {toDivisionName} belum mendaftarkan template khusus. Anda dapat menggunakan Formulir Umum di atas.
                    </p>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentStep(1)}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Kembali
                </Button>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handleSaveDraft}
                    disabled={isBusy}
                    className="gap-1.5"
                  >
                    <FileText className="h-4 w-4" />
                    Simpan Perubahan
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleNextFromStep2}
                    className="gap-2"
                  >
                    Lanjut ke Rincian Brief
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ─── TAHAP 3: RINCIAN & BRIEF ─────────────────────────────────────── */}
        {currentStep === 3 && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                    3
                  </span>
                  Rincian Permohonan &amp; Pengisian Brief
                </CardTitle>
                <Badge variant="outline" className="text-3xs font-mono">
                  Langkah 3 dari 3
                </Badge>
              </div>
              <CardDescription className="text-xs">
                Lengkapi judul, tenggat waktu (deadline), dan data brief spesifikasi kebutuhan kerja.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Summary of route & template with quick change */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40 border text-2xs text-muted-foreground">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-semibold text-foreground">
                    {fromDivisionName}
                  </span>
                  <ArrowRight className="size-3 text-muted-foreground" />
                  <span className="font-semibold text-foreground">
                    {toDivisionName}
                  </span>
                  <span className="text-muted-foreground/60">•</span>
                  <span>
                    Template:{' '}
                    <strong className="text-foreground">
                      {selectedTemplate ? selectedTemplate.name : 'Formulir Umum'}
                    </strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="text-primary hover:underline text-2xs font-medium shrink-0 ml-2"
                >
                  Ubah Format
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <Label htmlFor="draftTitle" className="text-xs font-medium">
                    Judul Permohonan <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="draftTitle"
                    placeholder="Contoh: Kebutuhan Poster dan Feed Expo KKN 2026"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="draftDeadline" className="text-xs font-medium">
                    Target Deadline (Opsional)
                  </Label>
                  <DatePicker
                    id="draftDeadline"
                    value={deadline}
                    onChange={(v) => setDeadline(v || '')}
                  />
                </div>
              </div>

              {/* Dynamic form or General brief */}
              <div className="pt-2 border-t space-y-3">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {selectedTemplate
                    ? `Brief Khusus: ${selectedTemplate.name}`
                    : 'Brief Permohonan'}
                </Label>

                {selectedTemplate?.fields && selectedTemplate.fields.length > 0 ? (
                  <DynamicFormRenderer
                    fields={selectedTemplate.fields}
                    values={brief}
                    onChange={setBrief}
                  />
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor="draftDeskripsi"
                        className="text-xs font-medium"
                      >
                        Deskripsi Kebutuhan &amp; Spesifikasi{' '}
                        <span className="text-destructive">*</span>
                      </Label>
                      <span className="text-3xs text-muted-foreground font-normal">
                        Ketik &apos;/&apos; untuk opsi format blok (Heading, Checklist, Tabel, dll)
                      </span>
                    </div>
                    <NotionEditor
                      value={brief.deskripsi || ''}
                      onChange={(html) =>
                        setBrief({ ...brief, deskripsi: html })
                      }
                      placeholder="Jelaskan kebutuhan secara detail. Ketik '/' untuk format blok Notion (Heading, Checklist, Kutipan, Tabel, dll)..."
                      minHeight="min-h-[220px]"
                    />
                  </div>
                )}
              </div>

              {/* Submit Actions */}
              <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-3 border-t">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentStep(2)}
                  className="gap-2 w-full sm:w-auto"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Kembali ke Format
                </Button>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handleSaveDraft}
                    disabled={isBusy || !toDivisionId}
                    className="gap-2"
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <FileText className="h-4 w-4" />
                    )}
                    {isSaving ? 'Menyimpan...' : 'Simpan Perubahan Draft'}
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isBusy || !toDivisionId}
                    className="gap-2"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    {isSubmitting ? 'Mengajukan...' : 'Ajukan Permohonan'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </form>
    </div>
  );
}
