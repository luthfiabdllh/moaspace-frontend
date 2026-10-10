import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  tone?: 'default' | 'warning' | 'danger' | 'success';
  className?: string;
}

const TONE_CLASSES: Record<NonNullable<StatCardProps['tone']>, string> = {
  default: 'bg-primary/10 text-primary border-primary/20',
  warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  danger: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
  success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
};

export function StatCard({ icon: Icon, label, value, tone = 'default', className }: StatCardProps) {
  return (
    <div className={cn('flex items-center gap-2.5 sm:gap-3 rounded-xl border border-border/70 bg-card p-2.5 sm:p-3.5 min-w-0', className)}>
      <div className={cn('flex size-8 sm:size-9 shrink-0 items-center justify-center rounded-lg border', TONE_CLASSES[tone])}>
        <Icon className="size-3.5 sm:size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xl sm:text-2xl font-bold leading-tight tracking-tight text-foreground truncate">{value}</p>
        <p className="truncate text-3xs sm:text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
