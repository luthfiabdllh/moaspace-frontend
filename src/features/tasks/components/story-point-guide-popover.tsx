'use client';

import * as React from 'react';
import { HelpCircle, AlertCircle } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export interface SpGuidelineItem {
  sp: string;
  effort: string;
  example: string;
  color: string;
  isProhibited?: boolean;
}

export const SP_GUIDELINES: SpGuidelineItem[] = [
  { sp: '1', effort: 'Kurang dari 1 jam', example: 'Posting story IG; catat pengeluaran harian', color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  { sp: '2', effort: 'Sekitar 1–2 jam', example: 'Follow-up 5 calon sponsor', color: 'text-sky-600 dark:text-sky-400 bg-sky-500/10 border-sky-500/20' },
  { sp: '3', effort: 'Setengah hari', example: 'Desain 1 feed IG; notulensi rapat besar', color: 'text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20' },
  { sp: '5', effort: 'Sekitar satu hari', example: 'Poster event dengan revisi; proposal sponsorship', color: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20' },
  { sp: '8', effort: 'Dua hari atau lebih', example: 'Video profil KKN; LPJ satu kegiatan', color: 'text-violet-600 dark:text-violet-400 bg-violet-500/10 border-violet-500/20' },
  { sp: '> 8', effort: 'Tidak diizinkan', example: 'Wajib dipecah menjadi beberapa task', color: 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20', isProhibited: true },
];

export function StoryPointGuidePopover({ className }: { className?: string }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer select-none rounded p-0.5 hover:bg-muted/60',
            className
          )}
          title="Lihat panduan acuan Story Point"
          aria-label="Panduan acuan Story Point"
        >
          <HelpCircle className="size-3.5 text-primary/80" />
          <span className="underline underline-offset-2 decoration-muted-foreground/40 hover:decoration-foreground">
            Panduan SP
          </span>
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        side="bottom"
        sideOffset={6}
        className="w-80 sm:w-96 p-3.5 rounded-xl shadow-xl border border-border/80 bg-popover/95 backdrop-blur-md z-50 space-y-3"
      >
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 font-bold text-xs text-foreground">
            <span className="flex size-4.5 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-mono">
              ⚡
            </span>
            <span>Panduan Acuan Story Point (SP)</span>
          </div>
          <p className="text-3xs text-muted-foreground">
            Skala estimasi usaha berbasis perkiraan waktu kerja tim KKN.
          </p>
        </div>

        {/* Tabel Acuan SP */}
        <div className="overflow-hidden rounded-lg border border-border/70 text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/70 bg-muted/40 text-[11px] font-semibold text-muted-foreground">
                <th className="py-1.5 px-2.5 w-14 text-center">SP</th>
                <th className="py-1.5 px-2.5">Acuan Usaha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 text-[11px]">
              {SP_GUIDELINES.map((item) => (
                <tr
                  key={item.sp}
                  className={cn(
                    'transition-colors',
                    item.isProhibited
                      ? 'bg-rose-500/5 hover:bg-rose-500/10'
                      : 'hover:bg-muted/30'
                  )}
                >
                  <td className="py-1.5 px-2 text-center font-mono font-bold">
                    <span
                      className={cn(
                        'inline-flex items-center justify-center px-1.5 py-0.5 rounded border text-3xs',
                        item.color
                      )}
                    >
                      {item.sp}
                    </span>
                  </td>
                  <td className="py-1.5 px-2.5 text-foreground leading-snug">
                    <div className="font-medium">
                      {item.effort}
                    </div>
                    {item.isProhibited && (
                      <div className="text-3xs text-rose-600 dark:text-rose-400 flex items-center gap-1 mt-0.5">
                        <AlertCircle className="size-2.5 shrink-0" />
                        <span>Wajib dipecah menjadi beberapa task</span>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-3xs text-muted-foreground/80 leading-normal bg-muted/30 p-2 rounded-lg border border-border/40">
          💡 <strong>Tips:</strong> Estimasi berbasis perkiraan usaha agar beban kerja antar divisi yang berbeda dapat dibandingkan secara adil.
        </p>
      </PopoverContent>
    </Popover>
  );
}
