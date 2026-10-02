'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Plus,
  Search,
  Inbox,
  Send,
  Calendar,
  Layers,
  CheckCircle2,
  Clock,
  RotateCcw,
  X,
  FileText,
  Target,
  ChevronRight,
  GitPullRequest,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RequestStatusBadge } from './request-status-badge';
import { useRequests } from '../api/use-queries';
import { cn } from '@/lib/utils';
import type { RequestStatus } from '../types';

const STATUS_OPTIONS: { value: string; label: string; dotColor?: string }[] = [
  { value: 'ALL', label: 'Semua Status' },
  { value: 'DRAFT', label: 'Draft', dotColor: 'bg-zinc-400' },
  { value: 'WAITING_ORIGIN_APPROVAL', label: 'Menunggu Approval Asal', dotColor: 'bg-amber-500' },
  { value: 'SUBMITTED', label: 'Diajukan (Baru)', dotColor: 'bg-blue-500' },
  { value: 'NEED_INFO', label: 'Butuh Info Tambahan', dotColor: 'bg-purple-500' },
  { value: 'ACCEPTED', label: 'Diterima', dotColor: 'bg-emerald-500' },
  { value: 'IN_PROGRESS', label: 'Sedang Dikerjakan', dotColor: 'bg-sky-500' },
  { value: 'DELIVERED', label: 'Hasil Dikirim', dotColor: 'bg-indigo-500' },
  { value: 'REVISION', label: 'Perlu Revisi', dotColor: 'bg-orange-500' },
  { value: 'CONFIRMED', label: 'Selesai / Disetujui', dotColor: 'bg-emerald-600' },
  { value: 'REJECTED', label: 'Ditolak', dotColor: 'bg-rose-500' },
];

