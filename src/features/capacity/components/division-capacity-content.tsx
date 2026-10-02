'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Gauge,
  HelpCircle,
  PlusCircle,
  ShieldAlert,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useDivisions } from '@/features/divisions/api/use-queries';
import { useCurrentUser } from '@/features/auth/api/use-queries';
import { useDivisionCapacities, useMyCapacity } from '../api/use-queries';
import { UtilizationBadge, getUtilizationColor } from './utilization-badge';
import { RequestCapacityDialog } from './request-capacity-dialog';
import { ReviewCapacityDialog } from './review-capacity-dialog';
import type { MemberUtilization } from '../types';

interface DivisionCapacityContentProps {
  slug: string;
  hideHeader?: boolean;
}

export const DivisionCapacityContent: React.FC<DivisionCapacityContentProps> = ({
  slug,
  hideHeader = false,
}) => {
  const router = useRouter();
  const { data: user } = useCurrentUser();
  const { data: divisions = [], isLoading: isDivisionsLoading } = useDivisions();

  const division = React.useMemo(() => {
    return divisions.find((d) => d.slug === slug || d.id === slug);
  }, [divisions, slug]);

  // Pekan saat ini (Senin format YYYY-MM-DD)
  const [weekOffset, setWeekOffset] = React.useState<number>(0);

  const selectedWeekStart = React.useMemo(() => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff + weekOffset * 7);
    return d.toISOString().split('T')[0] ?? '';
  }, [weekOffset]);

  const weekDateRangeLabel = React.useMemo(() => {
    const start = new Date(selectedWeekStart);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    const startStr = start.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
    });
    const endStr = end.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    return `${startStr} – ${endStr}`;
  }, [selectedWeekStart]);

  const {
    data: capacities = [],
    isLoading: isCapacitiesLoading,
    refetch,
  } = useDivisionCapacities(division?.id, selectedWeekStart);

  const { data: myCapacity } = useMyCapacity();

  // State untuk dialog
  const [requestDialogOpen, setRequestDialogOpen] = React.useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = React.useState(false);
  const [selectedMemberForReview, setSelectedMemberForReview] =
    React.useState<MemberUtilization | null>(null);

  // Wewenang
  const isGlobalAdmin = Boolean(user?.isSuperAdmin || user?.isKormanit);
  const isCoordinator = React.useMemo(() => {
    if (isGlobalAdmin) return true;
    if (!division || !user) return false;
    return user.divisions?.some(
      (m: { divisionId: string; role: string }) => m.divisionId === division.id && m.role === 'COORDINATOR'
    );
  }, [isGlobalAdmin, division, user]);


  // Metrik agregat
  const totalCapacitySp = capacities.reduce((acc, c) => acc + c.capacitySp, 0);
  const totalActiveSp = capacities.reduce((acc, c) => acc + c.activeSp, 0);
  const avgUtilization =
    totalCapacitySp > 0 ? Math.round((totalActiveSp / totalCapacitySp) * 100) : 0;

  const overloadCount = capacities.filter((c) => c.status === 'OVERLOAD').length;
  const warningCount = capacities.filter((c) => c.status === 'WARNING').length;
  const normalCount = capacities.filter((c) => c.status === 'NORMAL').length;
  const pendingRequests = capacities.filter((c) => c.requestStatus === 'PENDING');

  if (isDivisionsLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  if (!division) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed bg-muted/20">
        <p className="text-muted-foreground text-sm">Divisi tidak ditemukan.</p>
        <Button variant="link" onClick={() => router.push('/board')}>
          Kembali ke Papan
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ─── Header & Navigasi Divisi (Only shown when not embedded) ────────── */}
      {!hideHeader && (
        <>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <Link href={`/board?division=${division.slug}`} className="hover:underline">
                  {division.name}
                </Link>
                <span>/</span>
                <span className="text-foreground font-medium">Kapasitas & Beban Kerja</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight">Kapasitas & Beban Tim</h1>
              <p className="text-xs text-muted-foreground">
                Transparansi alokasi Story Point dan utilisasi anggota divisi lintas tugas.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRequestDialogOpen(true)}
                className="gap-1.5 text-xs h-9"
              >
                <Clock className="h-3.5 w-3.5" />
                Ajukan Penyesuaian Kapasitas
              </Button>
            </div>
          </div>
        </>
      )}

      {/* ─── Kontrol Pekan (Week Selector) ─────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card p-3 rounded-xl border border-border/80 shadow-2xs">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold">Pekan:</span>
          <span className="text-sm text-foreground bg-background px-2.5 py-1 rounded-md border shadow-2xs font-medium">
            {weekDateRangeLabel}
          </span>
          {weekOffset === 0 && (
            <span className="text-2xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">
              Minggu Ini
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {hideHeader && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRequestDialogOpen(true)}
              className="gap-1.5 text-xs h-8 shadow-2xs"
            >
              <Clock className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Ajukan Penyesuaian</span>
              <span className="sm:hidden">Ajukan</span>
            </Button>
          )}

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setWeekOffset((prev) => prev - 1)}
            title="Pekan Sebelumnya"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {weekOffset !== 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs"
              onClick={() => setWeekOffset(0)}
            >
              Reset ke Minggu Ini
            </Button>
          )}
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setWeekOffset((prev) => prev + 1)}
            title="Pekan Berikutnya"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>

      {/* ─── Kartu Statistik Ringkasan ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Total Kapasitas Divisi
            </CardTitle>
            <Gauge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCapacitySp} SP</div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Dari {capacities.length} anggota aktif
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Beban Kerja Aktif
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalActiveSp} SP</div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Task status To Do, In Progress, & Review
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Utilisasi Rata-rata
            </CardTitle>
            <div className="h-2 w-2 rounded-full bg-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgUtilization}%</div>
            <p className="text-[11px] text-muted-foreground mt-1">
              {avgUtilization > 100
                ? 'Beban tim melampaui kapasitas'
                : avgUtilization >= 70
                  ? 'Beban tim optimal'
                  : 'Kapasitas tim masih lapang'}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Status Beban Anggota
            </CardTitle>
            <ShieldAlert className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1.5 text-xs font-medium">
              <span className="text-rose-600 dark:text-rose-400 font-bold">
                {overloadCount} Overload
              </span>
              <span>·</span>
              <span className="text-amber-600 dark:text-amber-400 font-bold">
                {warningCount} Sibuk
              </span>
              <span>·</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                {normalCount} Lapang
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              {pendingRequests.length > 0
                ? `${pendingRequests.length} pengajuan kapasitas menunggu review`
                : 'Tidak ada pengajuan tertunda'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ─── Daftar Anggota & Utilisasi Beban ───────────────────────────────── */}
      <Card className="shadow-xs">
        <CardHeader className="pb-3 border-b">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base font-semibold">
                Beban Kerja Anggota ({capacities.length} Orang)
              </CardTitle>
              <CardDescription className="text-xs">
                Perhitungan beban aktif dihitung lintas seluruh divisi yang diikuti anggota.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isCapacitiesLoading ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : capacities.length === 0 ? (
            <div className="p-12 text-center text-sm text-muted-foreground">
              Belum ada anggota yang terdaftar di divisi ini.
            </div>
          ) : (
            <div className="divide-y">
              {capacities.map((item) => {
                const colors = getUtilizationColor(item.utilizationPercentage);
                const isOver = item.utilizationPercentage > 100;
                const isMe = user?.id === item.userId;

                return (
                  <div
                    key={item.userId}
                    className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-muted/20 transition-colors"
                  >
                    {/* Profil Anggota */}
                    <div className="flex items-center gap-3 min-w-60">
                      <Avatar className="h-10 w-10 border">
                        <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                          {item.userName
                            .split(' ')
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join('')
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-sm">{item.userName}</span>
                          {isMe && (
                            <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.2 rounded font-medium">
                              Anda
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">{item.userEmail}</span>
                      </div>
                    </div>

                    {/* Progress Bar Utilisasi */}
                    <div className="flex-1 max-w-md space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">
                          Beban: <strong>{item.activeSp} SP</strong> / {item.capacitySp} SP
                        </span>
                        <UtilizationBadge
                          percentage={item.utilizationPercentage}
                          showText={false}
                          size="sm"
                        />
                      </div>

                      {/* Progress Bar Container */}
                      <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden relative">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${colors.barBg}`}
                          style={{
                            width: `${Math.min(item.utilizationPercentage, 100)}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Status & Aksi Review */}
                    <div className="flex items-center justify-between md:justify-end gap-3 min-w-50">
                      <div className="text-right">
                        {item.requestStatus === 'PENDING' ? (
                          <div className="flex flex-col items-end">
                            <span className="inline-flex items-center gap-1 rounded bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-600 dark:text-amber-400 border border-amber-500/20">
                              Minta {item.requestedSp} SP
                            </span>
                            {item.note && (
                              <span className="text-[10px] text-muted-foreground truncate max-w-37.5">
                                "{item.note}"
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            {item.status === 'OVERLOAD'
                              ? '⚠️ Overload'
                              : item.status === 'WARNING'
                                ? 'Sibuk'
                                : 'Tersedia'}
                          </span>
                        )}
                      </div>


                      {/* Tombol Tinjau untuk Koordinator */}
                      {isCoordinator && item.requestStatus === 'PENDING' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs font-medium"
                          onClick={() => {
                            setSelectedMemberForReview(item);
                            setReviewDialogOpen(true);
                          }}
                        >
                          Tinjau
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ─── Modals ────────────────────────────────────────────────────────── */}
      <RequestCapacityDialog
        open={requestDialogOpen}
        onOpenChange={setRequestDialogOpen}
        myCapacity={myCapacity}
      />

      <ReviewCapacityDialog
        open={reviewDialogOpen}
        onOpenChange={setReviewDialogOpen}
        member={selectedMemberForReview}
      />
    </div>
  );
};
