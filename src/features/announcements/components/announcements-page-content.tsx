'use client';

import * as React from 'react';
import {
  Calendar as CalendarIcon,
  LayoutList,
  Megaphone,
  Plus,
  Search,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useCurrentUser } from '@/features/auth/api/use-queries';
import { useDivisions } from '@/features/divisions/api/use-queries';
import { useSubunits } from '@/features/subunits/api/use-queries';
import {
  useAnnouncements,
  useAnnouncementPermissions,
} from '../api/use-queries';
import { useDeleteAnnouncement } from '../api/use-mutations';
import { AnnouncementCard } from './announcement-card';
import { AnnouncementDetailDialog } from './announcement-detail-dialog';
import { AnnouncementFormDialog } from './announcement-form-dialog';
import { AnnouncementCalendarView } from './announcement-calendar-view';
import type { Announcement, AnnouncementCategory, AnnouncementTarget } from '../types';

export function AnnouncementsPageContent() {
  const { data: user } = useCurrentUser();
  const { data: divisions = [] } = useDivisions();
  const { data: subunits = [] } = useSubunits();
  const { data: permissions } = useAnnouncementPermissions();

  const [viewMode, setViewMode] = React.useState<'list' | 'calendar'>('list');
  const [search, setSearch] = React.useState('');
  const [categoryFilter, setCategoryFilter] = React.useState<string>('all');
  const [targetTypeFilter, setTargetTypeFilter] = React.useState<string>('all');
  const [divisionFilter, setDivisionFilter] = React.useState<string>('all');
  const [subunitFilter, setSubunitFilter] = React.useState<string>('all');
  const [clusterFilter, setClusterFilter] = React.useState<string>('all');

  // Modals state
  const [formOpen, setFormOpen] = React.useState(false);
  const [selectedForEdit, setSelectedForEdit] = React.useState<Announcement | null>(null);
  const [detailAnnouncement, setDetailAnnouncement] = React.useState<Announcement | null>(null);
  const [detailOpen, setDetailOpen] = React.useState(false);

  // Delete confirm state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);
  const [announcementToDelete, setAnnouncementToDelete] = React.useState<Announcement | null>(null);

  const deleteMutation = useDeleteAnnouncement();

  const { data: announcements = [], isLoading } = useAnnouncements({
    category: categoryFilter !== 'all' ? (categoryFilter as AnnouncementCategory) : undefined,
    targetType: targetTypeFilter !== 'all' ? (targetTypeFilter as AnnouncementTarget) : undefined,
    divisionId: divisionFilter !== 'all' ? divisionFilter : undefined,
    subunitId: subunitFilter !== 'all' ? subunitFilter : undefined,
    cluster: clusterFilter !== 'all' ? clusterFilter : undefined,
    search: search.trim() || undefined,
  });

  const canCreate = Boolean(
    user?.isSuperAdmin || user?.isKormanit || permissions?.canCreate
  );

  const handleCreateNew = () => {
    setSelectedForEdit(null);
    setFormOpen(true);
  };

  const handleEdit = (announcement: Announcement) => {
    setSelectedForEdit(announcement);
    setFormOpen(true);
  };

  const handleDelete = (announcement: Announcement) => {
    setAnnouncementToDelete(announcement);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (announcementToDelete) {
      deleteMutation.mutate(announcementToDelete.id, {
        onSuccess: () => {
          setDeleteConfirmOpen(false);
          setAnnouncementToDelete(null);
        },
      });
    }
  };

  const handleView = (announcement: Announcement) => {
    setDetailAnnouncement(announcement);
    setDetailOpen(true);
  };

  return (
    <div className="space-y-6 mx-auto pb-12">
      {/* Page Header */}
      <div className="border-b border-border/60 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1.5">
              <span>MoaSpace</span>
              <span className="text-muted-foreground/40">/</span>
              <span className="text-foreground font-semibold">Pengumuman</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
              <Megaphone className="size-6 text-primary" />
              Pengumuman Tim
            </h1>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
              Pusat informasi resmi, koordinasi rapat, dan agenda kegiatan seluruh anggota KKN.
            </p>
          </div>

          {canCreate && (
            <Button
              onClick={handleCreateNew}
              className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-medium self-start sm:self-center"
            >
              <Plus className="size-4" />
              <span>Buat Pengumuman</span>
            </Button>
          )}
        </div>
      </div>

      {/* Control Bar: Dual View Tabs & Search/Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 flex-wrap">
        {/* Dual View Mode Tabs */}
        <div className="inline-flex items-center p-1 rounded-lg bg-muted/60 border border-border/60 self-start">
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="xs"
            onClick={() => setViewMode('list')}
            className={`gap-1.5 text-xs h-7 px-3 font-medium transition-all ${
              viewMode === 'list'
                ? 'bg-background text-foreground shadow-2xs hover:bg-background'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <LayoutList className="size-3.5" />
            <span>Daftar Pengumuman</span>
          </Button>

          <Button
            variant={viewMode === 'calendar' ? 'default' : 'ghost'}
            size="xs"
            onClick={() => setViewMode('calendar')}
            className={`gap-1.5 text-xs h-7 px-3 font-medium transition-all ${
              viewMode === 'calendar'
                ? 'bg-background text-foreground shadow-2xs hover:bg-background'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <CalendarIcon className="size-3.5" />
            <span>Kalender Agenda</span>
          </Button>
        </div>

        {/* Search & Filter Dropdowns */}
        <div className="flex items-center gap-2 flex-wrap flex-1 justify-start md:justify-end">
          <div className="relative w-full sm:w-56">
            <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari pengumuman..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 text-xs h-8"
            />
          </div>

          {/* Category Filter */}
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-36 text-xs h-8">
              <SelectValue placeholder="Kategori" />
            </SelectTrigger>
            <SelectContent className="text-xs">
              <SelectItem value="all">Semua Kategori</SelectItem>
              <SelectItem value="INFO">Informasi</SelectItem>
              <SelectItem value="MEETING">Rapat</SelectItem>
              <SelectItem value="ACTIVITY">Kegiatan</SelectItem>
              <SelectItem value="URGENT">Penting</SelectItem>
            </SelectContent>
          </Select>

          {/* Target Type Filter */}
          <Select
            value={targetTypeFilter}
            onValueChange={(val) => {
              setTargetTypeFilter(val);
              if (val !== 'DIVISION') setDivisionFilter('all');
              if (val !== 'SUBUNIT') setSubunitFilter('all');
              if (val !== 'CLUSTER') setClusterFilter('all');
            }}
          >
            <SelectTrigger className="w-38 text-xs h-8">
              <SelectValue placeholder="Target Audiens" />
            </SelectTrigger>
            <SelectContent className="text-xs">
              <SelectItem value="all">Semua Target</SelectItem>
              <SelectItem value="ALL">Seluruh Tim KKN</SelectItem>
              <SelectItem value="DIVISION">Khusus Divisi</SelectItem>
              <SelectItem value="SUBUNIT">Khusus Posko / Subunit</SelectItem>
              <SelectItem value="CLUSTER">Khusus Klaster</SelectItem>
            </SelectContent>
          </Select>

          {/* Conditional Sub-filter: Division */}
          {targetTypeFilter === 'DIVISION' && (
            <Select value={divisionFilter} onValueChange={setDivisionFilter}>
              <SelectTrigger className="w-40 text-xs h-8">
                <SelectValue placeholder="Pilih Divisi" />
              </SelectTrigger>
              <SelectContent className="text-xs">
                <SelectItem value="all">Semua Divisi</SelectItem>
                {divisions.map((div) => (
                  <SelectItem key={div.id} value={div.id}>
                    Divisi {div.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Conditional Sub-filter: Subunit */}
          {targetTypeFilter === 'SUBUNIT' && (
            <Select value={subunitFilter} onValueChange={setSubunitFilter}>
              <SelectTrigger className="w-40 text-xs h-8">
                <SelectValue placeholder="Pilih Posko" />
              </SelectTrigger>
              <SelectContent className="text-xs">
                <SelectItem value="all">Semua Posko</SelectItem>
                {subunits.map((sub) => (
                  <SelectItem key={sub.id} value={sub.id}>
                    Posko {sub.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Conditional Sub-filter: Cluster */}
          {targetTypeFilter === 'CLUSTER' && (
            <Select value={clusterFilter} onValueChange={setClusterFilter}>
              <SelectTrigger className="w-36 text-xs h-8">
                <SelectValue placeholder="Pilih Klaster" />
              </SelectTrigger>
              <SelectContent className="text-xs">
                <SelectItem value="all">Semua Klaster</SelectItem>
                <SelectItem value="SAINTEK">Saintek</SelectItem>
                <SelectItem value="SOSHUM">Soshum</SelectItem>
                <SelectItem value="MEDIKA">Medika</SelectItem>
                <SelectItem value="AGRO">Agro</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="flex h-64 flex-col items-center justify-center gap-3">
          <Loader2 className="size-7 animate-spin text-primary" />
          <p className="text-xs text-muted-foreground">Memuat daftar pengumuman...</p>
        </div>
      ) : viewMode === 'calendar' ? (
        <AnnouncementCalendarView
          announcements={announcements}
          onSelectAnnouncement={handleView}
        />
      ) : (
        /* List / Feed View */
        <div>
          {announcements.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center border rounded-xl border-dashed border-border/80 bg-muted/10 space-y-3">
              <div className="p-3 rounded-full bg-muted text-muted-foreground">
                <Megaphone className="size-6" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm">Belum Ada Pengumuman</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                  {search || categoryFilter !== 'all' || divisionFilter !== 'all'
                    ? 'Tidak ditemukan pengumuman yang sesuai dengan filter pencarian Anda.'
                    : 'Belum ada pengumuman yang dipublikasikan untuk tim saat ini.'}
                </p>
              </div>
              {canCreate && !search && categoryFilter === 'all' && (
                <Button onClick={handleCreateNew} size="sm" className="gap-1.5 text-xs">
                  <Plus className="size-3.5" />
                  Buat Pengumuman Pertama
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
              {announcements.map((announcement) => {
                const isAuthor = announcement.authorId === user?.id;
                const canManageCard = Boolean(
                  user?.isSuperAdmin || user?.isKormanit || isAuthor
                );

                return (
                  <AnnouncementCard
                    key={announcement.id}
                    announcement={announcement}
                    canManage={canManageCard}
                    onView={handleView}
                    onEdit={canManageCard ? handleEdit : undefined}
                    onDelete={canManageCard ? handleDelete : undefined}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Form Dialog (Create / Edit) */}
      <AnnouncementFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        announcement={selectedForEdit}
      />

      {/* Detail Dialog */}
      <AnnouncementDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        announcement={detailAnnouncement}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Hapus Pengumuman?"
        description={`Apakah Anda yakin ingin menghapus pengumuman "${announcementToDelete?.title}"? Event jadwal di Google Calendar seluruh anggota yang terkait juga akan dihapus.`}
        confirmLabel={deleteMutation.isPending ? 'Menghapus...' : 'Hapus Pengumuman'}
        cancelLabel="Batal"
        variant="destructive"
        onConfirm={confirmDelete}
      />
    </div>
  );
}
