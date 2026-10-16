'use client';

import React, { useState } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
import { useSubunits } from '@/features/subunits/api/use-queries';
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
  Loader2,
  Building2,
  Home,
  GraduationCap,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { RequestDetail, AcademicCluster } from '../types';

const CLUSTER_OPTIONS: Array<{
  value: AcademicCluster;
  label: string;
}> = [
  { value: 'SAINTEK', label: 'Sains & Teknologi (SAINTEK)' },
  { value: 'SOSHUM', label: 'Sosial Humaniora (SOSHUM)' },
  { value: 'MEDIKA', label: 'Kesehatan & Medika (MEDIKA)' },
  { value: 'AGRO', label: 'Agro & Pertanian (AGRO)' },
];

interface DraftRequestContentProps {
  request: RequestDetail;
}

export function DraftRequestContent({ request }: DraftRequestContentProps) {
  const { data: user } = useCurrentUser();
  const { data: divisions } = useDivisions();
  const { data: allSubunits = [] } = useSubunits();

  const [originType, setOriginType] = useState<'DIVISION' | 'SUBUNIT' | 'CLUSTER'>(
    request.originType || 'DIVISION'
  );
  const [fromDivisionId, setFromDivisionId] = useState(request.fromDivisionId || '');
  const [fromSubunitId, setFromSubunitId] = useState(request.fromSubunitId || '');
  const [fromCluster, setFromCluster] = useState<AcademicCluster | ''>(request.fromCluster || '');
  const [toDivisionId, setToDivisionId] = useState(request.toDivisionId || '');
  const [templateId, setTemplateId] = useState(request.templateId || '');
  const [title, setTitle] = useState(request.title || '');
  const [deadline, setDeadline] = useState(
    request.deadline ? request.deadline.split('T')[0] : ''
  );
  const [brief, setBrief] = useState<Record<string, unknown>>(request.brief || {});

  const isOriginSet =
    (originType === 'DIVISION' && Boolean(request.fromDivisionId)) ||
    (originType === 'SUBUNIT' && Boolean(request.fromSubunitId)) ||
    (originType === 'CLUSTER' && Boolean(request.fromCluster));

  // Wizard state: 1 = Rute Permohonan, 2 = Template, 3 = Rincian & Brief
  // Default to step 3 for existing drafts with origin and target already set
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(
    isOriginSet && request.toDivisionId ? 3 : 1
  );

  const { data: templates, isLoading: loadingTemplates } =
    useDivisionTemplates(toDivisionId);

  const updateDraftMutation = useUpdateDraft(request.id);
  const submitDraftMutation = useSubmitDraft(request.id);

  // Sync state if request updates from server
  const [prevRequestId, setPrevRequestId] = useState(request.id);
  if (request.id !== prevRequestId) {
    setPrevRequestId(request.id);
    setOriginType(request.originType || 'DIVISION');
    setFromDivisionId(request.fromDivisionId || '');
    setFromSubunitId(request.fromSubunitId || '');
    setFromCluster(request.fromCluster || '');
    setToDivisionId(request.toDivisionId || '');
    setTemplateId(request.templateId || '');
    setTitle(request.title || '');
    setDeadline(request.deadline ? request.deadline.split('T')[0] : '');
    setBrief(request.brief || {});
  }

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

  // Available origin subunits
  const availableSubunits =
    user?.isSuperAdmin || user?.isKormanit
      ? allSubunits
      : user?.subunits?.map((s) => ({
          id: s.subunitId,
          name: s.subunitName,
        })) || [];

  // Available origin clusters
  const availableClusters =
    user?.isSuperAdmin || user?.isKormanit
      ? CLUSTER_OPTIONS
      : user?.cluster
      ? CLUSTER_OPTIONS.filter((c) => c.value === user.cluster)
      : CLUSTER_OPTIONS;

  // Available destination divisions
  const availableTargetDivisions =
    originType === 'DIVISION'
      ? divisions?.filter((d) => d.id !== fromDivisionId) || []
      : divisions || [];

  const originName =
    originType === 'DIVISION'
      ? availableOriginDivisions.find((d) => d.id === fromDivisionId)?.name ||
        request.fromDivisionName ||
        'Pilih Divisi'
      : originType === 'SUBUNIT'
      ? availableSubunits.find((s) => s.id === fromSubunitId)?.name ||
        request.fromSubunitName ||
        'Pilih Subunit'
      : fromCluster
      ? `Klaster ${fromCluster}`
      : 'Pilih Klaster';

  const toDivisionName =
    divisions?.find((d) => d.id === toDivisionId)?.name ||
    request.toDivisionName ||
    'Pilih Divisi';

  const isStep1Valid =
    Boolean(toDivisionId) &&
    ((originType === 'DIVISION' && Boolean(fromDivisionId)) ||
      (originType === 'SUBUNIT' && Boolean(fromSubunitId)) ||
      (originType === 'CLUSTER' && Boolean(fromCluster)));

  // Navigation handlers
  const handleNextFromStep1 = () => {
    if (originType === 'DIVISION' && !fromDivisionId) {
      toast.error('Pilih divisi asal pemohon.');
      return;
    }
    if (originType === 'SUBUNIT' && !fromSubunitId) {
      toast.error('Pilih subunit posko asal pemohon.');
      return;
    }
    if (originType === 'CLUSTER' && !fromCluster) {
      toast.error('Pilih klaster keilmuan asal pemohon.');
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
      if (!isStep1Valid) {
        toast.info('Lengkapi asal pengaju dan divisi tujuan terlebih dahulu.');
        return;
      }
      setCurrentStep(2);
      return;
    }
    if (stepIndex === 3) {
      if (!isStep1Valid) {
        toast.info('Lengkapi asal pengaju dan divisi tujuan terlebih dahulu.');
        return;
      }
      setCurrentStep(3);
    }
  };

  const handleSaveDraft = async () => {
    if (originType === 'DIVISION' && !fromDivisionId) {
      toast.error('Pilih divisi asal pembuat request.');
      setCurrentStep(1);
      return;
    }
    if (originType === 'SUBUNIT' && !fromSubunitId) {
      toast.error('Pilih subunit posko pembuat request.');
      setCurrentStep(1);
      return;
    }
    if (originType === 'CLUSTER' && !fromCluster) {
      toast.error('Pilih klaster pembuat request.');
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
        originType,
        fromDivisionId: originType === 'DIVISION' ? fromDivisionId : undefined,
        fromSubunitId: originType === 'SUBUNIT' ? fromSubunitId : undefined,
        fromCluster: originType === 'CLUSTER' && fromCluster ? fromCluster : undefined,
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

    if (originType === 'DIVISION' && !fromDivisionId) {
      toast.error('Pilih divisi asal pembuat request.');
      setCurrentStep(1);
      return;
    }
    if (originType === 'SUBUNIT' && !fromSubunitId) {
      toast.error('Pilih subunit posko pembuat request.');
      setCurrentStep(1);
      return;
    }
    if (originType === 'CLUSTER' && !fromCluster) {
      toast.error('Pilih klaster pembuat request.');
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
        originType,
        fromDivisionId: originType === 'DIVISION' ? fromDivisionId : undefined,
        fromSubunitId: originType === 'SUBUNIT' ? fromSubunitId : undefined,
        fromCluster: originType === 'CLUSTER' && fromCluster ? fromCluster : undefined,
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
      : isStep1Valid
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
      title: 'Rute Permohonan',
      desc:
        isStep1Valid
          ? `${originName} ➔ ${toDivisionName}`
          : 'Pilih asal & divisi tujuan',
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
        {/* ─── TAHAP 1: RUTE PERMOHONAN ────────────────────────────────────── */}
        {currentStep === 1 && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                    1
                  </span>
                  Pilih Asal Pengaju &amp; Divisi Pelaksana (Tujuan)
                </CardTitle>
                <Badge variant="outline" className="text-3xs font-mono">
                  Langkah 1 dari 3
                </Badge>
              </div>
              <CardDescription className="text-xs">
                Tentukan entitas pengaju Anda (Divisi, Subunit Posko, atau Klaster Keilmuan) serta divisi yang dituju untuk berkolaborasi.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Origin Type Selector */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-foreground">
                  Ajukan Permohonan Sebagai <span className="text-destructive">*</span>
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Option 1: Divisi */}
                  <div
                    onClick={() => {
                      setOriginType("DIVISION");
                      if (toDivisionId === fromDivisionId) setToDivisionId("");
                    }}
                    className={cn(
                      "flex flex-col p-3 rounded-xl border transition-all cursor-pointer select-none",
                      originType === "DIVISION"
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-xs"
                        : "border-border/80 bg-background hover:bg-muted/40",
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            "p-1.5 rounded-lg",
                            originType === "DIVISION"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground",
                          )}
                        >
                          <Building2 className="size-4" />
                        </div>
                        <span className="text-xs font-semibold text-foreground">
                          Divisi Internal
                        </span>
                      </div>
                      {originType === "DIVISION" && (
                        <div className="size-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                          <Check className="size-2.5 stroke-3" />
                        </div>
                      )}
                    </div>
                    <p className="text-3xs text-muted-foreground">
                      Kolaborasi antar divisi internal organisasi KKN.
                    </p>
                  </div>

                  {/* Option 2: Subunit Posko */}
                  <div
                    onClick={() => setOriginType("SUBUNIT")}
                    className={cn(
                      "flex flex-col p-3 rounded-xl border transition-all cursor-pointer select-none",
                      originType === "SUBUNIT"
                        ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 ring-2 ring-emerald-500/20 shadow-xs"
                        : "border-border/80 bg-background hover:bg-muted/40",
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            "p-1.5 rounded-lg",
                            originType === "SUBUNIT"
                              ? "bg-emerald-600 text-white"
                              : "bg-muted text-muted-foreground",
                          )}
                        >
                          <Home className="size-4" />
                        </div>
                        <span className="text-xs font-semibold text-foreground">
                          Subunit Posko
                        </span>
                      </div>
                      {originType === "SUBUNIT" && (
                        <div className="size-4 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                          <Check className="size-2.5 stroke-3" />
                        </div>
                      )}
                    </div>
                    <p className="text-3xs text-muted-foreground">
                      Permohonan kebutuhan posko subunit ke divisi pelaksana.
                    </p>
                  </div>

                  {/* Option 3: Klaster Keilmuan */}
                  <div
                    onClick={() => setOriginType("CLUSTER")}
                    className={cn(
                      "flex flex-col p-3 rounded-xl border transition-all cursor-pointer select-none",
                      originType === "CLUSTER"
                        ? "border-sky-500 bg-sky-50/50 dark:bg-sky-950/20 ring-2 ring-sky-500/20 shadow-xs"
                        : "border-border/80 bg-background hover:bg-muted/40",
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            "p-1.5 rounded-lg",
                            originType === "CLUSTER"
                              ? "bg-sky-600 text-white"
                              : "bg-muted text-muted-foreground",
                          )}
                        >
                          <GraduationCap className="size-4" />
                        </div>
                        <span className="text-xs font-semibold text-foreground">
                          Klaster Keilmuan
                        </span>
                      </div>
                      {originType === "CLUSTER" && (
                        <div className="size-4 rounded-full bg-sky-600 text-white flex items-center justify-center">
                          <Check className="size-2.5 stroke-3" />
                        </div>
                      )}
                    </div>
                    <p className="text-3xs text-muted-foreground">
                      Permohonan bidang rumpun ilmu (Saintek, Soshum, Medika, Agro).
                    </p>
                  </div>
                </div>
              </div>

              {/* Dynamic Inputs: Origin Specific + Target Division */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Origin: DIVISI */}
                {originType === "DIVISION" && (
                  <div className="space-y-1.5">
                    <Label htmlFor="draftFromDivision" className="text-xs font-medium flex items-center gap-1.5">
                      <Building2 className="size-3.5 text-primary" />
                      <span>Divisi Asal (Pemohon)</span>
                      <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={fromDivisionId || undefined}
                      onValueChange={(value) => {
                        setFromDivisionId(value);
                        if (toDivisionId === value) {
                          setToDivisionId("");
                        }
                      }}
                    >
                      <SelectTrigger id="draftFromDivision" className="h-9 w-full text-sm">
                        <SelectValue placeholder="Pilih Divisi Asal..." />
                      </SelectTrigger>
                      <SelectContent>
                        {availableOriginDivisions.map((div) => (
                          <SelectItem key={div.id} value={div.id}>
                            {div.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Origin: SUBUNIT */}
                {originType === "SUBUNIT" && (
                  <div className="space-y-1.5">
                    <Label htmlFor="draftFromSubunit" className="text-xs font-medium flex items-center gap-1.5">
                      <Home className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Subunit Posko Asal</span>
                      <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={fromSubunitId || undefined}
                      onValueChange={(value) => setFromSubunitId(value)}
                    >
                      <SelectTrigger id="draftFromSubunit" className="h-9 w-full text-sm">
                        <SelectValue placeholder="Pilih Subunit Posko..." />
                      </SelectTrigger>
                      <SelectContent>
                        {availableSubunits.length === 0 ? (
                          <div className="p-2 text-xs text-muted-foreground text-center">
                            Anda belum terdaftar dalam subunit manapun.
                          </div>
                        ) : (
                          availableSubunits.map((sub) => (
                            <SelectItem key={sub.id} value={sub.id}>
                              {sub.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Origin: CLUSTER */}
                {originType === "CLUSTER" && (
                  <div className="space-y-1.5">
                    <Label htmlFor="draftFromCluster" className="text-xs font-medium flex items-center gap-1.5">
                      <GraduationCap className="size-3.5 text-sky-600 dark:text-sky-400" />
                      <span>Klaster Keilmuan Asal</span>
                      <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={fromCluster || undefined}
                      onValueChange={(value) => setFromCluster(value as AcademicCluster)}
                    >
                      <SelectTrigger id="draftFromCluster" className="h-9 w-full text-sm">
                        <SelectValue placeholder="Pilih Klaster..." />
                      </SelectTrigger>
                      <SelectContent>
                        {availableClusters.map((cl) => (
                          <SelectItem key={cl.value} value={cl.value}>
                            {cl.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Target: Divisi Pelaksana */}
                <div className="space-y-1.5">
                  <Label htmlFor="draftToDivision" className="text-xs font-medium flex items-center gap-1.5">
                    <Building2 className="size-3.5 text-primary" />
                    <span>Divisi Tujuan (Pelaksana)</span>
                    <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={toDivisionId || undefined}
                    onValueChange={handleToDivisionChange}
                    disabled={
                      (originType === "DIVISION" && !fromDivisionId) ||
                      (originType === "SUBUNIT" && !fromSubunitId) ||
                      (originType === "CLUSTER" && !fromCluster)
                    }
                  >
                    <SelectTrigger id="draftToDivision" className="h-9 w-full text-sm">
                      <SelectValue placeholder="Pilih Divisi Pelaksana..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTargetDivisions.map((div) => (
                        <SelectItem key={div.id} value={div.id}>
                          {div.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Route Summary Banner */}
              {isStep1Valid && (
                <div className="flex items-center gap-2.5 p-3 rounded-lg bg-primary/5 border border-primary/20 text-xs">
                  <Sparkles className="size-4 text-primary shrink-0" />
                  <span className="text-muted-foreground">
                    Rute permohonan:{" "}
                    <strong className="text-foreground">
                      {originName}
                    </strong>{" "}
                    akan mengajukan permohonan ke divisi pelaksana{" "}
                    <strong className="text-primary font-semibold">
                      {toDivisionName}
                    </strong>
                    .
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
                    disabled={!isStep1Valid}
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
                    {originName}
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
                      value={typeof brief.deskripsi === 'string' ? brief.deskripsi : ''}
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
