import * as React from 'react';
import { cn } from '@/lib/utils';

export interface UtilizationBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  percentage: number;
  showText?: boolean;
  size?: 'sm' | 'md';
}

export function getUtilizationColor(percentage: number) {
  if (percentage > 100) {
    return {
      bg: 'bg-rose-500/10 dark:bg-rose-950/40',
      text: 'text-rose-700 dark:text-rose-300',
      border: 'border-rose-300 dark:border-rose-800',
      barBg: 'bg-rose-500',
      indicator: 'bg-rose-500',
      label: 'Kelebihan Beban (>100%)',
      status: 'OVERLOAD' as const,
    };
  }
  if (percentage >= 70) {
    return {
      bg: 'bg-amber-500/10 dark:bg-amber-950/40',
      text: 'text-amber-700 dark:text-amber-300',
      border: 'border-amber-300 dark:border-amber-800',
      barBg: 'bg-amber-500',
      indicator: 'bg-amber-500',
      label: 'Optimal (70-100%)',
      status: 'WARNING' as const,
    };
  }
  return {
    bg: 'bg-emerald-500/10 dark:bg-emerald-950/40',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-300 dark:border-emerald-800',
    barBg: 'bg-emerald-500',
    indicator: 'bg-emerald-500',
    label: 'Tersedia (<70%)',
    status: 'NORMAL' as const,
  };
}

export const UtilizationBadge: React.FC<UtilizationBadgeProps> = ({
  percentage,
  showText = true,
  size = 'sm',
  className,
  ...props
}) => {
  const config = getUtilizationColor(percentage);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-medium transition-colors',
        config.bg,
        config.text,
        config.border,
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm',
        className
      )}
      {...props}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full animate-pulse', config.indicator)} />
      <span>{percentage}%</span>
      {showText && <span className="opacity-80">· {config.status === 'OVERLOAD' ? 'Overload' : config.status === 'WARNING' ? 'Sibuk' : 'Tersedia'}</span>}
    </span>
  );
};
