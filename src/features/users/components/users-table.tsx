'use client';

import { useState } from 'react';
import {
  Search,
  CheckCircle2,
  Clock,
  Send,
  Power,
  Copy,
  Check,
  UserX,
  UserCog,
} from 'lucide-react';
import { toast } from 'sonner';

import type { UserListItem, DivisionItem } from '../types';
import { useUpdateUserStatus, useResendActivation } from '../api/use-mutations';
import { ManageUserDialog } from './manage-user-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

interface UsersTableProps {
  users: UserListItem[];
  divisions: DivisionItem[];
  isLoading?: boolean;
}

export function UsersTable({ users, divisions, isLoading }: UsersTableProps) {
  const [search, setSearch] = useState('');
  const [divisionFilter, setDivisionFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal for displaying newly generated activation link
  const [resendResult, setResendResult] = useState<{
    userName: string;
    activationUrl: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [selectedUserIdForManage, setSelectedUserIdForManage] = useState<string | null>(null);
  const currentUserForManage =
    users.find((u) => u.id === selectedUserIdForManage) || null;
  const [pendingToggleStatusUser, setPendingToggleStatusUser] = useState<UserListItem | null>(null);

  const updateStatusMutation = useUpdateUserStatus();
  const resendActivationMutation = useResendActivation();

  // Filtered users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());

    const matchesDivision =
      divisionFilter === 'ALL' ||
      u.divisions.some((d) => d.divisionId === divisionFilter);

    const matchesStatus =
      statusFilter === 'ALL' || u.status === statusFilter;

    return matchesSearch && matchesDivision && matchesStatus;
  });

  const handleToggleStatus = (user: UserListItem) => {
    setPendingToggleStatusUser(user);
  };

  const confirmToggleStatus = async () => {
    if (!pendingToggleStatusUser) return;
    const newStatus = pendingToggleStatusUser.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    await updateStatusMutation.mutateAsync({
      userId: pendingToggleStatusUser.id,
      status: newStatus,
    });
    setPendingToggleStatusUser(null);
  };

  const handleResendActivation = async (user: UserListItem) => {
    try {
      const res = await resendActivationMutation.mutateAsync(user.id);
      if (res.activationUrl) {
        setResendResult({
          userName: user.name,
          activationUrl: res.activationUrl,
        });
      }
    } catch {
      // error handled in mutation
    }
  };

  const handleCopyLink = () => {
    if (!resendResult?.activationUrl) return;
    navigator.clipboard.writeText(resendResult.activationUrl);
    setCopied(true);
    toast.success('Tautan aktivasi berhasil disalin ke clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-4">
      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Cari berdasarkan nama atau email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Division Filter */}
          <Select value={divisionFilter} onValueChange={setDivisionFilter}>
            <SelectTrigger aria-label="Filter berdasarkan divisi" className="h-10 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua Divisi</SelectItem>
              {divisions.map((div) => (
                <SelectItem key={div.id} value={div.id}>
                  {div.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger aria-label="Filter berdasarkan status" className="h-10 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua Status</SelectItem>
              <SelectItem value="ACTIVE">Aktif</SelectItem>
              <SelectItem value="INACTIVE">Nonaktif</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-lg border bg-card text-card-foreground shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3.5">Anggota</th>
                <th className="px-4 py-3.5">Divisi & Role</th>
                <th className="px-4 py-3.5">Status Akun</th>
                <th className="px-4 py-3.5">Aktivasi</th>
                <th className="px-4 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-muted-foreground">
                    Memuat data anggota...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-muted-foreground">
                    <UserX className="mx-auto mb-2 h-8 w-8 text-muted-foreground/60" />
                    <p className="font-medium text-foreground">Tidak ada anggota yang cocok</p>
                    <p className="text-xs mt-1">Coba sesuaikan kata kunci pencarian atau filter Anda.</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const initials = user.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2);

                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      {/* Name & Email */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-1.5 font-medium text-foreground">
                              <span>{user.name}</span>
                              {user.isSuperAdmin && (
                                <Badge
                                  variant="secondary"
                                  className="text-[10px] px-1.5 py-0 h-4 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                                >
                                  Super Admin
                                </Badge>
                              )}
                              {user.isKormanit && (
                                <Badge
                                  variant="secondary"
                                  className="text-[10px] px-1.5 py-0 h-4 bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
                                >
                                  Koordinator Mahasiswa Unit
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Division & Role */}
                      <td className="px-4 py-3.5">
                        <div className="flex flex-wrap gap-1">
                          {user.divisions.length === 0 ? (
                            <span className="text-xs text-muted-foreground italic">—</span>
                          ) : (
                            user.divisions.map((div) => (
                              <Badge
                                key={div.divisionId}
                                variant="outline"
                                className="text-xs"
                              >
                                {div.divisionName}{' '}
                                <span className="text-muted-foreground font-normal ml-1">
                                  ({div.role === 'COORDINATOR' ? 'Koordinator' : 'Member'})
                                </span>
                              </Badge>
                            ))
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        {user.status === 'ACTIVE' ? (
                          <Badge
                            variant="secondary"
                            className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                          >
                            Aktif
                          </Badge>
                        ) : (
                          <Badge
                            variant="destructive"
                          >
                            Nonaktif
                          </Badge>
                        )}
                      </td>

                      {/* Activation Status */}
                      <td className="px-4 py-3.5">
                        {user.isActivated ? (
                          <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                            <CheckCircle2 size={14} />
                            <span>Teraktivasi</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 font-medium">
                            <Clock size={14} />
                            <span>Menunggu</span>
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Manage Divisions & Roles */}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedUserIdForManage(user.id)}
                            title="Kelola divisi, peran, dan riwayat audit"
                            className="h-8 gap-1.5 text-xs text-primary hover:text-primary hover:bg-primary/5"
                          >
                            <UserCog size={13} />
                            <span className="hidden sm:inline">Kelola Peran</span>
                          </Button>

                          {/* Resend activation link if not activated */}
                          {!user.isActivated && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleResendActivation(user)}
                              disabled={resendActivationMutation.isPending}
                              title="Terbitkan ulang tautan aktivasi"
                              className="h-8 gap-1.5 text-xs"
                            >
                              <Send size={13} />
                              <span className="hidden sm:inline">Kirim Link</span>
                            </Button>
                          )}

                          {/* Toggle Active / Inactive status */}
                          {!user.isSuperAdmin && !user.isKormanit && (
                            <Button
                              size="sm"
                              variant={user.status === 'ACTIVE' ? 'ghost' : 'outline'}
                              onClick={() => handleToggleStatus(user)}
                              disabled={updateStatusMutation.isPending}
                              title={
                                user.status === 'ACTIVE'
                                  ? 'Nonaktifkan akun'
                                  : 'Aktifkan akun'
                              }
                              className={
                                user.status === 'ACTIVE'
                                  ? 'h-8 text-destructive hover:text-destructive hover:bg-destructive/10'
                                  : 'h-8 text-emerald-600 hover:text-emerald-600 hover:bg-emerald-50'
                              }
                            >
                              <Power size={14} />
                              <span className="hidden sm:inline">
                                {user.status === 'ACTIVE' ? 'Nonaktifkan' : 'Aktifkan'}
                              </span>
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resend Activation Result Dialog */}
      <Dialog
        open={!!resendResult}
        onOpenChange={(open) => {
          if (!open) {
            setResendResult(null);
            setCopied(false);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tautan Aktivasi Diterbitkan</DialogTitle>
            <DialogDescription>
              Tautan aktivasi baru telah dibuat untuk{' '}
              <span className="font-semibold text-foreground">
                {resendResult?.userName}
              </span>
              . Tautan ini berlaku selama 7 hari.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="flex items-center gap-2">
              <Input
                readOnly
                value={resendResult?.activationUrl || ''}
                className="text-xs font-mono bg-background"
              />
              <Button
                size="icon"
                variant="outline"
                onClick={handleCopyLink}
                aria-label="Salin tautan aktivasi"
                className="shrink-0"
              >
                {copied ? (
                  <Check size={14} className="text-green-600" />
                ) : (
                  <Copy size={14} />
                )}
              </Button>
            </div>

            <div className="flex justify-end pt-2">
              <Button onClick={() => setResendResult(null)}>Selesai</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Manage User Role & Division Dialog */}
      <ManageUserDialog
        user={currentUserForManage}
        divisions={divisions}
        isOpen={Boolean(currentUserForManage)}
        onClose={() => setSelectedUserIdForManage(null)}
      />

      {/* Toggle Status Confirmation */}
      <ConfirmDialog
        open={Boolean(pendingToggleStatusUser)}
        onOpenChange={(isOpen) => !isOpen && setPendingToggleStatusUser(null)}
        title={
          pendingToggleStatusUser?.status === 'ACTIVE'
            ? 'Nonaktifkan Akun Ini?'
            : 'Aktifkan Kembali Akun Ini?'
        }
        description={
          pendingToggleStatusUser?.status === 'ACTIVE'
            ? `Apakah Anda yakin ingin menonaktifkan akun ${pendingToggleStatusUser?.name}? Pengguna ini akan dikeluarkan dari semua sesi aktif.`
            : `Aktifkan kembali akun ${pendingToggleStatusUser?.name}?`
        }
        variant={pendingToggleStatusUser?.status === 'ACTIVE' ? 'destructive' : 'default'}
        onConfirm={confirmToggleStatus}
      />
    </div>
  );
}
