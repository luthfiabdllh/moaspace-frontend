"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RequestStatusBadge } from "./request-status-badge";
import { RequestTimeline } from "./request-timeline";
import { RequestStepper } from "./request-stepper";
import { DynamicFormRenderer } from "./dynamic-form-renderer";
import {
  OriginApprovalDialog,
  TriageDialog,
  RespondInfoDialog,
  ConvertToStoryDialog,
  DeliverDialog,
  ConfirmDialog,
  SubmitDraftDialog,
  EditDraftDialog,
  StartRevisionDialog,
} from "./action-dialogs";
import { useRequest, useTemplate } from "../api/use-queries";
import { DraftRequestContent } from "./draft-request-content";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  CheckCircle,
  ExternalLink,
  FileText,
  FileEdit,
  Send,
  HelpCircle,
  PackageCheck,
  RotateCcw,
  Sparkles,
  Kanban,
  Target,
  XCircle,
} from "lucide-react";

interface RequestDetailContentProps {
  requestId: string;
}

export function RequestDetailContent({ requestId }: RequestDetailContentProps) {
  const router = useRouter();
  const { data: request, isLoading } = useRequest(requestId);
  const { data: template } = useTemplate(request?.templateId || undefined);

  // Dialog states
  const [openSubmitDraft, setOpenSubmitDraft] = useState(false);
  const [openEditDraft, setOpenEditDraft] = useState(false);
  const [openOriginApproval, setOpenOriginApproval] = useState(false);
  const [openTriage, setOpenTriage] = useState(false);
  const [openRespondInfo, setOpenRespondInfo] = useState(false);
  const [openConvertToStory, setOpenConvertToStory] = useState(false);
  const [openDeliver, setOpenDeliver] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [openStartRevision, setOpenStartRevision] = useState(false);

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
          Permohonan yang Anda cari mungkin telah dihapus atau Anda tidak
          memiliki akses.
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

  if (request.status === "DRAFT") {
    return <DraftRequestContent request={request} />;
  }

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return null;
    try {
      return new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(
        new Date(dateStr),
      );
    } catch {
      return dateStr;
    }
  };

  const initials = request.requesterName
    ? request.requesterName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const briefEntries = Object.entries(request.brief || {});

  return (
    <div className="w-full min-w-0 space-y-6 pb-8">
      {/* Back button */}
      <Link
        href="/requests"
        className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors group"
      >
        <div className="flex size-6 items-center justify-center rounded-md border border-border/80 bg-background group-hover:border-primary/50 group-hover:bg-primary/5 transition-colors">
          <ArrowLeft className="size-3.5" />
        </div>
        <span>Kembali ke Daftar Permohonan</span>
      </Link>

      {/* Main Header Card */}
      <Card className="shadow-xs border-border/80 overflow-hidden">
        <CardContent className="p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            {/* Division Route & Template */}
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="font-semibold text-foreground bg-muted px-2.5 py-1 rounded-md border border-border/60 shadow-2xs">
                {request.fromDivisionName}
              </span>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="font-semibold text-foreground bg-muted px-2.5 py-1 rounded-md border border-border/60 shadow-2xs">
                {request.toDivisionName}
              </span>
              <RequestStatusBadge status={request.status} />
              {request.templateName && (
                <span className="text-3xs font-mono text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded">
                  {request.templateName}
                </span>
              )}
            </div>

            {/* Requester Info */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Avatar className="h-6 w-6">
                <AvatarImage src={request.requesterAvatar || ""} />
                <AvatarFallback className="text-[10px]">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <span className="font-medium text-foreground">
                  {request.requesterName}
                </span>
                {request.requesterEmail && (
                  <span className="hidden sm:inline text-muted-foreground">
                    {" "}
                    ({request.requesterEmail})
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Title and metadata */}
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              {request.title}
            </h1>
            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1.5 flex-wrap">
              {request.createdAt && (
                <span>Diajukan pada {formatDate(request.createdAt)}</span>
              )}
              {request.deadline && (
                <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-medium">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Target Deadline: {formatDate(request.deadline)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Bar (Permission-driven) */}
          <div className="flex items-center gap-2 pt-3 border-t flex-wrap">
            {request.permissions.canEditDraft && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setOpenEditDraft(true)}
                className="gap-1.5"
              >
                <FileEdit className="h-4 w-4" />
                Edit Draft
              </Button>
            )}

            {request.permissions.canSubmitDraft && (
              <Button
                size="sm"
                onClick={() => setOpenSubmitDraft(true)}
                className="gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Send className="h-4 w-4" />
                Ajukan Permohonan
              </Button>
            )}

            {request.permissions.canApproveOrigin && (
              <Button
                size="sm"
                onClick={() => setOpenOriginApproval(true)}
                className="gap-1.5 bg-amber-600 hover:bg-amber-700 text-white"
              >
                <CheckCircle className="h-4 w-4" />
                Persetujuan Divisi Asal
              </Button>
            )}

            {request.permissions.canTriage && (
              <Button
                size="sm"
                onClick={() => setOpenTriage(true)}
                className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <HelpCircle className="h-4 w-4" />
                Triage Permohonan Masuk
              </Button>
            )}

            {request.permissions.canRespondInfo && (
              <Button
                size="sm"
                onClick={() => setOpenRespondInfo(true)}
                className="gap-1.5 bg-purple-600 hover:bg-purple-700 text-white"
              >
                <HelpCircle className="h-4 w-4" />
                Lengkapi Info yang Diminta
              </Button>
            )}

            {request.permissions.canConvertToEpic && (
              <Link href={`/requests/${requestId}/convert-to-epic`}>
                <Button
                  size="sm"
                  className="gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  <Target className="h-4 w-4" />
                  Jadikan Inisiatif / Epic
                </Button>
              </Link>
            )}

            {request.permissions.canConvertToStory && (
              <Button
                size="sm"
                onClick={() => setOpenConvertToStory(true)}
                className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Sparkles className="h-4 w-4" />
                Konversi Menjadi Story Kanban
              </Button>
            )}

            {request.permissions.canDeliver && (
              <Button
                size="sm"
                onClick={() => setOpenDeliver(true)}
                className="gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <PackageCheck className="h-4 w-4" />
                Kirim Hasil Kerja
              </Button>
            )}

            {request.permissions.canConfirmOrRevise && (
              <Button
                size="sm"
                onClick={() => setOpenConfirm(true)}
                className="gap-1.5 bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle className="h-4 w-4" />
                Konfirmasi / Ajukan Revisi
              </Button>
            )}

            {request.permissions.canStartRevision && (
              <Button
                size="sm"
                onClick={() => setOpenStartRevision(true)}
                className="gap-1.5 bg-rose-600 hover:bg-rose-700 text-white"
              >
                <RotateCcw className="h-4 w-4" />
                Mulai Revisi
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Interactive Lifecycle Stepper */}
      <RequestStepper
        request={request}
        scrollToSection={scrollToSection}
        onOpenSubmitDraft={() => setOpenSubmitDraft(true)}
        onOpenEditDraft={() => setOpenEditDraft(true)}
        onOpenOriginApproval={() => setOpenOriginApproval(true)}
        onOpenTriage={() => setOpenTriage(true)}
        onOpenRespondInfo={() => setOpenRespondInfo(true)}
        onOpenConvertToStory={() => setOpenConvertToStory(true)}
        onOpenConvertToEpic={() => router.push(`/requests/${requestId}/convert-to-epic`)}
        onOpenDeliver={() => setOpenDeliver(true)}
        onOpenConfirm={() => setOpenConfirm(true)}
        onOpenStartRevision={() => setOpenStartRevision(true)}
      />

      {/* Special Status Banners */}
      {request.status === "NEED_INFO" && request.reason && (
        <div className="rounded-xl border border-purple-500/30 bg-purple-500/10 p-4 text-purple-900 dark:text-purple-200 space-y-1">
          <div className="flex items-center gap-2 font-semibold text-sm">
            <HelpCircle className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            Divisi Tujuan Membutuhkan Informasi Tambahan
          </div>
          <p className="text-xs">{request.reason}</p>
        </div>
      )}

      {request.status === "REJECTED" && request.reason && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-900 dark:text-red-200 space-y-1">
          <div className="flex items-center gap-2 font-semibold text-sm">
            <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            Permohonan Ditolak
          </div>
          <p className="text-xs">{request.reason}</p>
        </div>
      )}

      {request.status === "REVISION" && request.reason && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-900 dark:text-rose-200 space-y-1.5">
          <div className="flex items-center gap-2 font-semibold text-sm">
            <RotateCcw className="h-4 w-4 text-rose-600 dark:text-rose-400" />
            Permintaan Revisi Diajukan
          </div>
          {/<[a-z][\s\S]*>/i.test(request.reason) ? (
            <div
              className="prose-notion text-xs leading-relaxed"
              dangerouslySetInnerHTML={{ __html: request.reason }}
            />
          ) : (
            <p className="text-xs">{request.reason}</p>
          )}
        </div>
      )}

      {/* Deliverable Results Card (if DELIVERED or CONFIRMED) */}
      {(request.status === "DELIVERED" || request.status === "CONFIRMED") && (
        <Card
          id="section-delivery"
          className="border-indigo-500/30 bg-indigo-500/5 scroll-mt-6"
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
              <PackageCheck className="h-4 w-4" />
              Hasil Kerja yang Telah Dikirimkan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {request.deliveryNotes && (
              <div className="text-xs text-foreground bg-background/80 p-3 rounded-lg border">
                <span className="font-semibold block mb-1">
                  Catatan Pengerja:
                </span>
                <p className="whitespace-pre-wrap">{request.deliveryNotes}</p>
              </div>
            )}

            {request.deliveryAttachments &&
              request.deliveryAttachments.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-foreground">
                    Berkas / Lampiran Hasil:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {request.deliveryAttachments.map((att, idx) => (
                      <a
                        key={idx}
                        href={att.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-2.5 rounded-lg border bg-background hover:border-primary transition-colors text-xs group"
                      >
                        <span className="font-medium text-foreground truncate pr-2">
                          {att.title || "Tautan Hasil Kerja"}
                        </span>
                        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
          </CardContent>
        </Card>
      )}

      {/* Linked Epic Progress Card (if converted to Epic) */}
      {request.linkedEpic && (
        <Card
          id="section-epic"
          className="border-indigo-500/30 bg-indigo-500/5 scroll-mt-6"
        >
          <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center gap-2 text-xs text-indigo-700 dark:text-indigo-400 font-semibold flex-wrap">
                <Target className="h-4 w-4" />
                <span>Inisiatif / Epic di /epics</span>
                <span className="text-3xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 font-medium">
                  {request.linkedEpic.scope === "CROSS"
                    ? "Lintas Divisi"
                    : "Divisi"}
                </span>
                {request.linkedEpic.prokerTag && (
                  <span className="text-3xs px-1.5 py-0.5 rounded bg-muted font-mono text-muted-foreground">
                    #{request.linkedEpic.prokerTag}
                  </span>
                )}
              </div>
              <h4 className="text-sm font-bold text-foreground truncate">
                {request.linkedEpic.title}
              </h4>
              <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                <span>
                  Progres Task: {request.linkedEpic.doneTasksCount} /{" "}
                  {request.linkedEpic.tasksCount} selesai (
                  {request.linkedEpic.progressPercent}%)
                </span>
                <span>•</span>
                <span>
                  {request.linkedEpic.storiesCount} deliverable stories
                </span>
                {request.linkedEpic.tasksCount > 0 && (
                  <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full transition-all"
                      style={{
                        width: `${request.linkedEpic.progressPercent}%`,
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            <Link href={`/epics?epicId=${request.linkedEpic.id}`}>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 text-xs shrink-0 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-950"
              >
                Buka di /epics
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Linked Story Progress Card (if converted) */}
      {request.linkedStory && (
        <Card
          id="section-story"
          className="border-primary/30 bg-primary/5 scroll-mt-6"
        >
          <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center gap-2 text-xs text-primary font-semibold">
                <Kanban className="h-4 w-4" />
                Story Deliverable di Kanban
              </div>
              <h4 className="text-sm font-bold text-foreground truncate">
                {request.linkedStory.title}
              </h4>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>
                  Progres Task: {request.linkedStory.doneTasksCount} /{" "}
                  {request.linkedStory.tasksCount} selesai
                </span>
                {request.linkedStory.tasksCount > 0 && (
                  <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{
                        width: `${Math.round(
                          (request.linkedStory.doneTasksCount /
                            request.linkedStory.tasksCount) *
                            100,
                        )}%`,
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            <Link href={`/board?divisionId=${request.toDivisionId}`}>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 text-xs shrink-0"
              >
                Lihat Board Kanban
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Brief Content Card */}
      <Card
        id="section-brief"
        className="scroll-mt-6 border-border/80 shadow-xs"
      >
        <CardHeader className="pb-3 border-b border-border/50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Rincian Brief Permohonan
            </CardTitle>
            {request.templateName ? (
              <span className="text-3xs font-mono text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded">
                Template: {request.templateName}
              </span>
            ) : (
              <span className="text-3xs text-muted-foreground bg-muted/60 px-2 py-0.5 rounded border border-border/50">
                Formulir Bebas / Umum
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {template?.fields && template.fields.length > 0 ? (
            <DynamicFormRenderer
              fields={template.fields}
              values={request.brief || {}}
              readOnly
            />
          ) : (
            <div className="space-y-4">
              {briefEntries.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">
                  Tidak ada detail brief tambahan.
                </p>
              ) : (
                briefEntries.map(([k, v]) => {
                  const valStr = String(v ?? "");
                  const isHtml = /<[a-z][\s\S]*>/i.test(valStr);
                  const isMainDescription =
                    k.toLowerCase() === "deskripsi" ||
                    k.toLowerCase() === "description";

                  return (
                    <div key={k} className="space-y-1.5">
                      {!isMainDescription && (
                        <span className="text-xs font-semibold text-muted-foreground capitalize tracking-wide block">
                          {k.replace(/_/g, " ")}:
                        </span>
                      )}
                      {isHtml ? (
                        <div
                          className="prose-notion text-sm leading-relaxed text-foreground bg-muted/10 border border-border/60 rounded-xl p-4 sm:p-5 overflow-hidden"
                          dangerouslySetInnerHTML={{ __html: valStr }}
                        />
                      ) : (
                        <div className="text-sm text-foreground bg-muted/10 border border-border/60 rounded-xl p-4 whitespace-pre-wrap leading-relaxed">
                          {valStr}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Timeline Section */}
      <Card id="section-timeline" className="scroll-mt-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">
            Riwayat Aktivitas &amp; Lifecycle
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RequestTimeline events={request.events || []} />
        </CardContent>
      </Card>

      {/* Dialogs */}
      <SubmitDraftDialog
        request={request}
        open={openSubmitDraft}
        onOpenChange={setOpenSubmitDraft}
      />
      <EditDraftDialog
        request={request}
        template={template}
        open={openEditDraft}
        onOpenChange={setOpenEditDraft}
      />
      <OriginApprovalDialog
        request={request}
        open={openOriginApproval}
        onOpenChange={setOpenOriginApproval}
      />
      <TriageDialog
        request={request}
        open={openTriage}
        onOpenChange={setOpenTriage}
      />
      <RespondInfoDialog
        request={request}
        template={template}
        open={openRespondInfo}
        onOpenChange={setOpenRespondInfo}
      />
      <ConvertToStoryDialog
        request={request}
        open={openConvertToStory}
        onOpenChange={setOpenConvertToStory}
      />
      <DeliverDialog
        request={request}
        open={openDeliver}
        onOpenChange={setOpenDeliver}
      />
      <ConfirmDialog
        request={request}
        open={openConfirm}
        onOpenChange={setOpenConfirm}
      />
      <StartRevisionDialog
        request={request}
        open={openStartRevision}
        onOpenChange={setOpenStartRevision}
      />
    </div>
  );
}
