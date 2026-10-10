'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  UserCheck,
  UserX,
  UserPlus,
  ShieldCheck,
  Crown,
  MapPin,
  Loader2,
  Users as UsersIcon,
} from 'lucide-react';
import { useSubunitDetail } from '../api/use-queries';
import {
  useAddSubunitMember,
  useUpdateSubunitMemberRole,
  useRemoveSubunitMember,
} from '../api/use-mutations';
import { useUsers } from '@/features/users/api/use-queries';
import { ClusterBadge } from './cluster-badge';
import type { SubunitItem, SubunitRole } from '../types';

interface ManageSubunitDialogProps {
  subunit: SubunitItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canManage: boolean;
}

export function ManageSubunitDialog({
  subunit,
  open,
  onOpenChange,
  canManage,
}: ManageSubunitDialogProps) {
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<SubunitRole>('MEMBER');

  const { data: detail, isLoading: isLoadingDetail } = useSubunitDetail(
    subunit?.id ?? '',
  );
  const { data: allUsers = [] } = useUsers();

  const { mutate: addMember, isPending: isAdding } = useAddSubunitMember();
  const { mutate: updateRole, isPending: isUpdatingRole } = useUpdateSubunitMemberRole();
  const { mutate: removeMember, isPending: isRemoving } = useRemoveSubunitMember();

  if (!subunit) return null;

  // Mahasiswa aktif yang belum tergabung di subunit manapun
  const unassignedUsers = allUsers.filter(
    (u) => u.status === 'ACTIVE' && !u.subunit,
  );

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || !subunit) return;

    addMember(
      {
        subunitId: subunit.id,
        payload: {
          userId: selectedUserId,
          role: selectedRole,
        },
      },
      {
        onSuccess: () => {
          setSelectedUserId('');
          setSelectedRole('MEMBER');
        },
      },
    );
  };

  const handleToggleCoordinator = (userId: string, currentRole: SubunitRole) => {
    const nextRole: SubunitRole = currentRole === 'COORDINATOR' ? 'MEMBER' : 'COORDINATOR';
    updateRole({
      subunitId: subunit.id,
      userId,
      role: nextRole,
    });
  };

  const handleRemoveMember = (userId: string) => {
    if (confirm('Yakin ingin menghapus anggota ini dari subunit posko?')) {
      removeMember({
        subunitId: subunit.id,
        userId,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-175 max-h-[85vh] flex flex-col p-6">
        <DialogHeader className="shrink-0 pb-3 border-b">
          <div className="flex items-center gap-2 text-primary font-semibold text-xs tracking-wider uppercase">
            <MapPin className="size-4" />
            <span>Posko Dusun KKN</span>
          </div>
          <DialogTitle className="text-xl font-bold flex items-center justify-between">
            <span>{subunit.name}</span>
            <Badge variant="outline" className="text-xs font-normal">
              {detail?.memberCount ?? subunit.memberCount} Mahasiswa Ditempatkan
            </Badge>
          </DialogTitle>
          {subunit.location && (
            <DialogDescription className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
              <MapPin className="size-3.5 shrink-0 text-muted-foreground/70" />
              <span>{subunit.location}</span>
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4 space-y-6 pr-1">
          {/* Form Tambah Anggota (Jika punya hak akses) */}
          {canManage && (
            <div className="rounded-xl border bg-muted/30 p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <UserPlus className="size-4 text-primary" />
                <span>Tempatkan Mahasiswa ke Posko Ini</span>
              </div>
              <form onSubmit={handleAddMember} className="flex flex-col sm:flex-row gap-2.5">
                <div className="flex-1">
                  <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                    <SelectTrigger className="w-full bg-background">
                      <SelectValue placeholder="Pilih mahasiswa yang belum ditempatkan..." />
                    </SelectTrigger>
                    <SelectContent>
                      {unassignedUsers.length === 0 ? (
                        <div className="p-3 text-center text-xs text-muted-foreground">
                          Semua mahasiswa aktif sudah ditempatkan ke subunit.
                        </div>
                      ) : (
                        unassignedUsers.map((u) => (
                          <SelectItem key={u.id} value={u.id}>
                            <span className="font-medium">{u.name}</span>{' '}
                            <span className="text-xs text-muted-foreground">({u.email})</span>
                            {u.cluster && (
                              <span className="ml-1 text-[11px] text-primary/80 font-semibold">
                                [{u.cluster}]
                              </span>
                            )}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-full sm:w-42.5">
                  <Select
                    value={selectedRole}
                    onValueChange={(v) => setSelectedRole(v as SubunitRole)}
                  >
                    <SelectTrigger className="w-full bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MEMBER">Anggota</SelectItem>
                      <SelectItem value="COORDINATOR">Kormasit (Koord)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  type="submit"
                  disabled={!selectedUserId || isAdding}
                  className="shrink-0"
                >
                  {isAdding ? <Loader2 className="size-4 animate-spin" /> : 'Tempatkan'}
                </Button>
              </form>
              <p className="text-[11px] text-muted-foreground">
                * Aturan KKN: Setiap mahasiswa hanya dapat ditempatkan di tepat 1 subunit posko.
              </p>
            </div>
          )}

          {/* Daftar Anggota */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <UsersIcon className="size-4 text-muted-foreground" />
                Daftar Mahasiswa di Posko
              </h4>
              <span className="text-xs text-muted-foreground">
                Total: {detail?.members?.length ?? 0} orang
              </span>
            </div>

            {isLoadingDetail ? (
              <div className="flex items-center justify-center p-8 text-sm text-muted-foreground gap-2">
                <Loader2 className="size-4 animate-spin" />
                <span>Memuat daftar anggota posko...</span>
              </div>
            ) : !detail?.members || detail.members.length === 0 ? (
              <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                Belum ada mahasiswa yang ditempatkan di subunit posko ini.
              </div>
            ) : (
              <div className="divide-y rounded-xl border bg-card overflow-hidden">
                {detail.members.map((member) => (
                  <div
                    key={member.id}
                    className="p-3.5 flex items-center justify-between gap-3 hover:bg-muted/40 transition-colors"
                  >
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm text-foreground truncate">
                          {member.userName}
                        </span>
                        {member.role === 'COORDINATOR' && (
                          <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[11px] font-semibold gap-1">
                            <Crown className="size-3 text-amber-500 fill-amber-500" />
                            Kormasit (Koordinator Subunit)
                          </Badge>
                        )}
                        <ClusterBadge
                          cluster={member.cluster}
                          isCoordinator={member.isClusterCoordinator}
                          size="sm"
                        />
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {member.userEmail}
                      </div>
                    </div>

                    {canManage && (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={isUpdatingRole}
                          onClick={() =>
                            handleToggleCoordinator(member.userId, member.role)
                          }
                          className="h-8 text-xs gap-1"
                          title={
                            member.role === 'COORDINATOR'
                              ? 'Turunkan menjadi Anggota Subunit'
                              : 'Angkat menjadi Koordinator Subunit (Kormasit)'
                          }
                        >
                          {member.role === 'COORDINATOR' ? (
                            <>
                              <UserCheck className="size-3.5 text-muted-foreground" />
                              <span className="hidden sm:inline text-xs">Jadikan Anggota</span>
                            </>
                          ) : (
                            <>
                              <ShieldCheck className="size-3.5 text-amber-500" />
                              <span className="hidden sm:inline text-xs text-amber-600 dark:text-amber-400 font-medium">
                                Jadikan Kormasit
                              </span>
                            </>
                          )}
                        </Button>

                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={isRemoving}
                          onClick={() => handleRemoveMember(member.userId)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                          title="Hapus dari Subunit"
                        >
                          <UserX className="size-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
