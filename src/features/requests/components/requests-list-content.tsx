"use client"
import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RequestStatusBadge } from './request-status-badge';
import { useRequests } from '../api/use-queries';
import {
  ArrowRight,
  Plus,
  Search,
  Inbox,
  Send,
  Calendar,
  Layers,
  Sparkles,
  Filter,
} from 'lucide-react';

export function RequestsListContent() {
  const [direction, setDirection] = useState<'all' | 'incoming' | 'outgoing'>('all');
  const [status, setStatus] = useState<string>('');
  const [search, setSearch] = useState<string>('');

  const { data: requests, isLoading } = useRequests({
    direction,
    status: status || undefined,
    search: search || undefined,
  });

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return null;
    try {
      return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(dateStr));
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Layers className="h-6 w-6 text-primary" />
            Kolaborasi & Request Antar Divisi
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Kelola permohonan bantuan tugas dan kebutuhan lintas divisi dengan alur terstruktur.
          </p>
        </div>

        <Link href="/requests/new">
          <Button className="gap-2 shrink-0">
            <Plus className="h-4 w-4" />
            Buat Request Baru
          </Button>
        </Link>
      </div>

      {/* Tabs and Filters */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Direction Tabs */}
        <div className="flex items-center rounded-lg border bg-muted/40 p-1 text-xs font-medium">
          <button
            type="button"
            onClick={() => setDirection('all')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
              direction === 'all'
                ? 'bg-background text-foreground shadow-xs font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Semua
          </button>
          <button
            type="button"
            onClick={() => setDirection('incoming')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
              direction === 'incoming'
                ? 'bg-background text-foreground shadow-xs font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Inbox className="h-3.5 w-3.5 text-blue-500" />
            Kotak Masuk
          </button>
          <button
            type="button"
            onClick={() => setDirection('outgoing')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
              direction === 'outgoing'
                ? 'bg-background text-foreground shadow-xs font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Send className="h-3.5 w-3.5 text-emerald-500" />
            Kotak Keluar
          </button>
        </div>

        {/* Search & Status Filter */}
        <div className="flex items-center gap-2 flex-1 md:max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari judul request..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9 text-xs"
            />
          </div>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-9 rounded-lg border border-input bg-transparent px-2.5 py-1 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:bg-zinc-900"
          >
            <option value="">Semua Status</option>
            <option value="WAITING_ORIGIN_APPROVAL">Approval Asal</option>
            <option value="SUBMITTED">Diajukan</option>
            <option value="NEED_INFO">Butuh Info</option>
            <option value="ACCEPTED">Diterima</option>
            <option value="IN_PROGRESS">Pengerjaan</option>
            <option value="DELIVERED">Hasil Dikirim</option>
            <option value="REVISION">Revisi</option>
            <option value="CONFIRMED">Selesai</option>
            <option value="REJECTED">Ditolak</option>
          </select>
        </div>
      </div>

      {/* Request Cards List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-28 rounded-xl border bg-card/60 animate-pulse"
            />
          ))}
        </div>
      ) : !requests || requests.length === 0 ? (
        <Card className="border-dashed py-12 text-center">
          <CardContent className="space-y-3">
            <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
              <Inbox className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-foreground">Belum ada request ditemukan</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                {search || status || direction !== 'all'
                  ? 'Tidak ada permohonan yang sesuai dengan filter pencarian.'
                  : 'Mulai kolaborasi antar divisi dengan mengajukan permohonan request baru.'}
              </p>
            </div>
            <Link href="/requests/new">
              <Button size="sm" className="gap-1.5 mt-2">
                <Plus className="h-4 w-4" />
                Buat Request Pertama
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {requests.map((item) => {
            const formattedDeadline = formatDate(item.deadline);
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
                <Card className="transition-all hover:border-primary/50 hover:shadow-xs group-hover:bg-muted/10">
                  <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-2 flex-1 min-w-0">
                      {/* Division route badge & status */}
                      <div className="flex items-center gap-2 flex-wrap text-xs">
                        <span className="font-medium text-foreground bg-muted px-2 py-0.5 rounded border border-border/50">
                          {item.fromDivisionName}
                        </span>
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        <span className="font-medium text-foreground bg-muted px-2 py-0.5 rounded border border-border/50">
                          {item.toDivisionName}
                        </span>
                        <RequestStatusBadge status={item.status} />
                        {item.templateName && (
                          <span className="text-[11px] text-muted-foreground">
                            • {item.templateName}
                          </span>
                        )}
                      </div>

                      {/* Request Title */}
                      <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                        {item.title}
                      </h3>

                      {/* Requester & Deadline Info */}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <Avatar className="h-4 w-4">
                            <AvatarImage src={item.requesterAvatar || ''} />
                            <AvatarFallback className="text-[9px]">{initials}</AvatarFallback>
                          </Avatar>
                          <span>{item.requesterName}</span>
                        </div>

                        {formattedDeadline && (
                          <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>Deadline: {formattedDeadline}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* View Details Chevron */}
                    <div className="shrink-0 flex items-center justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1 text-xs text-primary group-hover:bg-primary group-hover:text-primary-foreground"
                      >
                        Buka Detail
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
