'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Users, UserCheck, Clock, Layers, History } from 'lucide-react';
import { useUsers, useDivisions } from '../api/use-queries';
import { CreateUserDialog } from './create-user-dialog';
import { UsersTable } from './users-table';

export function UsersPageContent() {
  const { data: users = [], isLoading: usersLoading } = useUsers();
  const { data: divisions = [], isLoading: divLoading } = useDivisions();

  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status === 'ACTIVE').length;
  const pendingActivation = users.filter((u) => !u.isActivated).length;
  const totalDivisions = divisions.length;

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Kelola Anggota KKN
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Daftarkan akun anggota baru, tentukan divisi & role, serta kelola status dan tautan aktivasi.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/admin/activity-logs">
            <Button variant="outline" className="gap-1.5 h-9 text-xs">
              <History size={14} />
              <span>Activity Log</span>
            </Button>
          </Link>
          <CreateUserDialog divisions={divisions} />
        </div>
      </div>

      {/* Metrics / Stats Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Total Anggota</span>
            <Users size={16} className="text-primary" />
          </div>
          <div className="mt-2 text-2xl font-bold">
            {usersLoading ? '...' : totalUsers}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">Seluruh anggota terdaftar</p>
        </div>

        <div className="rounded-xl border bg-card p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Anggota Aktif</span>
            <UserCheck size={16} className="text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {usersLoading ? '...' : activeUsers}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">Status akun aktif</p>
        </div>

        <div className="rounded-xl border bg-card p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Menunggu Aktivasi</span>
            <Clock size={16} className="text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-600 dark:text-amber-400">
            {usersLoading ? '...' : pendingActivation}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">Belum membuat kata sandi</p>
        </div>

        <div className="rounded-xl border bg-card p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Divisi Terdaftar</span>
            <Layers size={16} className="text-blue-500" />
          </div>
          <div className="mt-2 text-2xl font-bold">
            {divLoading ? '...' : totalDivisions}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">Unit kerja KKN</p>
        </div>
      </div>

      {/* Main Table */}
      <UsersTable
        users={users}
        divisions={divisions}
        isLoading={usersLoading || divLoading}
      />
    </div>
  );
}
