import { cn } from '@/lib/utils';

export interface StackedBarSegment {
  key: string;
  value: number;
  colorClass: string;
  label: string;
}

export function StackedBar({ segments, className }: { segments: StackedBarSegment[]; className?: string }) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);

  if (total === 0) {
    return (
      <div className={cn('h-2.5 w-full overflow-hidden rounded-full bg-muted', className)} />
    );
  }

  return (
    <div className={cn('flex h-2.5 w-full overflow-hidden rounded-full bg-muted', className)}>
      {segments
        .filter((s) => s.value > 0)
        .map((s) => (
          <div
            key={s.key}
            className={cn('h-full transition-all duration-500', s.colorClass)}
            style={{ width: `${(s.value / total) * 100}%` }}
            title={`${s.label}: ${s.value}`}
          />
        ))}
    </div>
  );
}
