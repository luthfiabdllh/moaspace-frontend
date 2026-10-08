'use client';

import { useState } from 'react';
import {
  Users,
  Edit,
  Award,
  Layers,
  CheckCircle2,
  XCircle,
  Loader2,
} from 'lucide-react';
import type { DivisionItem } from '../types';
import { useToggleApprovalRequest } from '../api/use-mutations';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
interface DivisionsTableProps {
  divisions: DivisionItem[];
  isLoading: boolean;
  onEditDivision: (division: DivisionItem) => void;
  onManageMembers: (division: DivisionItem) => void;
}

export function DivisionsTable({
  divisions,
  isLoading,
  onEditDivision,
  onManageMembers,
}: DivisionsTableProps) {
  const toggleApprovalMutation = useToggleApprovalRequest();
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const handleToggleApproval = async (division: DivisionItem) => {
    setTogglingId(division.id);
    try {
      await toggleApprovalMutation.mutateAsync({
        id: division.id,
        enabled: !division.requestApprovalEnabled,
      });
    } finally {
      setTogglingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Memuat data divisi...</p>
      </div>
    );
  }

  if (divisions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border rounded-xl border-dashed border-border/80">
        <div className="p-3 rounded-full bg-muted mb-2 text-muted-foreground">
          <Layers className="size-8" />
        </div>
        <h3 className="font-semibold text-foreground">Tidak Ada Divisi</h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm">
          Belum ada divisi yang cocok dengan pencarian Anda. Silakan buat divisi baru.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border/60 bg-muted/40 text-xs font-semibold text-muted-foreground">
            <tr>
              <th className="px-5 py-3.5">Divisi</th>
              <th className="px-4 py-3.5">Koordinator</th>
              <th className="px-4 py-3.5 text-center">Anggota</th>
              <th className="px-4 py-3.5 text-center">Approval Request</th>
              <th className="px-5 py-3.5 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {divisions.map((div) => {
              const isToggling = togglingId === div.id;

              return (
                <tr
                  key={div.id}
                  className="hover:bg-muted/20 transition-colors group"
                >
                  {/* Divisi Name & Slug */}
                  <td className="px-5 py-4">
                    <div className="space-y-0.5">
                      <div className="font-semibold text-foreground">
                        {div.name}
                      </div>
                      <div className="text-xs font-mono text-muted-foreground">
                        /{div.slug}
                      </div>
                    </div>
                  </td>

                  {/* Coordinators */}
                  <td className="px-4 py-4">
                    {div.coordinators && div.coordinators.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {div.coordinators.map((coord) => (
                          <Badge
                            key={coord.id}
                            className="bg-amber-500/10 text-amber-700 dark:text-amber-400 dark:bg-amber-950/40 border border-amber-500/20 text-xs gap-1 py-0.5 px-2"
                          >
                            <Award className="size-3 text-amber-600" />
                            {coord.name}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">
                        Belum ada koordinator
                      </span>
                    )}
                  </td>

                  {/* Member count */}
                  <td className="px-4 py-4 text-center">
                    <Badge variant="secondary" className="font-mono text-xs">
                      {div.memberCount} orang
                    </Badge>
                  </td>

                  {/* Request approval toggle */}
                  <td className="px-4 py-4 text-center">
                    <button
                      type="button"
                      onClick={() => handleToggleApproval(div)}
                      disabled={isToggling}
                      title="Klik untuk mengubah status approval request divisi"
                      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer disabled:opacity-50 hover:opacity-90"
                    >
                      {isToggling ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : div.requestApprovalEnabled ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                          <CheckCircle2 className="size-3" />
                          Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-muted-foreground bg-muted border border-border/80 px-2.5 py-0.5 rounded-full">
                          <XCircle className="size-3" />
                          Nonaktif
                        </span>
                      )}
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onManageMembers(div)}
                        className="gap-1.5 text-xs h-8"
                      >
                        <Users className="size-3.5 text-primary" />
                        Kelola Anggota
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEditDivision(div)}
                        className="size-8"
                        title="Edit divisi"
                      >
                        <Edit className="size-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
