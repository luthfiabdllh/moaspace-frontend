'use client';

import { useState } from 'react';
import {
  ArrowRightLeft,
  Calendar,
  CheckCircle2,
  Clock,
  History,
  Loader2,
  Plus,
  Shield,
  Trash2,
  UserCheck,
  UserMinus,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';

import type { UserListItem, DivisionItem, ActivityLogItem } from '../types';
import {
  useAddUserDivision,
  useMoveUserDivision,
  useRemoveUserDivision,
  useUpdateUserDivisionRole,
  useUpdateUserGlobalRole,
} from '../api/use-mutations';
import { useActivityLogs } from '../api/use-queries';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

interface ManageUserDialogProps {
  user: UserListItem | null;
  divisions: DivisionItem[];
  isOpen: boolean;
  onClose: () => void;
}

export function ManageUserDialog({
  user,
  divisions,
  isOpen,
  onClose,
}: ManageUserDialogProps) {
  const [activeTab, setActiveTab] = useState<'manage' | 'logs'>('manage');

  // Form states for adding to division
  const [newDivisionId, setNewDivisionId] = useState('');
  const [newDivisionRole, setNewDivisionRole] = useState<'MEMBER' | 'COORDINATOR'>('MEMBER');

  // Move division inline state
  const [movingDivisionId, setMovingDivisionId] = useState<string | null>(null);
  const [targetDivisionId, setTargetDivisionId] = useState('');

  // Confirm dialog state (ganti window.confirm)
  const [pendingRemoveDivision, setPendingRemoveDivision] = useState<{
    divisionId: string;
    divisionName: string;
  } | null>(null);
  const [isKormanitConfirmOpen, setIsKormanitConfirmOpen] = useState(false);

  // Mutations
  const addDivisionMutation = useAddUserDivision();
  const updateRoleMutation = useUpdateUserDivisionRole();
  const removeDivisionMutation = useRemoveUserDivision();
  const moveDivisionMutation = useMoveUserDivision();
  const updateGlobalRoleMutation = useUpdateUserGlobalRole();

  // Activity logs query
  const { data: logs, isLoading: isLoadingLogs } = useActivityLogs(
    'USER',
    user?.id,
  );

  if (!user) return null;

  // Divisions user is not currently in
  const unassignedDivisions = divisions.filter(
    (d) => !user.divisions.some((ud) => ud.divisionId === d.id),
  );

  // Handle adding to a new division
  const handleAddDivision = async () => {
    if (!newDivisionId) {
      toast.error('Pilih divisi yang ingin ditambahkan.');
      return;
    }
    await addDivisionMutation.mutateAsync({
      userId: user.id,
      payload: {
        divisionId: newDivisionId,
        role: newDivisionRole,
      },
    });
    setNewDivisionId('');
    setNewDivisionRole('MEMBER');
  };

  // Handle updating role in a division
  const handleUpdateRole = async (
    divisionId: string,
    role: 'MEMBER' | 'COORDINATOR',
  ) => {
    await updateRoleMutation.mutateAsync({
      userId: user.id,
      divisionId,
      payload: { role },
    });
  };

  // Handle removing from a division
  const handleRemoveDivision = (divisionId: string, divisionName: string) => {
    setPendingRemoveDivision({ divisionId, divisionName });
  };

  const confirmRemoveDivision = async () => {
    if (!pendingRemoveDivision) return;
    await removeDivisionMutation.mutateAsync({
      userId: user.id,
      divisionId: pendingRemoveDivision.divisionId,
    });
    setPendingRemoveDivision(null);
  };

  // Handle moving from one division to another
  const handleMoveDivision = async (fromDivisionId: string) => {
    if (!targetDivisionId) {
      toast.error('Pilih divisi tujuan pemindahan.');
      return;
    }

    await moveDivisionMutation.mutateAsync({
      userId: user.id,
      payload: {
        fromDivisionId,
        toDivisionId: targetDivisionId,
      },
    });

    setMovingDivisionId(null);
    setTargetDivisionId('');
  };

  // Handle toggling Koordinator Mahasiswa Unit
  const handleToggleKormanit = () => {
    setIsKormanitConfirmOpen(true);
  };

  const confirmToggleKormanit = async () => {
    const newKormanitState = !user.isKormanit;
    await updateGlobalRoleMutation.mutateAsync({
      userId: user.id,
      payload: { isKormanit: newKormanitState },
    });
    setIsKormanitConfirmOpen(false);
  };

  // Helper to render action label in activity log
  const renderLogDescription = (log: ActivityLogItem) => {
    switch (log.action) {
      case 'USER_CREATED':
        return 'Anggota didaftarkan ke dalam sistem';
      case 'ROLE_CHANGED':
        return `Perubahan peran di divisi ${log.after?.divisionName || 'divisi'}: ${log.before?.role === 'COORDINATOR' ? 'Koordinator' : 'Anggota'} → ${log.after?.role === 'COORDINATOR' ? 'Koordinator' : 'Anggota'}`;
      case 'DIVISION_ADDED':
        return `Ditambahkan ke divisi ${log.after?.divisionName || 'divisi'} sebagai ${log.after?.role === 'COORDINATOR' ? 'Koordinator' : 'Anggota'}`;
      case 'DIVISION_MOVED':
        return `Dipindahkan dari divisi ${log.before?.divisionName || 'divisi'} ke ${log.after?.divisionName || 'divisi'}`;
      case 'DIVISION_REMOVED':
        return `Dihapus dari keanggotaan divisi ${log.before?.divisionName || 'divisi'}`;
      case 'GLOBAL_ROLE_CHANGED':
        return log.after?.isKormanit
          ? 'Diberikan peran Koordinator Mahasiswa Unit (Akses Penuh)'
          : 'Peran Koordinator Mahasiswa Unit dicabut';
      case 'STATUS_UPDATED':
        return `Status akun diubah: ${log.before?.status || '—'} → ${log.after?.status || '—'}`;
      default:
        return log.action;
    }
  };

  return (
    <>
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle className="text-xl font-bold">
              Kelola Divisi & Peran Anggota
            </DialogTitle>
          </div>
          <DialogDescription>
            Pindahkan anggota, ubah peran divisi, kelola multi-keanggotaan divisi, dan pantau riwayat audit perubahan.
          </DialogDescription>
        </DialogHeader>

        {/* User Summary Card */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 rounded-lg border bg-muted/30 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground text-base">
                {user.name}
              </span>
              {user.isSuperAdmin && (
                <Badge
                  variant="secondary"
                  className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-xs"
                >
                  Super Admin
                </Badge>
              )}
              {user.isKormanit && (
                <Badge
                  variant="secondary"
                  className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 text-xs"
                >
                  Koordinator Mahasiswa Unit
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{user.email}</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b text-sm font-medium gap-4">
          <button
            type="button"
            onClick={() => setActiveTab('manage')}
            className={`pb-2.5 flex items-center gap-1.5 transition-colors border-b-2 -mb-0.5 ${
              activeTab === 'manage'
                ? 'border-primary text-primary font-semibold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Users size={15} />
            <span>Keanggotaan Divisi & Peran</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('logs')}
            className={`pb-2.5 flex items-center gap-1.5 transition-colors border-b-2 -mb-0.5 ${
              activeTab === 'logs'
                ? 'border-primary text-primary font-semibold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <History size={15} />
            <span>Activity Log (Audit Perubahan)</span>
          </button>
        </div>

        {/* TAB 1: MANAGE DIVISIONS */}
        {activeTab === 'manage' && (
          <div className="space-y-6 pt-1">
            {/* Global Role Koordinator Mahasiswa Unit */}
            {!user.isSuperAdmin && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 rounded-lg border bg-muted/20 gap-2.5">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 font-medium text-sm text-foreground">
                    <Shield size={15} className="text-purple-600" />
                    <span>Peran Koordinator Mahasiswa Unit</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Akses penuh lintas divisi setara Super Admin untuk manajemen anggota & kegiatan unit.
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant={user.isKormanit ? 'outline' : 'secondary'}
                  onClick={handleToggleKormanit}
                  disabled={updateGlobalRoleMutation.isPending}
                  className="h-8 text-xs shrink-0"
                >
                  {updateGlobalRoleMutation.isPending ? (
                    <Loader2 size={13} className="animate-spin mr-1" />
                  ) : null}
                  {user.isKormanit ? 'Cabut Akses Koordinator Unit' : 'Jadikan Koordinator Mahasiswa Unit'}
                </Button>
              </div>
            )}

            {/* Current Divisions List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">
                  Divisi Saat Ini ({user.divisions.length})
                </Label>
                <span className="text-[11px] text-muted-foreground">
                  Satu anggota dapat memiliki lebih dari satu divisi dengan role berbeda
                </span>
              </div>

              {user.divisions.length === 0 ? (
                <div className="text-center py-6 border border-dashed rounded-lg text-muted-foreground text-sm">
                  Pengguna belum ditempatkan pada divisi manapun.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {user.divisions.map((div) => {
                    const isMoving = movingDivisionId === div.divisionId;
                    return (
                      <div
                        key={div.divisionId}
                        className="p-3 rounded-lg border bg-card flex flex-col gap-2.5 transition-all"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <span className="font-medium text-sm text-foreground">
                              {div.divisionName}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Role Selector */}
                            <select
                              value={div.role}
                              onChange={(e) =>
                                handleUpdateRole(
                                  div.divisionId,
                                  e.target.value as 'MEMBER' | 'COORDINATOR',
                                )
                              }
                              disabled={updateRoleMutation.isPending}
                              className="h-8 rounded-md border border-input bg-background px-2.5 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring font-medium"
                            >
                              <option value="MEMBER">Anggota Divisi</option>
                              <option value="COORDINATOR">Koordinator Divisi</option>
                            </select>

                            {/* Move button */}
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setMovingDivisionId(isMoving ? null : div.divisionId);
                                setTargetDivisionId('');
                              }}
                              className="h-8 text-xs gap-1"
                              title="Pindahkan anggota ke divisi lain"
                            >
                              <ArrowRightLeft size={13} />
                              <span>Pindah</span>
                            </Button>

                            {/* Remove button */}
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                handleRemoveDivision(div.divisionId, div.divisionName)
                              }
                              disabled={
                                removeDivisionMutation.isPending ||
                                (user.divisions.length <= 1 &&
                                  !user.isSuperAdmin &&
                                  !user.isKormanit)
                              }
                              title={
                                user.divisions.length <= 1 &&
                                !user.isSuperAdmin &&
                                !user.isKormanit
                                  ? 'Anggota harus memiliki minimal 1 divisi. Gunakan fitur Pindah untuk mengganti divisi.'
                                  : 'Hapus keanggotaan divisi ini'
                              }
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </div>

                        {/* Inline Move Panel */}
                        {isMoving && (
                          <div className="pt-2 border-t mt-1 flex flex-col sm:flex-row items-start sm:items-center gap-2 bg-muted/40 p-2.5 rounded-md">
                            <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                              Pindahkan ke:
                            </span>
                            <select
                              value={targetDivisionId}
                              onChange={(e) => setTargetDivisionId(e.target.value)}
                              className="h-8 flex-1 rounded-md border border-input bg-background px-2.5 text-xs shadow-xs"
                            >
                              <option value="">-- Pilih Divisi Tujuan --</option>
                              {divisions
                                .filter((d) => d.id !== div.divisionId)
                                .map((d) => (
                                  <option key={d.id} value={d.id}>
                                    {d.name}
                                  </option>
                                ))}
                            </select>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <Button
                                size="sm"
                                onClick={() => handleMoveDivision(div.divisionId)}
                                disabled={!targetDivisionId || moveDivisionMutation.isPending}
                                className="h-8 text-xs"
                              >
                                {moveDivisionMutation.isPending ? (
                                  <Loader2 size={13} className="animate-spin mr-1" />
                                ) : null}
                                Konfirmasi Pindah
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setMovingDivisionId(null)}
                                className="h-8 text-xs"
                              >
                                Batal
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Add to Another Division */}
            <div className="p-4 rounded-lg border border-dashed bg-muted/20 space-y-3">
              <Label className="text-sm font-semibold flex items-center gap-1.5">
                <Plus size={15} className="text-primary" />
                <span>Tambahkan ke Divisi Lain</span>
              </Label>

              {unassignedDivisions.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  Anggota ini telah terdaftar di seluruh divisi yang tersedia.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
                  <div className="sm:col-span-6 space-y-1">
                    <Label htmlFor="add-div-select" className="text-xs text-muted-foreground">
                      Pilih Divisi
                    </Label>
                    <select
                      id="add-div-select"
                      value={newDivisionId}
                      onChange={(e) => setNewDivisionId(e.target.value)}
                      className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      <option value="">-- Pilih Divisi Baru --</option>
                      {unassignedDivisions.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-4 space-y-1">
                    <Label htmlFor="add-role-select" className="text-xs text-muted-foreground">
                      Role di Divisi
                    </Label>
                    <select
                      id="add-role-select"
                      value={newDivisionRole}
                      onChange={(e) =>
                        setNewDivisionRole(e.target.value as 'MEMBER' | 'COORDINATOR')
                      }
                      className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      <option value="MEMBER">Anggota Divisi</option>
                      <option value="COORDINATOR">Koordinator Divisi</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <Button
                      type="button"
                      onClick={handleAddDivision}
                      disabled={!newDivisionId || addDivisionMutation.isPending}
                      className="w-full h-9 text-xs"
                    >
                      {addDivisionMutation.isPending ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        'Tambah'
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: ACTIVITY LOG (AUDIT TRAIL) */}
        {activeTab === 'logs' && (
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Mencatat setiap mutasi status, peran divisi, pemindahan divisi, dan hak akses koordinator mahasiswa unit.
              </span>
            </div>

            {isLoadingLogs ? (
              <div className="flex items-center justify-center py-10 text-muted-foreground gap-2">
                <Loader2 size={16} className="animate-spin" />
                <span className="text-xs">Memuat riwayat aktivitas...</span>
              </div>
            ) : !logs || logs.length === 0 ? (
              <div className="text-center py-10 border border-dashed rounded-lg text-muted-foreground text-xs">
                Belum ada catatan aktivitas untuk anggota ini.
              </div>
            ) : (
              <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-muted-foreground/20">
                {logs.map((log) => {
                  const date = new Date(log.createdAt);
                  const formattedDate = date.toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <div key={log.id} className="relative group">
                      {/* Timeline dot */}
                      <div className="absolute -left-5.75 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-background bg-primary/80 group-hover:bg-primary transition-colors" />

                      <div className="p-3 rounded-lg border bg-card text-xs space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-foreground">
                            {renderLogDescription(log)}
                          </span>
                          <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                            {formattedDate}
                          </span>
                        </div>

                        {log.actorName && (
                          <p className="text-[11px] text-muted-foreground">
                            Dilakukan oleh:{' '}
                            <span className="font-medium text-foreground">
                              {log.actorName}
                            </span>{' '}
                            ({log.actorEmail})
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>

    <ConfirmDialog
      open={Boolean(pendingRemoveDivision)}
      onOpenChange={(isOpen) => !isOpen && setPendingRemoveDivision(null)}
      title="Keluarkan dari Divisi?"
      description={`${user.name} akan dikeluarkan dari divisi ${pendingRemoveDivision?.divisionName || ''}.`}
      variant="destructive"
      confirmLabel="Keluarkan"
      onConfirm={confirmRemoveDivision}
    />

    <ConfirmDialog
      open={isKormanitConfirmOpen}
      onOpenChange={setIsKormanitConfirmOpen}
      title={user.isKormanit ? 'Cabut Akses Kormanit?' : 'Berikan Akses Kormanit?'}
      description={
        user.isKormanit
          ? `Cabut akses Koordinator Mahasiswa Unit dari ${user.name}?`
          : `Berikan hak akses Koordinator Mahasiswa Unit kepada ${user.name}? Pengguna ini akan memiliki akses penuh setara Super Admin.`
      }
      variant={user.isKormanit ? 'destructive' : 'default'}
      onConfirm={confirmToggleKormanit}
    />
    </>
  );
}
