'use client';

import Link from 'next/link';
import { Gauge, ArrowRight } from 'lucide-react';
import { useMyCapacity } from '@/features/capacity/api/use-queries';
import { getUtilizationColor } from '@/features/capacity/components/utilization-badge';

export function MyCapacityWidget() {
  const { data: capacity, isLoading } = useMyCapacity();

  const config = capacity ? getUtilizationColor(capacity.utilizationPercentage) : null;

  return (
    <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-2xs">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
            <Gauge className="size-4" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">Kapasitas Saya</h3>
        </div>
        <Link
          href="/board?tab=CAPACITY"
          className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Detail <ArrowRight className="size-3" />
        </Link>
      </div>

      {isLoading || !capacity || !config ? (
        <div className="mt-4 space-y-2 animate-pulse">
          <div className="h-2.5 w-full rounded-full bg-muted" />
          <div className="h-4 w-1/2 rounded bg-muted" />
        </div>
      ) : (
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              Beban: <strong className="text-foreground">{capacity.activeSp} SP</strong> / {capacity.capacitySp} SP
            </span>
            <span className={`font-semibold ${config.text}`}>{capacity.utilizationPercentage}%</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full transition-all duration-500 ${config.barBg}`}
              style={{ width: `${Math.min(capacity.utilizationPercentage, 100)}%` }}
            />
          </div>
          <p className={`text-2xs ${config.text}`}>{config.label}</p>
        </div>
      )}
    </div>
  );
}
