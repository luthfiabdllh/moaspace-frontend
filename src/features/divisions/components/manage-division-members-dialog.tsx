'use client';

import { useState } from 'react';
import {
  Users,
  ShieldCheck,
  UserPlus,
  Trash2,
  Award,
  Loader2,
  UserCheck,
} from 'lucide-react';
import type { DivisionItem } from '../types';
import { useDivision } from '../api/use-queries';
import {
  useAddDivisionMember,
  useUpdateDivisionMemberRole,
  useRemoveDivisionMember,
} from '../api/use-mutations';
import { useUsers } from '@/features/users/api/use-queries';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

interface ManageDivisionMembersDialogProps {
  division: DivisionItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ManageDivisionMembersDialog({
  division,
  open,
  onOpenChange,
}: ManageDivisionMembersDialogProps) {
  const divisionId = division?.id ?? '';
  const { data: divisionDetail, isLoading } = useDivision(divisionId, open);
  const { data: allUsers = [] } = useUsers();

  const addMemberMutation = useAddDivisionMember();
  const updateRoleMutation = useUpdateDivisionMemberRole();
  const removeMemberMutation = useRemoveDivisionMember();

  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState<'MEMBER' | 'COORDINATOR'>('MEMBER');
  const [pendingRemoveMember, setPendingRemoveMember] = useState<{ id: string; name: string } | null>(null);

  if (!division) return null;

  const currentMemberIds = new Set(
    divisionDetail?.members?.map((m) => m.id) ?? []
  );

  // Users available to be added (active users not yet in this division)
  const availableUsers = allUsers.filter(
    (u) => !currentMemberIds.has(u.id) && u.status === 'ACTIVE'
  );

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;

    await addMemberMutation.mutateAsync({
      divisionId: division.id,
      userId: selectedUserId,
      role: selectedRole,
    });

    setSelectedUserId('');
    setSelectedRole('MEMBER');
  };

  const handleToggleRole = async (
    userId: string,
    currentRole: 'MEMBER' | 'COORDINATOR'
  ) => {
    const nextRole = currentRole === 'COORDINATOR' ? 'MEMBER' : 'COORDINATOR';
    await updateRoleMutation.mutateAsync({
      divisionId: division.id,
      userId,
      role: nextRole,
    });
  };

  const handleRemoveMember = (userId: string, userName: string) => {
    setPendingRemoveMember({ id: userId, name: userName });
  };

  const confirmRemoveMember = async () => {
    if (!pendingRemoveMember) return;
    await removeMemberMutation.mutateAsync({
      divisionId: division.id,
      userId: pendingRemoveMember.id,
    });
    setPendingRemoveMember(null);
  };

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col p-6">
        <DialogHeader className="pb-3 border-b border-border/60">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Users className="size-4" />
            </div>
            <DialogTitle>Kelola Anggota: {division.name}</DialogTitle>
          </div>
          <DialogDescription>
            Atur keanggotaan dan tunjuk Koordinator Divisi untuk {division.name} (/{division.slug}).
          </DialogDescription>
        </DialogHeader>

        {/* Section 1: Add Member Form */}
        <form
          onSubmit={handleAddMember}
          className="flex flex-col sm:flex-row items-center gap-3 p-3.5 my-3 rounded-xl bg-muted/40 border border-border/80"
        >
          <div className="w-full sm:flex-1">
            <Select value={selectedUserId || undefined} onValueChange={setSelectedUserId}>
              <SelectTrigger className="w-full text-sm">
                <SelectValue placeholder="-- Pilih Anggota Baru --" />
              </SelectTrigger>
              <SelectContent>
                {availableUsers.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-full sm:w-44">
            <Select
              value={selectedRole}
              onValueChange={(v) => setSelectedRole(v as 'MEMBER' | 'COORDINATOR')}
            >
              <SelectTrigger className="w-full text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MEMBER">Anggota Divisi</SelectItem>
                <SelectItem value="COORDINATOR">Koordinator Divisi</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            type="submit"
            size="sm"
            disabled={!selectedUserId || addMemberMutation.isPending}
            className="w-full sm:w-auto gap-1.5 shrink-0"
          >
            {addMemberMutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <UserPlus className="size-4" />
            )}
            Tambah
          </Button>
        </form>

        {/* Section 2: Members List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-55">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-48 gap-2">
              <Loader2 className="size-6 animate-spin text-primary" />
              <p className="text-xs text-muted-foreground">Memuat anggota divisi...</p>
            </div>
          ) : divisionDetail?.members?.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center p-6 rounded-xl border border-dashed border-border/80">
              <Users className="size-8 text-muted-foreground/60 mb-2" />
              <p className="text-sm font-medium text-foreground">
                Belum ada anggota di divisi ini
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Gunakan form di atas untuk menugaskan anggota ke divisi ini.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/50 rounded-xl border border-border/70 overflow-hidden">
              {divisionDetail?.members?.map((member) => {
                const isCoordinator = member.role === 'COORDINATOR';
                const initials = member.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase();

                return (
                  <div
                    key={member.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 gap-3 bg-card hover:bg-muted/20 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar className="size-9 ring-1 ring-border shrink-0">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm truncate text-foreground">
                            {member.name}
                          </span>
                          {isCoordinator ? (
                            <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 dark:bg-amber-950/40 border-amber-500/20 text-2xs gap-1">
                              <Award className="size-2.5" />
                              Koordinator
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-2xs text-muted-foreground">
                              Anggota
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {member.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleRole(member.id, member.role)}
                        disabled={updateRoleMutation.isPending}
                        className="text-xs h-8 gap-1.5"
                      >
                        {isCoordinator ? (
                          <>
                            <UserCheck className="size-3.5" />
                            Ubah ke Anggota
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="size-3.5 text-amber-600" />
                            Jadikan Koordinator
                          </>
                        )}
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveMember(member.id, member.name)}
                        disabled={removeMemberMutation.isPending}
                        className="size-8 text-destructive hover:bg-destructive/10"
                        title="Hapus dari divisi"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>

    <ConfirmDialog
      open={Boolean(pendingRemoveMember)}
      onOpenChange={(isOpen) => !isOpen && setPendingRemoveMember(null)}
      title="Hapus Anggota dari Divisi?"
      description={`${pendingRemoveMember?.name || 'Anggota ini'} akan dikeluarkan dari divisi ${division.name}.`}
      variant="destructive"
      onConfirm={confirmRemoveMember}
    />
    </>
  );
}
