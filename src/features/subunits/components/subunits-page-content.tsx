'use client';

import React, { useState, useMemo } from 'react';
import {
  MapPin,
  Users,
  Crown,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Home,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCurrentUser } from '@/features/auth/api/use-queries';
import { useSubunits } from '../api/use-queries';
import { useDeleteSubunit } from '../api/use-mutations';
import { CreateSubunitDialog } from './create-subunit-dialog';
import { EditSubunitDialog } from './edit-subunit-dialog';
import { ManageSubunitDialog } from './manage-subunit-dialog';
import { ClusterBadge } from './cluster-badge';
import type { SubunitItem } from '../types';

export function SubunitsPageContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingSubunit, setEditingSubunit] = useState<SubunitItem | null>(null);
  const [managingSubunit, setManagingSubunit] = useState<SubunitItem | null>(null);

  const { data: currentUser } = useCurrentUser();
  const { data: subunits = [], isLoading } = useSubunits();
  const { mutate: deleteSubunit } = useDeleteSubunit();

  const isAdmin = Boolean(currentUser?.isSuperAdmin || currentUser?.isKormanit);

  // Filter subunits by query
  const filteredSubunits = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return subunits;
    return subunits.filter(
      (sub) =>
        sub.name.toLowerCase().includes(q) ||
        (sub.location && sub.location.toLowerCase().includes(q)) ||
        (sub.description && sub.description.toLowerCase().includes(q)) ||
        sub.coordinators.some((c) => c.name.toLowerCase().includes(q)),
    );
  }, [subunits, searchQuery]);

  // Aggregate stats
  const totalMembersPlaced = useMemo(
    () => subunits.reduce((acc, curr) => acc + curr.memberCount, 0),
    [subunits],
  );
  const totalKormasit = useMemo(
    () => subunits.reduce((acc, curr) => acc + curr.coordinators.length, 0),
    [subunits],
  );

  const handleDelete = (subunit: SubunitItem) => {
    if (
      confirm(
        `Yakin ingin menghapus posko '${subunit.name}'? Mahasiswa di subunit ini akan dilepaskan dari penempatan posko.`,
      )
    ) {
      deleteSubunit(subunit.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2.5 text-foreground">
            <Home className="size-7 text-primary" />
            <span>Subunit & Posko Dusun</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Wilayah posko KKN, alamat fisik pemukiman, dan distribusi mahasiswa antar dusun.
          </p>
        </div>

        {isAdmin && (
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="gap-2 shadow-sm shrink-0 self-start sm:self-auto"
          >
            <Plus className="size-4" />
            <span>Tambah Subunit</span>
          </Button>
        )}
      </div>

      {/* Metric Cards Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-linear-to-br from-card to-muted/20 border-border/80">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <Home className="size-5" />
            </div>
            <div>
              <div className="text-2xl font-bold">{subunits.length}</div>
              <div className="text-xs text-muted-foreground font-medium">Subunit Posko</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-linear-to-br from-card to-muted/20 border-border/80">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
              <Users className="size-5" />
            </div>
            <div>
              <div className="text-2xl font-bold">{totalMembersPlaced}</div>
              <div className="text-xs text-muted-foreground font-medium">Mahasiswa Ditempatkan</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-linear-to-br from-card to-muted/20 border-border/80">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Crown className="size-5" />
            </div>
            <div>
              <div className="text-2xl font-bold">{totalKormasit}</div>
              <div className="text-xs text-muted-foreground font-medium">Kormasit (Koord Subunit)</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-linear-to-br from-card to-muted/20 border-border/80">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Sparkles className="size-5" />
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                3 Dimensi KKN
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                Subunit • Klaster • Divisi
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama subunit, dusun, atau lokasi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-card"
          />
        </div>
      </div>

      {/* Subunits Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse h-65 bg-muted/40" />
          ))}
        </div>
      ) : filteredSubunits.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-3">
            <MapPin className="size-6" />
          </div>
          <h3 className="font-semibold text-lg text-foreground">
            {searchQuery ? 'Subunit tidak ditemukan' : 'Belum ada subunit posko'}
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-1 mb-4">
            {searchQuery
              ? `Tidak ada hasil yang cocok dengan "${searchQuery}". Coba kata kunci lain.`
              : 'Tambahkan subunit posko baru untuk memulai penataan wilayah KKN.'}
          </p>
          {isAdmin && !searchQuery && (
            <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
              <Plus className="size-4" />
              <span>Tambah Subunit Pertama</span>
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSubunits.map((sub) => (
            <Card
              key={sub.id}
              className="flex flex-col justify-between border-border/80 hover:border-primary/40 hover:shadow-md transition-all duration-200 overflow-hidden group"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 flex-1">
                    <CardTitle className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                      {sub.name}
                    </CardTitle>
                    {sub.location ? (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="size-3.5 shrink-0 text-primary/70" />
                        <span className="line-clamp-1">{sub.location}</span>
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground/60 italic">
                        Lokasi fisik posko belum diset
                      </div>
                    )}
                  </div>

                  {isAdmin && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="size-8 p-0 text-muted-foreground hover:text-foreground"
                        >
                          <MoreVertical className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => setEditingSubunit(sub)}
                          className="gap-2"
                        >
                          <Edit className="size-4" />
                          <span>Ubah Info Posko</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(sub)}
                          className="gap-2 text-destructive focus:text-destructive"
                        >
                          <Trash2 className="size-4" />
                          <span>Hapus Subunit</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>

                {sub.description && (
                  <CardDescription className="text-xs line-clamp-2 mt-2 pt-2 border-t border-border/40">
                    {sub.description}
                  </CardDescription>
                )}
              </CardHeader>

              <CardContent className="py-2 space-y-3">
                {/* Kormasit Info */}
                <div className="rounded-lg bg-muted/40 p-2.5 space-y-1.5">
                  <div className="text-[11px] font-semibold tracking-wider uppercase text-muted-foreground flex items-center gap-1.5">
                    <Crown className="size-3 text-amber-500" />
                    <span>Koordinator Subunit (Kormasit)</span>
                  </div>
                  {sub.coordinators.length > 0 ? (
                    <div className="space-y-1">
                      {sub.coordinators.map((c) => (
                        <div
                          key={c.id}
                          className="flex items-center justify-between text-xs gap-2"
                        >
                          <span className="font-semibold text-foreground truncate">
                            {c.name}
                          </span>
                          <ClusterBadge
                            cluster={c.cluster}
                            isCoordinator={c.isClusterCoordinator}
                            size="sm"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-muted-foreground italic">
                      Belum ada Kormasit yang ditunjuk.
                    </div>
                  )}
                </div>

                {/* Anggota Count Badge */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-muted-foreground">Anggota Terdaftar</span>
                  <Badge variant="secondary" className="font-semibold">
                    {sub.memberCount} Mahasiswa
                  </Badge>
                </div>
              </CardContent>

              <CardFooter className="pt-3 border-t bg-muted/10 flex items-center justify-between gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setManagingSubunit(sub)}
                  className="w-full gap-2 font-medium"
                >
                  <Users className="size-4" />
                  <span>Detail & Kelola Anggota</span>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog Modals */}
      <CreateSubunitDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />

      <EditSubunitDialog
        subunit={editingSubunit}
        open={Boolean(editingSubunit)}
        onOpenChange={(open) => !open && setEditingSubunit(null)}
      />

      <ManageSubunitDialog
        subunit={managingSubunit}
        open={Boolean(managingSubunit)}
        onOpenChange={(open) => !open && setManagingSubunit(null)}
        canManage={isAdmin}
      />
    </div>
  );
}
