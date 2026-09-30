'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  ArrowDownAZ,
  ArrowRightLeft,
  ArrowUpDown,
  Code2,
  Filter,
  Layers,
  Loader2,
  RefreshCw,
  Search,
  Shield,
  UserPlus,
  Users,
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

import { useInfiniteActivityLogs } from '@/features/users/api/use-queries';
import type { ActivityLogItem } from '@/features/users/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export function ActivityLogsPageContent() {
  const queryClient = useQueryClient();

  // Search, filter, and sort state
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<'createdAt' | 'action' | 'actorName'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Modal inspection state
  const [selectedLogForJson, setSelectedLogForJson] = useState<ActivityLogItem | null>(null);

  // Debounce search input by 350ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Infinite query
  const {
    data,
    isLoading,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteActivityLogs({
    search: debouncedSearch || undefined,
    action: actionFilter !== 'ALL' ? actionFilter : undefined,
    sortBy,
    sortOrder,
    limit: 15,
  });

  // Flatten pages of items
  const allLogs = useMemo(() => {
    return data?.pages.flatMap((page) => page.items) ?? [];
  }, [data]);

  const totalCount = data?.pages[0]?.meta?.total ?? 0;

  // IntersectionObserver for Infinite Loading
  const observerTarget = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const target = observerTarget.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.2 },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['activity-logs'] });
  };

  // Helper description generator
  function getLogDescription(log: ActivityLogItem) {
    switch (log.action) {
      case 'USER_CREATED': {
        const name = log.after?.name || 'Anggota';
        const div = log.after?.divisionName || '';
        const role =
          log.after?.role === 'COORDINATOR'
            ? 'Koordinator'
            : log.after?.isKormanit
              ? 'Koordinator Mahasiswa Unit'
              : 'Anggota';
        return `Pendaftaran anggota baru "${name}" ${div ? `ke divisi ${div}` : ''} sebagai ${role}`;
      }
      case 'ROLE_CHANGED': {
        const div = log.after?.divisionName || log.before?.divisionName || 'divisi';
        const beforeRole = log.before?.role === 'COORDINATOR' ? 'Koordinator' : 'Anggota';
        const afterRole = log.after?.role === 'COORDINATOR' ? 'Koordinator' : 'Anggota';
        return `Ubah role di divisi ${div}: ${beforeRole} → ${afterRole}`;
      }
      case 'DIVISION_ADDED': {
        const div = log.after?.divisionName || 'divisi';
        const role = log.after?.role === 'COORDINATOR' ? 'Koordinator' : 'Anggota';
        return `Penambahan keanggotaan divisi ${div} sebagai ${role}`;
      }
      case 'DIVISION_MOVED': {
        const fromDiv = log.before?.divisionName || 'divisi asal';
        const toDiv = log.after?.divisionName || 'divisi tujuan';
        return `Pemindahan anggota dari divisi ${fromDiv} ke divisi ${toDiv}`;
      }
      case 'DIVISION_REMOVED': {
        const div = log.before?.divisionName || 'divisi';
        return `Pencabutan keanggotaan dari divisi ${div}`;
      }
      case 'GLOBAL_ROLE_CHANGED': {
        return log.after?.isKormanit
          ? 'Pemberian hak akses Koordinator Mahasiswa Unit (Akses Penuh)'
          : 'Pencabutan hak akses Koordinator Mahasiswa Unit';
      }
      case 'STATUS_UPDATED': {
        return `Perubahan status akun: ${log.before?.status || '—'} → ${log.after?.status || '—'}`;
      }
      default:
        return log.action;
    }
  }

  // Helper badge badge renderer
  function renderActionBadge(action: string) {
    switch (action) {
      case 'USER_CREATED':
        return (
          <Badge
            variant="secondary"
            className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[11px] gap-1"
          >
            <UserPlus size={11} />
            <span>Pendaftaran</span>
          </Badge>
        );
      case 'ROLE_CHANGED':
        return (
          <Badge
            variant="secondary"
            className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 text-[11px] gap-1"
          >
            <Users size={11} />
            <span>Ubah Role</span>
          </Badge>
        );
      case 'DIVISION_ADDED':
        return (
          <Badge
            variant="secondary"
            className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20 text-[11px] gap-1"
          >
            <Layers size={11} />
            <span>Tambah Divisi</span>
          </Badge>
        );
      case 'DIVISION_MOVED':
        return (
          <Badge
            variant="secondary"
            className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 text-[11px] gap-1"
          >
            <ArrowRightLeft size={11} />
            <span>Pindah Divisi</span>
          </Badge>
        );
      case 'DIVISION_REMOVED':
        return (
          <Badge variant="destructive" className="text-[11px] gap-1">
            <span>Hapus Divisi</span>
          </Badge>
        );
      case 'GLOBAL_ROLE_CHANGED':
        return (
          <Badge
            variant="secondary"
            className="bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20 text-[11px] gap-1"
          >
            <Shield size={11} />
            <span>Peran Unit</span>
          </Badge>
        );
      case 'STATUS_UPDATED':
        return (
          <Badge
            variant="secondary"
            className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[11px] gap-1"
          >
            <Activity size={11} />
            <span>Status Akun</span>
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-[11px]">
            {action}
          </Badge>
        );
    }
  }

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Activity Log (Audit Perubahan)
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Riwayat audit lengkap pencatatan mutasi penempatan anggota, perubahan peran, dan administrasi sistem dengan pencarian, filter, dan pemuatan tanpa batas (infinite loading).
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isFetching}
          className="gap-2 self-start sm:self-auto h-9 text-xs"
        >
          <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />
          <span>Segarkan Data</span>
        </Button>
      </div>

      {/* Main Filter & Search Toolbar */}
      <div className="rounded-xl border bg-card p-4 shadow-2xs space-y-3.5">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Server-Side Search */}
          <div className="md:col-span-5 relative">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              placeholder="Cari nama admin, anggota, email, atau detail aksi..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Action Filter */}
          <div className="md:col-span-3 flex items-center gap-2">
            <Filter size={14} className="text-muted-foreground shrink-0" />
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              aria-label="Filter jenis aksi"
              className="w-full h-9 rounded-md border border-input bg-background px-2.5 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="ALL">Semua Jenis Aksi</option>
              <option value="ROLE_CHANGED">Ubah Role Divisi</option>
              <option value="DIVISION_MOVED">Pindah Divisi</option>
              <option value="DIVISION_ADDED">Tambah Divisi</option>
              <option value="DIVISION_REMOVED">Hapus Divisi</option>
              <option value="USER_CREATED">Pendaftaran Anggota</option>
              <option value="GLOBAL_ROLE_CHANGED">Peran Unit (Kormanit)</option>
              <option value="STATUS_UPDATED">Ubah Status Akun</option>
            </select>
          </div>

          {/* Sort By Column */}
          <div className="md:col-span-2 flex items-center gap-1.5">
            <ArrowUpDown size={14} className="text-muted-foreground shrink-0" />
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as 'createdAt' | 'action' | 'actorName')
              }
              aria-label="Urutkan berdasarkan kolom"
              className="w-full h-9 rounded-md border border-input bg-background px-2.5 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="createdAt">Waktu</option>
              <option value="action">Jenis Aksi</option>
              <option value="actorName">Nama Aktor</option>
            </select>
          </div>

          {/* Sort Order Direction */}
          <div className="md:col-span-2 flex items-center gap-1.5">
            <ArrowDownAZ size={14} className="text-muted-foreground shrink-0" />
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
              aria-label="Arah pengurutan"
              className="w-full h-9 rounded-md border border-input bg-background px-2.5 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="desc">Terbaru (Desc)</option>
              <option value="asc">Terlama (Asc)</option>
            </select>
          </div>
        </div>

        {/* Counter & Query Status */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t">
          <span>
            Menampilkan <strong className="text-foreground">{allLogs.length}</strong> dari{' '}
            <strong className="text-foreground">{totalCount}</strong> catatan aktivitas
          </span>
          {isFetching && !isFetchingNextPage && (
            <span className="flex items-center gap-1 text-primary">
              <Loader2 size={12} className="animate-spin" />
              <span>Memperbarui data...</span>
            </span>
          )}
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-xl border bg-card shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-muted/40 text-xs font-semibold text-muted-foreground">
              <tr>
                <th scope="col" className="px-4 py-3.5">Waktu</th>
                <th scope="col" className="px-4 py-3.5">Aktor Pelaksana</th>
                <th scope="col" className="px-4 py-3.5">Aksi</th>
                <th scope="col" className="px-4 py-3.5">Deskripsi Perubahan</th>
                <th scope="col" className="px-4 py-3.5 text-right">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-muted-foreground text-xs">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 size={20} className="animate-spin text-primary" />
                      <span>Memuat activity log...</span>
                    </div>
                  </td>
                </tr>
              ) : allLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-muted-foreground text-xs">
                    Tidak ada data activity log yang sesuai dengan filter dan pencarian.
                  </td>
                </tr>
              ) : (
                allLogs.map((log) => {
                  const date = new Date(log.createdAt);
                  const formattedDate = date.toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  });
                  const formattedTime = date.toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  });

                  const actorInitials = log.actorName
                    ? log.actorName
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')
                        .toUpperCase()
                    : 'SYS';

                  return (
                    <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                      {/* Waktu */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="font-medium text-xs text-foreground">
                          {formattedDate}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {formattedTime}
                        </div>
                      </td>

                      {/* Aktor */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7 text-[10px]">
                            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                              {actorInitials}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-xs text-foreground">
                              {log.actorName || 'Sistem / Otomatis'}
                            </div>
                            {log.actorEmail && (
                              <p className="text-[11px] text-muted-foreground">
                                {log.actorEmail}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Aksi */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {renderActionBadge(log.action)}
                      </td>

                      {/* Deskripsi */}
                      <td className="px-4 py-3.5">
                        <span className="text-xs text-foreground">
                          {getLogDescription(log)}
                        </span>
                      </td>

                      {/* Data Inspector */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedLogForJson(log)}
                          className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
                          title="Lihat data teknis before/after"
                        >
                          <Code2 size={13} />
                          <span className="hidden sm:inline">Rincian</span>
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Infinite Loading Sentinel & Triggers */}
        <div ref={observerTarget} className="py-4 text-center border-t bg-muted/10">
          {isFetchingNextPage ? (
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Loader2 size={15} className="animate-spin text-primary" />
              <span>Memuat data selanjutnya...</span>
            </div>
          ) : hasNextPage ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchNextPage()}
              className="text-xs h-8"
            >
              Muat Lebih Banyak
            </Button>
          ) : allLogs.length > 0 ? (
            <span className="text-[11px] text-muted-foreground">
              Semua {totalCount} catatan aktivitas telah berhasil dimuat.
            </span>
          ) : null}
        </div>
      </div>

      {/* JSON Inspector Modal */}
      <Dialog
        open={Boolean(selectedLogForJson)}
        onOpenChange={(open) => !open && setSelectedLogForJson(null)}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">
              Rincian Data Log Audit
            </DialogTitle>
            <DialogDescription className="text-xs">
              ID Entitas: {selectedLogForJson?.entityId} ({selectedLogForJson?.entityType})
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            {selectedLogForJson?.before && (
              <div>
                <span className="font-semibold text-muted-foreground mb-1 block">
                  Data Sebelum (Before):
                </span>
                <pre className="p-2.5 rounded-md bg-muted font-mono text-[11px] overflow-x-auto max-h-48 border">
                  {JSON.stringify(selectedLogForJson.before, null, 2)}
                </pre>
              </div>
            )}

            {selectedLogForJson?.after && (
              <div>
                <span className="font-semibold text-muted-foreground mb-1 block">
                  Data Sesudah (After):
                </span>
                <pre className="p-2.5 rounded-md bg-muted font-mono text-[11px] overflow-x-auto max-h-48 border">
                  {JSON.stringify(selectedLogForJson.after, null, 2)}
                </pre>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button size="sm" onClick={() => setSelectedLogForJson(null)}>
                Tutup
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
