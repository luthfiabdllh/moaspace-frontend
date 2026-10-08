'use client';

import { useMemo, useState } from 'react';
import {
  Layers,
  Plus,
  Search,
  CheckCircle2,
  Users,
} from 'lucide-react';
import type { DivisionItem } from '../types';
import { useDivisions } from '../api/use-queries';
import { DivisionsTable } from './divisions-table';
import { DivisionDialog } from './division-dialog';
import { ManageDivisionMembersDialog } from './manage-division-members-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

export function DivisionsPageContent() {
  const { data: divisions = [], isLoading } = useDivisions();

  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [divisionToEdit, setDivisionToEdit] = useState<DivisionItem | null>(null);

  const [isManageMembersOpen, setIsManageMembersOpen] = useState(false);
  const [selectedDivisionForMembers, setSelectedDivisionForMembers] =
    useState<DivisionItem | null>(null);

  // Filtered divisions by name or slug
  const filteredDivisions = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return divisions;
    return divisions.filter(
      (d) =>
        d.name.toLowerCase().includes(q) || d.slug.toLowerCase().includes(q)
    );
  }, [divisions, search]);

  // Statistics
  const totalDivisions = divisions.length;
  const approvalEnabledCount = divisions.filter(
    (d) => d.requestApprovalEnabled
  ).length;
  const totalMemberships = divisions.reduce(
    (acc, d) => acc + (d.memberCount || 0),
    0
  );

  const handleOpenCreate = () => {
    setDivisionToEdit(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (div: DivisionItem) => {
    setDivisionToEdit(div);
    setIsDialogOpen(true);
  };

  const handleOpenManageMembers = (div: DivisionItem) => {
    setSelectedDivisionForMembers(div);
    setIsManageMembersOpen(true);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Page Header */}
      <div className="border-b border-border/60 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <span>Admin</span>
              <span>/</span>
              <span className="text-foreground font-medium">Divisi</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Manajemen Divisi KKN
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Kelola struktur divisi, penugasan koordinator, dan kebijakan alur persetujuan request pekerjaan.
            </p>
          </div>

          <Button onClick={handleOpenCreate} className="gap-2 self-start sm:self-center">
            <Plus className="size-4" />
            Tambah Divisi
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="shadow-2xs border-border/80">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-xs text-muted-foreground font-medium">
                Total Divisi Terdaftar
              </p>
              <p className="text-2xl font-bold text-foreground">
                {totalDivisions}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-primary/10 text-primary">
              <Layers className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-2xs border-border/80">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-xs text-muted-foreground font-medium">
                Approval Request Aktif
              </p>
              <p className="text-2xl font-bold text-foreground">
                {approvalEnabledCount}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-2xs border-border/80">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-xs text-muted-foreground font-medium">
                Total Penempatan Anggota
              </p>
              <p className="text-2xl font-bold text-foreground">
                {totalMemberships}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Users className="size-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari divisi atau slug..."
            className="pl-9 bg-card"
          />
        </div>
      </div>

      {/* Divisions Table */}
      <DivisionsTable
        divisions={filteredDivisions}
        isLoading={isLoading}
        onEditDivision={handleOpenEdit}
        onManageMembers={handleOpenManageMembers}
      />

      {/* Dialogs */}
      <DivisionDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        divisionToEdit={divisionToEdit}
      />

      <ManageDivisionMembersDialog
        open={isManageMembersOpen}
        onOpenChange={setIsManageMembersOpen}
        division={selectedDivisionForMembers}
      />
    </div>
  );
}
