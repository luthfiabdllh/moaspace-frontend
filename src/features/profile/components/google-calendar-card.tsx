'use client';

import * as React from 'react';
import {
  Calendar,
  CheckCircle2,
  ExternalLink,
  Loader2,
  RefreshCw,
  Unlink,
  CalendarCheck,
  BellRing,
  BookmarkCheck,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import {
  useCalendarStatus,
  useConnectCalendar,
  useToggleCalendarSync,
  useDisconnectCalendar,
  useSyncCalendarNow,
} from '@/features/calendar/api/use-calendar';

export function GoogleCalendarCard() {
  const [confirmDisconnectOpen, setConfirmDisconnectOpen] = React.useState(false);

  const { data: status, isLoading } = useCalendarStatus();
  const connectMutation = useConnectCalendar();
  const toggleMutation = useToggleCalendarSync();
  const disconnectMutation = useDisconnectCalendar();
  const syncNowMutation = useSyncCalendarNow();

  const isConnected = Boolean(status?.isConnected);
  const syncEnabled = Boolean(status?.syncEnabled);

  const handleToggle = (checked: boolean) => {
    toggleMutation.mutate({ enabled: checked });
  };

  const handleDisconnect = () => {
    disconnectMutation.mutate();
    setConfirmDisconnectOpen(false);
  };

  return (
    <>
      <Card className="shadow-xs border-border/80 overflow-hidden">
        <CardHeader className="pb-3 border-b border-border/40 bg-muted/10">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                <Calendar className="size-4.5" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  Google Calendar
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Sinkronisasi deadline tugas & permohonan ke kalender Google
                </CardDescription>
              </div>
            </div>

            {isLoading ? (
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
            ) : isConnected ? (
              <Badge
                variant="secondary"
                className="gap-1 border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[11px] font-medium"
              >
                <CheckCircle2 className="size-3" />
                Terhubung
              </Badge>
            ) : (
              <Badge variant="outline" className="text-muted-foreground text-[11px]">
                Belum Terhubung
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-4 space-y-4 text-xs">
          {isLoading ? (
            <div className="flex items-center justify-center py-6 text-muted-foreground gap-2">
              <Loader2 className="size-4 animate-spin" />
              <span>Memeriksa status integrasi kalender...</span>
            </div>
          ) : !isConnected ? (
            <div className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                Hubungkan akun Google Anda untuk menyinkronkan seluruh tenggat waktu tugas yang
                diberikan kepada Anda serta permohonan antar-divisi yang relevan.
              </p>

              {/* Feature Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                <div className="p-2.5 rounded-lg border border-border/60 bg-card/60 flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5 text-foreground font-medium">
                    <CalendarCheck className="size-3.5 text-primary shrink-0" />
                    <span>Kalender Dedikasi</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground leading-snug">
                    Kalender <strong>&ldquo;MoaSpace - Tim KKN&rdquo;</strong> terpisah dari kalender pribadi Anda.
                  </span>
                </div>

                <div className="p-2.5 rounded-lg border border-border/60 bg-card/60 flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5 text-foreground font-medium">
                    <BellRing className="size-3.5 text-amber-500 shrink-0" />
                    <span>Pengingat Otomatis</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground leading-snug">
                    Notifikasi otomatis 24 jam &amp; 1 jam sebelum tenggat waktu berakhir.
                  </span>
                </div>

                <div className="p-2.5 rounded-lg border border-border/60 bg-card/60 flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5 text-foreground font-medium">
                    <BookmarkCheck className="size-3.5 text-emerald-500 shrink-0" />
                    <span>Riwayat Selesai</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground leading-snug">
                    Tugas selesai ditandai <strong>[SELESAI]</strong> tanpa menghapus riwayat jadwal.
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  onClick={() => connectMutation.mutate()}
                  disabled={connectMutation.isPending}
                  className="w-full gap-2 font-medium bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {connectMutation.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Calendar className="size-4" />
                  )}
                  {connectMutation.isPending
                    ? 'Menghubungkan ke Google...'
                    : 'Hubungkan Google Calendar'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Connected Details */}
              <div className="rounded-lg border border-border/60 bg-muted/20 p-3 space-y-2.5">
                <div className="flex items-center justify-between py-0.5">
                  <span className="text-muted-foreground">Target Kalender</span>
                  <span className="font-semibold text-foreground">
                    {status?.calendarName || 'MoaSpace - Tim KKN'}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-t border-border/40">
                  <div>
                    <p className="font-medium text-foreground">Sinkronisasi Otomatis</p>
                    <p className="text-[11px] text-muted-foreground">
                      {syncEnabled
                        ? 'Perubahan deadline diperbarui secara langsung di Google Calendar'
                        : 'Sinkronisasi dijeda sementara'}
                    </p>
                  </div>
                  <Switch
                    checked={syncEnabled}
                    onCheckedChange={handleToggle}
                    disabled={toggleMutation.isPending}
                  />
                </div>

                {status?.updatedAt && (
                  <div className="flex items-center justify-between py-0.5 border-t border-border/40 text-[11px]">
                    <span className="text-muted-foreground">Terakhir Diperbarui</span>
                    <span className="text-muted-foreground">
                      {new Date(status.updatedAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => syncNowMutation.mutate()}
                  disabled={syncNowMutation.isPending}
                  className="gap-1.5 flex-1"
                >
                  <RefreshCw
                    className={`size-3.5 ${syncNowMutation.isPending ? 'animate-spin' : ''}`}
                  />
                  <span>
                    {syncNowMutation.isPending ? 'Menyinkronkan...' : 'Sinkronkan Sekarang'}
                  </span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="gap-1.5"
                >
                  <a
                    href="https://calendar.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="size-3.5 text-muted-foreground" />
                    <span>Buka Kalender</span>
                  </a>
                </Button>

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setConfirmDisconnectOpen(true)}
                  disabled={disconnectMutation.isPending}
                  className="gap-1.5"
                >
                  <Unlink className="size-3.5" />
                  <span>Putuskan</span>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Disconnect Confirmation Dialog */}
      <ConfirmDialog
        open={confirmDisconnectOpen}
        onOpenChange={setConfirmDisconnectOpen}
        title="Putuskan Koneksi Google Calendar?"
        description="Sinkronisasi tenggat waktu tugas dan permohonan ke akun Google Anda akan dihentikan. Kalender 'MoaSpace - Tim KKN' yang telah dibuat di Google tidak akan dihapus otomatis."
        confirmLabel={disconnectMutation.isPending ? 'Memutuskan...' : 'Putuskan Koneksi'}
        cancelLabel="Batal"
        variant="destructive"
        onConfirm={handleDisconnect}
      />
    </>
  );
}