export function RequestsListContent() {
  const [direction, setDirection] = useState<'all' | 'incoming' | 'outgoing'>('all');
  const [status, setStatus] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');

  // Fetch all requests to compute live overall KPI statistics
  const { data: allRequests = [] } = useRequests({ direction: 'all' });

  // Fetch filtered requests according to active user filters
  const { data: requests, isLoading } = useRequests({
    direction,
    status: status === 'ALL' ? undefined : (status || undefined),
    search: search ? search.trim() : undefined,
  });

  // Calculate live statistics
  const metrics = useMemo(() => {
    const total = allRequests.length;
    const completed = allRequests.filter((r) => r.status === 'CONFIRMED').length;
    const needAction = allRequests.filter((r) =>
      ['WAITING_ORIGIN_APPROVAL', 'SUBMITTED', 'NEED_INFO', 'REVISION'].includes(r.status)
    ).length;
    const inProgress = allRequests.filter((r) =>
      ['ACCEPTED', 'IN_PROGRESS', 'DELIVERED'].includes(r.status)
    ).length;

    return { total, completed, needAction, inProgress };
  }, [allRequests]);

  const hasActiveFilters = Boolean(
    direction !== 'all' || (status && status !== 'ALL') || search.trim()
  );

  const handleResetFilters = () => {
    setDirection('all');
    setStatus('ALL');
    setSearch('');
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return null;
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(date);
    } catch {
      return dateStr;
    }
  };

  const getDeadlineBadge = (deadlineStr?: string | null, requestStatus?: RequestStatus) => {
    if (!deadlineStr) return null;
    if (requestStatus === 'CONFIRMED' || requestStatus === 'REJECTED') {
      return (
        <span className="flex items-center gap-1 text-muted-foreground text-2xs">
          <Calendar className="size-3" />
          <span>Deadline: {formatDate(deadlineStr)}</span>
        </span>
      );
    }

    const now = new Date();
    const deadline = new Date(deadlineStr);
    const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return (
        <span className="flex items-center gap-1 text-2xs px-2 py-0.5 rounded-md font-medium bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60">
          <AlertTriangle className="size-3 shrink-0" />
          <span>Terlewat ({formatDate(deadlineStr)})</span>
        </span>
      );
    }

    if (diffDays <= 2) {
      return (
        <span className="flex items-center gap-1 text-2xs px-2 py-0.5 rounded-md font-medium bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60">
          <Clock className="size-3 shrink-0" />
          <span>Deadline: {diffDays === 0 ? 'Hari ini' : `${diffDays} hari lagi`}</span>
        </span>
      );
    }

    return (
      <span className="flex items-center gap-1 text-muted-foreground text-2xs">
        <Calendar className="size-3" />
        <span>Deadline: {formatDate(deadlineStr)}</span>
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-2xs shrink-0">
            <GitPullRequest className="size-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              Permohonan & Kolaborasi Antar Divisi
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Kelola alur delegasi, brief tugas, dan serah terima hasil kerja lintas divisi KKN secara transparan.
            </p>
          </div>
        </div>

        <Link href="/requests/new" className="shrink-0">
          <Button className="gap-2 shadow-xs cursor-pointer">
            <Plus className="size-4" />
            <span>Buat Request Baru</span>
          </Button>
        </Link>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div
          onClick={() => {
            setDirection('all');
            setStatus('ALL');
          }}
          className={cn(
            'p-3.5 rounded-xl border bg-card shadow-2xs cursor-pointer transition-all hover:border-primary/50 hover:shadow-xs',
            direction === 'all' && status === 'ALL'
              ? 'border-primary/60 ring-1 ring-primary/20 bg-primary/5'
              : 'border-border/80'
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Semua Permohonan</span>
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <Layers className="size-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-foreground">
              {metrics.total}
            </span>
            <span className="text-2xs text-muted-foreground">total riwayat</span>
          </div>
        </div>

        <div
          onClick={() => {
            setDirection('incoming');
            setStatus('ALL');
          }}
          className={cn(
            'p-3.5 rounded-xl border bg-card shadow-2xs cursor-pointer transition-all hover:border-blue-500/50 hover:shadow-xs',
            direction === 'incoming'
              ? 'border-blue-500/60 ring-1 ring-blue-500/20 bg-blue-500/5'
              : 'border-border/80'
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Kotak Masuk</span>
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Inbox className="size-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-foreground">
              {direction === 'incoming' && requests ? requests.length : allRequests.filter(r => r.toDivisionName).length}
            </span>
            <span className="text-2xs text-muted-foreground">permohonan masuk</span>
          </div>
        </div>

        <div
          onClick={() => {
            setDirection('all');
            setStatus('SUBMITTED');
          }}
          className={cn(
            'p-3.5 rounded-xl border bg-card shadow-2xs cursor-pointer transition-all hover:border-amber-500/50 hover:shadow-xs',
            status === 'SUBMITTED'
              ? 'border-amber-500/60 ring-1 ring-amber-500/20 bg-amber-500/5'
              : 'border-border/80'
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Diajukan Baru</span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Clock className="size-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-foreground">
              {metrics.needAction}
            </span>
            <span className="text-2xs text-muted-foreground">perlu tindak lanjut</span>
          </div>
        </div>

        <div
          onClick={() => {
            setDirection('all');
            setStatus('CONFIRMED');
          }}
          className={cn(
            'p-3.5 rounded-xl border bg-card shadow-2xs cursor-pointer transition-all hover:border-emerald-500/50 hover:shadow-xs',
            status === 'CONFIRMED'
              ? 'border-emerald-500/60 ring-1 ring-emerald-500/20 bg-emerald-500/5'
              : 'border-border/80'
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Tuntas / Selesai</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-foreground">
              {metrics.completed}
            </span>
            <span className="text-2xs text-muted-foreground">hasil disetujui</span>
          </div>
        </div>
      </div>

      {/* Control Deck (Direction Pills + Search + Status Dropdown) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-2.5 rounded-xl border border-border/80 bg-card shadow-2xs">
        {/* Direction Switcher Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <span className="text-xs font-semibold text-muted-foreground px-1 shrink-0">
            Arah:
          </span>
          <button
            type="button"
            onClick={() => setDirection('all')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 border select-none cursor-pointer',
              direction === 'all'
                ? 'bg-primary text-primary-foreground border-primary shadow-xs font-semibold'
                : 'bg-background text-muted-foreground border-border/70 hover:bg-muted hover:text-foreground'
            )}
          >
            <span>Semua</span>
          </button>
          <button
            type="button"
            onClick={() => setDirection('incoming')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 border select-none cursor-pointer',
              direction === 'incoming'
                ? 'bg-primary text-primary-foreground border-primary shadow-xs font-semibold'
                : 'bg-background text-muted-foreground border-border/70 hover:bg-muted hover:text-foreground'
            )}
          >
            <Inbox className="size-3.5" />
            <span>Kotak Masuk</span>
          </button>
          <button
            type="button"
            onClick={() => setDirection('outgoing')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 border select-none cursor-pointer',
              direction === 'outgoing'
                ? 'bg-primary text-primary-foreground border-primary shadow-xs font-semibold'
                : 'bg-background text-muted-foreground border-border/70 hover:bg-muted hover:text-foreground'
            )}
          >
            <Send className="size-3.5" />
            <span>Kotak Keluar</span>
          </button>
        </div>

        {/* Search, Status Select & Reset Filters */}
        <div className="flex items-center gap-2 flex-1 md:max-w-lg justify-end">
          {/* Search Box */}
          <div className="relative flex-1 min-w-40">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Cari judul request..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-7 h-8 text-xs bg-background"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 cursor-pointer"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Status Dropdown (shadcn Select) */}
          <div className="w-44 shrink-0">
            <Select value={status} onValueChange={(val) => setStatus(val)}>
              <SelectTrigger className="h-8 text-xs bg-background border-input">
                <SelectValue placeholder="Semua Status" />
              </SelectTrigger>
              <SelectContent align="end" className="text-xs">
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value} className="text-xs cursor-pointer">
                    <div className="flex items-center gap-2">
                      {opt.dotColor && (
                        <span className={cn('size-2 rounded-full shrink-0', opt.dotColor)} />
                      )}
                      <span>{opt.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Reset Filters Button */}
          {hasActiveFilters && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleResetFilters}
              className="h-8 px-2.5 text-xs gap-1 shrink-0 text-muted-foreground hover:text-foreground cursor-pointer"
              title="Reset semua filter"
            >
              <RotateCcw className="size-3" />
              <span className="hidden sm:inline">Reset</span>
            </Button>
          )}
        </div>
      </div>

      {/* Request Cards List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-28 rounded-xl border border-border/60 bg-card p-4 sm:p-5 animate-pulse space-y-3"
            >
              <div className="flex items-center gap-2">
                <div className="h-5 w-32 bg-muted rounded-md" />
                <div className="h-5 w-24 bg-muted rounded-md" />
              </div>
              <div className="h-5 w-64 bg-muted rounded-md" />
              <div className="flex items-center gap-4">
                <div className="h-4 w-28 bg-muted rounded-md" />
                <div className="h-4 w-36 bg-muted rounded-md" />
              </div>
            </div>
          ))}
        </div>
      ) : !requests || requests.length === 0 ? (
        <Card className="border-dashed py-12 text-center bg-card">
          <CardContent className="space-y-3">
            <div className="mx-auto size-12 rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground border border-border/80">
              <Inbox className="size-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-base text-foreground">
                {hasActiveFilters
                  ? 'Tidak ada request yang sesuai filter'
                  : 'Belum Ada Permohonan Kolaborasi'}
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                {hasActiveFilters
                  ? 'Coba sesuaikan kata kunci pencarian, status, atau tab arah permohonan.'
                  : 'Mulai kolaborasi antar divisi dengan mengajukan permohonan delegasi tugas baru.'}
              </p>
            </div>
            {hasActiveFilters ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
                className="gap-1.5 mt-2 cursor-pointer text-xs"
              >
                <RotateCcw className="size-3.5" />
                <span>Reset Filter</span>
              </Button>
            ) : (
              <Link href="/requests/new">
                <Button size="sm" className="gap-1.5 mt-2 cursor-pointer text-xs">
                  <Plus className="size-4" />
                  <span>Buat Request Pertama</span>
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {requests.map((item) => {
            const initials = item.requesterName
              ? item.requesterName
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)
              : 'U';

            return (
              <Link key={item.id} href={`/requests/${item.id}`} className="block group">
                <div className="rounded-xl border border-border/70 bg-card p-4 sm:p-5 transition-all duration-200 hover:border-primary/50 hover:shadow-xs group-hover:bg-muted/15 relative">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
                    <div className="space-y-2.5 flex-1 min-w-0">
                      {/* Flow & Badges Row */}
                      <div className="flex items-center gap-2 flex-wrap text-xs">
                        {/* Division Route Flow */}
                        <div className="flex items-center gap-1.5 bg-muted/60 dark:bg-muted/30 px-2 py-0.5 rounded-md border border-border/60 text-xs">
                          <span className="font-semibold text-foreground">
                            {item.fromDivisionName}
                          </span>
                          <ArrowRight className="size-3 text-muted-foreground shrink-0" />
                          <span className="font-semibold text-primary">
                            {item.toDivisionName}
                          </span>
                        </div>

                        <RequestStatusBadge status={item.status} />

                        {item.templateName && (
                          <Badge
                            variant="outline"
                            className="text-2xs text-muted-foreground gap-1 font-normal py-0"
                          >
                            <FileText className="size-3 text-muted-foreground/70" />
                            <span>{item.templateName}</span>
                          </Badge>
                        )}

                        {item.linkedEpicId && (
                          <Badge
                            variant="outline"
                            className="text-2xs text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 gap-1 font-normal py-0"
                          >
                            <Target className="size-3 text-indigo-500" />
                            <span>Epic Terhubung</span>
                          </Badge>
                        )}
                      </div>

                      {/* Request Title */}
                      <div>
                        <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors tracking-tight line-clamp-1">
                          {item.title}
                        </h3>
                      </div>

                      {/* Requester & Timing Meta */}
                      <div className="flex items-center gap-3.5 text-xs text-muted-foreground flex-wrap pt-0.5">
                        <div className="flex items-center gap-1.5">
                          <Avatar className="size-4.5 border border-border/40">
                            <AvatarImage src={item.requesterAvatar || ''} />
                            <AvatarFallback className="text-3xs font-medium">{initials}</AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-foreground/80">{item.requesterName}</span>
                        </div>

                        <span className="text-border">•</span>

                        <span className="text-2xs text-muted-foreground">
                          Diajukan {formatDate(item.createdAt)}
                        </span>

                        {item.deadline && (
                          <>
                            <span className="text-border">•</span>
                            {getDeadlineBadge(item.deadline, item.status)}
                          </>
                        )}
                      </div>
                    </div>

                    {/* View Details Action Button */}
                    <div className="shrink-0 flex items-center justify-end sm:self-center">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs gap-1.5 border-border/80 text-muted-foreground group-hover:text-primary group-hover:border-primary/50 group-hover:bg-primary/5 transition-all shadow-2xs cursor-pointer"
                      >
                        <span>Detail Request</span>
                        <ChevronRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

