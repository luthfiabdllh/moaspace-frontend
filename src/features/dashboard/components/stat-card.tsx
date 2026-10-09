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
    <div className={cn('flex items-center gap-3 rounded-xl border border-border/70 bg-card p-3.5', className)}>
      <div className={cn('flex size-9 shrink-0 items-center justify-center rounded-lg border', TONE_CLASSES[tone])}>
        <Icon className="size-4" />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold leading-tight tracking-tight text-foreground">{value}</p>
        <p className="truncate text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
