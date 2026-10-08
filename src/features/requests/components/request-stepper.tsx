'use client';

import React from 'react';
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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  RotateCcw,
  Sparkles,
  PackageCheck,
  CheckCircle,
  HelpCircle,
  Clock,
  ArrowRight,
  FileEdit,
  Send,
  Target,
} from 'lucide-react';
import type { RequestDetail } from '../types';
import { cn } from '@/lib/utils';

interface RequestStepperProps {
  request: RequestDetail;
  scrollToSection: (sectionId: string) => void;
  onOpenSubmitDraft?: () => void;
  onOpenEditDraft?: () => void;
  onOpenOriginApproval?: () => void;
  onOpenTriage?: () => void;
  onOpenRespondInfo?: () => void;
  onOpenConvertToStory?: () => void;
  onOpenConvertToEpic?: () => void;
  onOpenDeliver?: () => void;
  onOpenConfirm?: () => void;
  onOpenStartRevision?: () => void;
}

export function RequestStepper({
  request,
  scrollToSection,
  onOpenSubmitDraft,
  onOpenEditDraft,
  onOpenOriginApproval,
  onOpenTriage,
  onOpenRespondInfo,
  onOpenConvertToStory,
  onOpenConvertToEpic,
  onOpenDeliver,
  onOpenConfirm,
  onOpenStartRevision,
}: RequestStepperProps) {
  const status = request.status;
  const events = request.events || [];
  const revisionCount = events.filter((e) => e.toStatus === 'REVISION').length;

  // Step 1: Pengajuan (Draft / Waiting Origin Approval / Submitted)
  let step1State: StepState = 'upcoming';
  let step1Desc = 'Diajukan & disetujui';
  if (status === 'DRAFT') {
    step1State = 'active';
    step1Desc = 'Draft belum diajukan';
  } else if (status === 'WAITING_ORIGIN_APPROVAL') {
    step1State = 'warning';
    step1Desc = 'Menunggu approval asal';
  } else {
    step1State = 'completed';
    step1Desc = 'Pengajuan disetujui';
  }

  // Step 2: Triage & Review (Triage Divisi Tujuan)
  let step2State: StepState = 'upcoming';
  let step2Desc = 'Menunggu pengajuan';
  if (status === 'DRAFT' || status === 'WAITING_ORIGIN_APPROVAL') {
    step2State = 'upcoming';
    step2Desc = 'Antrean permohonan';
  } else if (status === 'SUBMITTED') {
    step2State = 'active';
    step2Desc = 'Menunggu triage tujuan';
  } else if (status === 'NEED_INFO') {
    step2State = 'warning';
    step2Desc = 'Perlu info tambahan';
  } else if (status === 'REJECTED') {
    step2State = 'error';
    step2Desc = 'Permohonan ditolak';
  } else {
    step2State = 'completed';
    step2Desc = 'Diterima divisi tujuan';
  }

  // Step 3: Pengerjaan (Kanban / Inisiatif Execution)
  let step3State: StepState = 'upcoming';
  let step3Desc = 'Menunggu persetujuan';
  const linkedStory = request.linkedStory;
  const linkedEpic = request.linkedEpic;
  const progressPercent =
    linkedStory && linkedStory.tasksCount > 0
      ? Math.round((linkedStory.doneTasksCount / linkedStory.tasksCount) * 100)
      : linkedEpic
        ? linkedEpic.progressPercent
        : null;

  if (
    status === 'DRAFT' ||
    status === 'WAITING_ORIGIN_APPROVAL' ||
    status === 'SUBMITTED' ||
    status === 'NEED_INFO' ||
    status === 'REJECTED'
  ) {
    step3State = 'upcoming';
    step3Desc = 'Belum dimulai';
  } else if (status === 'ACCEPTED') {
    step3State = 'active';
    step3Desc = 'Siap dikonversi ke Epic/Story';
  } else if (status === 'IN_PROGRESS') {
    step3State = 'active';
    if (linkedEpic) {
      step3Desc = `Inisiatif /epics: ${linkedEpic.doneTasksCount}/${linkedEpic.tasksCount} task (${linkedEpic.progressPercent}%)`;
    } else if (progressPercent !== null) {
      step3Desc = `${linkedStory?.doneTasksCount}/${linkedStory?.tasksCount} task (${progressPercent}%)`;
    } else {
      step3Desc = 'Sedang dikerjakan';
    }
  } else {
    step3State = 'completed';
    step3Desc = 'Pengerjaan selesai';
  }

  // Step 4: Pengiriman & Revisi
  let step4State: StepState = 'upcoming';
  let step4Desc = 'Menunggu pengerjaan';
  if (
    status === 'DRAFT' ||
    status === 'WAITING_ORIGIN_APPROVAL' ||
    status === 'SUBMITTED' ||
    status === 'NEED_INFO' ||
    status === 'REJECTED' ||
    status === 'ACCEPTED' ||
    status === 'IN_PROGRESS'
  ) {
    step4State = 'upcoming';
    step4Desc = 'Menunggu pengerjaan';
  } else if (status === 'DELIVERED') {
    step4State = 'active';
    step4Desc =
      revisionCount > 0
        ? `Hasil revisi #${revisionCount} terkirim`
        : 'Hasil kerja dikirim';
  } else if (status === 'REVISION') {
    step4State = 'warning';
    step4Desc = `Revisi #${revisionCount} diminta`;
  } else if (status === 'CONFIRMED') {
    step4State = 'completed';
    step4Desc =
      revisionCount > 0
        ? `Disetujui (${revisionCount}x revisi)`
        : 'Hasil kerja disetujui';
  }

  // Step 5: Selesai
  let step5State: StepState = 'upcoming';
  let step5Desc = 'Belum selesai';
  if (status === 'CONFIRMED') {
    step5State = 'completed';
    step5Desc = 'Permohonan selesai';
  } else if (status === 'REJECTED') {
    step5State = 'error';
    step5Desc = 'Permohonan ditutup';
  } else {
    step5State = 'upcoming';
    step5Desc = 'Menunggu penyelesaian';
  }

  const steps = [
    {
      step: 1,
      title: 'Pengajuan',
      desc: step1Desc,
      state: step1State,
      sectionId: 'section-brief',
      badge:
        status === 'DRAFT'
          ? 'Draft'
          : status === 'WAITING_ORIGIN_APPROVAL'
            ? 'Approval Asal'
            : status === 'SUBMITTED'
              ? 'Diajukan'
              : null,
      badgeVariant:
        status === 'DRAFT'
          ? 'outline'
          : status === 'WAITING_ORIGIN_APPROVAL'
            ? 'warning'
            : 'default',
    },
    {
      step: 2,
      title: 'Triage & Review',
      desc: step2Desc,
      state: step2State,
      sectionId: 'section-brief',
      badge:
        status === 'NEED_INFO'
          ? 'Butuh Info'
          : status === 'REJECTED'
            ? 'Ditolak'
            : status === 'ACCEPTED'
              ? 'Diterima'
              : null,
      badgeVariant:
        status === 'NEED_INFO'
          ? 'warning'
          : status === 'REJECTED'
            ? 'destructive'
            : 'default',
    },
    {
      step: 3,
      title: 'Pengerjaan Kanban',
      desc: step3Desc,
      state: step3State,
      sectionId: 'section-story',
      badge:
        status === 'IN_PROGRESS'
          ? progressPercent !== null
            ? `${progressPercent}%`
            : 'Aktif'
          : null,
      badgeVariant: 'default',
    },
    {
      step: 4,
      title: 'Hasil & Revisi',
      desc: step4Desc,
      state: step4State,
      sectionId: 'section-delivery',
      badge:
        status === 'REVISION'
          ? `Revisi ${revisionCount}x`
          : revisionCount > 0
            ? `Rev ${revisionCount}x`
            : null,
      badgeVariant: status === 'REVISION' ? 'warning' : 'outline',
      icon:
        status === 'REVISION' ? (
          <RotateCcw className="size-3.5 animate-spin-slow stroke-[2.5]" />
        ) : undefined,
    },
    {
      step: 5,
      title: 'Selesai',
      desc: step5Desc,
      state: step5State,
      sectionId: 'section-timeline',
      badge: status === 'CONFIRMED' ? 'Tuntas' : null,
      badgeVariant: 'default',
    },
  ];

  // Active contextual banner / actionable CTA
  const renderActiveActionStrip = () => {
    if (
      status === 'DRAFT' &&
      (request.permissions.canSubmitDraft || request.permissions.canEditDraft)
    ) {
      return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg bg-zinc-500/10 border border-zinc-500/20 text-xs">
          <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
            <FileEdit className="size-4 shrink-0 text-zinc-500 dark:text-zinc-400" />
            <span>Permohonan ini masih berupa Draft dan belum diteruskan ke divisi tujuan.</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {request.permissions.canEditDraft && onOpenEditDraft && (
              <Button
                size="sm"
                variant="outline"
                onClick={onOpenEditDraft}
                className="text-xs gap-1.5 h-8"
              >
                <FileEdit className="size-3.5" />
                Edit Draft
              </Button>
            )}
            {request.permissions.canSubmitDraft && onOpenSubmitDraft && (
              <Button
                size="sm"
                onClick={onOpenSubmitDraft}
                className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs gap-1.5 h-8"
              >
                <Send className="size-3.5" />
                Ajukan Sekarang
              </Button>
            )}
          </div>
        </div>
      );
    }

    if (status === 'WAITING_ORIGIN_APPROVAL' && request.permissions.canApproveOrigin) {
      return (
        <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
            <Clock className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>Permohonan ini membutuhkan persetujuan koordinator divisi asal Anda.</span>
          </div>
          <Button
            size="sm"
            onClick={onOpenOriginApproval}
            className="bg-amber-600 hover:bg-amber-700 text-white shrink-0 text-xs gap-1.5"
          >
            <CheckCircle className="size-3.5" />
            Beri Persetujuan
          </Button>
        </div>
      );
    }

    if (status === 'SUBMITTED' && request.permissions.canTriage) {
      return (
        <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 text-xs">
          <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
            <HelpCircle className="size-4 shrink-0 text-blue-600 dark:text-blue-400" />
            <span>Permohonan baru masuk. Silakan triage untuk menerima, meminta info, atau menolak.</span>
          </div>
          <Button
            size="sm"
            onClick={onOpenTriage}
            className="bg-blue-600 hover:bg-blue-700 text-white shrink-0 text-xs gap-1.5"
          >
            <CheckCircle className="size-3.5" />
            Triage Permohonan
          </Button>
        </div>
      );
    }

    if (status === 'NEED_INFO' && request.permissions.canRespondInfo) {
      return (
        <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-purple-500/10 border border-purple-500/30 text-xs">
          <div className="flex items-center gap-2 text-purple-800 dark:text-purple-200">
            <HelpCircle className="size-4 shrink-0 text-purple-600 dark:text-purple-400" />
            <span>Divisi tujuan meminta informasi tambahan sebelum dapat memproses request ini.</span>
          </div>
          <Button
            size="sm"
            onClick={onOpenRespondInfo}
            className="bg-purple-600 hover:bg-purple-700 text-white shrink-0 text-xs gap-1.5"
          >
            Lengkapi Info
          </Button>
        </div>
      );
    }

    if (
      status === 'ACCEPTED' &&
      (request.permissions.canConvertToStory || request.permissions.canConvertToEpic)
    ) {
      return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs">
          <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-200">
            <Sparkles className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>Permohonan telah diterima! Anda dapat menjadikannya Inisiatif/Epic di /epics atau Story langsung di board Kanban.</span>
          </div>
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {request.permissions.canConvertToEpic && onOpenConvertToEpic && (
              <Button
                size="sm"
                onClick={onOpenConvertToEpic}
                className="bg-indigo-600 hover:bg-indigo-700 text-white shrink-0 text-xs gap-1.5"
              >
                <Target className="size-3.5" />
                Jadikan Inisiatif / Epic
              </Button>
            )}
            {request.permissions.canConvertToStory && onOpenConvertToStory && (
              <Button
                size="sm"
                onClick={onOpenConvertToStory}
                className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0 text-xs gap-1.5"
              >
                <Sparkles className="size-3.5" />
                Konversi ke Story Kanban
              </Button>
            )}
          </div>
        </div>
      );
    }

    if (status === 'REVISION' && request.permissions.canStartRevision) {
      return (
        <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs">
          <div className="flex items-center gap-2 text-rose-800 dark:text-rose-200">
            <RotateCcw className="size-4 shrink-0 text-rose-600 dark:text-rose-400" />
            <span>
              Revisi ke-{revisionCount} diminta pemohon. Mulai pengerjaan ulang untuk
              membuka kembali status pengerjaan.
            </span>
          </div>
          <Button
            size="sm"
            onClick={onOpenStartRevision}
            className="bg-rose-600 hover:bg-rose-700 text-white shrink-0 text-xs gap-1.5"
          >
            <RotateCcw className="size-3.5" />
            Mulai Revisi
          </Button>
        </div>
      );
    }

    if (status === 'IN_PROGRESS' && request.permissions.canDeliver) {
      const allTasksDone =
        linkedStory &&
        linkedStory.tasksCount > 0 &&
        linkedStory.doneTasksCount === linkedStory.tasksCount;

      return (
        <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-xs">
          <div className="flex items-center gap-2 text-indigo-800 dark:text-indigo-200">
            <PackageCheck className="size-4 shrink-0 text-indigo-600 dark:text-indigo-400" />
            <span>
              {allTasksDone
                ? 'Semua task telah selesai! Anda dapat mengirimkan hasil kerja sekarang.'
                : `Pengerjaan berlangsung (${linkedStory?.doneTasksCount || 0}/${linkedStory?.tasksCount || 0} task selesai).`}
            </span>
          </div>
          <Button
            size="sm"
            onClick={onOpenDeliver}
            className="bg-indigo-600 hover:bg-indigo-700 text-white shrink-0 text-xs gap-1.5"
          >
            <PackageCheck className="size-3.5" />
            {revisionCount > 0 ? 'Kirim Ulang Hasil' : 'Kirim Hasil Kerja'}
          </Button>
        </div>
      );
    }

    if (status === 'DELIVERED' && request.permissions.canConfirmOrRevise) {
      return (
        <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs">
          <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-200">
            <CheckCircle className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>Hasil kerja telah diterima. Silakan tinjau dan konfirmasi selesai atau ajukan revisi jika diperlukan.</span>
          </div>
          <Button
            size="sm"
            onClick={onOpenConfirm}
            className="bg-green-600 hover:bg-green-700 text-white shrink-0 text-xs gap-1.5"
          >
            <CheckCircle className="size-3.5" />
            Konfirmasi / Revisi
          </Button>
        </div>
      );
    }

    return null;
  };

  return (
    <Card className="border-border/80 shadow-xs overflow-hidden">
      <CardContent className="p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between gap-2 border-b border-border/50 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold tracking-tight text-foreground uppercase">
              Alur Lifecycle Permohonan
            </span>
            {revisionCount > 0 && (
              <Badge
                variant="outline"
                className="text-3xs font-mono font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-300/40"
              >
                Siklus Revisi: {revisionCount}x
              </Badge>
            )}
          </div>
          <span className="text-2xs text-muted-foreground hidden sm:inline">
            Klik tahapan untuk melompat ke rincian
          </span>
        </div>

        {/* Responsive Horizontal Stepper */}
        <div className="overflow-x-auto pb-1 -mx-2 px-2 sm:mx-0 sm:px-0">
          <Stepper className="min-w-160 sm:min-w-0 max-w-5xl mx-auto">
            {steps.map((st, index) => {
              const isLast = index === steps.length - 1;
              return (
                <React.Fragment key={st.step}>
                  <StepperItem step={st.step} state={st.state}>
                    <StepperTrigger
                      onClick={() => scrollToSection(st.sectionId)}
                      title={`Lompat ke bagian ${st.title}`}
                    >
                      <StepperIndicator
                        state={st.state}
                        stepNumber={st.step}
                        icon={st.icon}
                      />
                      <div className="flex flex-col text-left min-w-0">
                        <div className="flex items-center gap-1.5">
                          <StepperTitle>{st.title}</StepperTitle>
                          {st.badge && (
                            <span
                              className={cn(
                                'text-3xs font-medium px-1.5 py-0.2 rounded-full',
                                st.badgeVariant === 'warning' &&
                                  'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
                                st.badgeVariant === 'destructive' &&
                                  'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
                                st.badgeVariant === 'outline' &&
                                  'border border-border text-muted-foreground',
                                st.badgeVariant === 'default' &&
                                  'bg-primary/10 text-primary'
                              )}
                            >
                              {st.badge}
                            </span>
                          )}
                        </div>
                        <StepperDescription>{st.desc}</StepperDescription>
                      </div>
                    </StepperTrigger>
                  </StepperItem>
                  {!isLast && <StepperSeparator state={st.state} />}
                </React.Fragment>
              );
            })}
          </Stepper>
        </div>

        {/* Contextual Action Strip if user has an immediate role action */}
        {renderActiveActionStrip()}
      </CardContent>
    </Card>
  );
}
