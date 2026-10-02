'use client';

import * as React from 'react';
import { Check, Circle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type StepState = 'completed' | 'active' | 'upcoming' | 'warning' | 'error';

interface StepperContextValue {
  activeStep: number;
}

const StepperContext = React.createContext<StepperContextValue>({
  activeStep: 0,
});

export interface StepperProps extends React.HTMLAttributes<HTMLDivElement> {
  activeStep?: number;
}

export function Stepper({
  activeStep = 0,
  className,
  children,
  ...props
}: StepperProps) {
  return (
    <StepperContext.Provider value={{ activeStep }}>
      <div
        role="list"
        aria-label="Progres Tahapan"
        className={cn('flex w-full items-center', className)}
        {...props}
      >
        {children}
      </div>
    </StepperContext.Provider>
  );
}

export interface StepperItemProps extends React.HTMLAttributes<HTMLDivElement> {
  step: number;
  state?: StepState;
}

export function StepperItem({
  step,
  state = 'upcoming',
  className,
  children,
  ...props
}: StepperItemProps) {
  return (
    <div
      role="listitem"
      data-state={state}
      data-step={step}
      className={cn('relative flex flex-1 items-center last:flex-none', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export interface StepperTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

export function StepperTrigger({
  className,
  children,
  type = 'button',
  ...props
}: StepperTriggerProps) {
  return (
    <button
      type={type}
      className={cn(
        'group flex items-center gap-3 text-left focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/20 rounded-lg p-1.5 transition-all select-none',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export interface StepperIndicatorProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  state?: StepState;
  stepNumber?: number;
  icon?: React.ReactNode;
}

export function StepperIndicator({
  state = 'upcoming',
  stepNumber,
  icon,
  className,
  ...props
}: StepperIndicatorProps) {
  const renderContent = () => {
    if (icon) return icon;
    if (state === 'completed') {
      return <Check className="size-4 stroke-[2.5]" />;
    }
    if (state === 'error') {
      return <AlertCircle className="size-4 stroke-[2.5]" />;
    }
    if (stepNumber !== undefined) {
      return <span className="tabular-nums">{stepNumber}</span>;
    }
    return <Circle className="size-2 fill-current" />;
  };

  return (
    <span
      data-state={state}
      className={cn(
        'flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-all duration-200',
        state === 'completed' &&
          'bg-emerald-600 text-white dark:bg-emerald-500 shadow-xs ring-4 ring-emerald-500/15',
        state === 'active' &&
          'border-2 border-primary bg-background text-primary shadow-xs ring-4 ring-primary/15 font-bold',
        state === 'warning' &&
          'border-2 border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 ring-4 ring-amber-500/15 font-bold',
        state === 'error' &&
          'border-2 border-destructive bg-destructive/10 text-destructive ring-4 ring-destructive/15 font-bold',
        state === 'upcoming' &&
          'border border-border/80 bg-muted/40 text-muted-foreground/70',
        className
      )}
      {...props}
    >
      {renderContent()}
    </span>
  );
}

export interface StepperTitleProps
  extends React.HTMLAttributes<HTMLHeadingElement> {}

export function StepperTitle({ className, ...props }: StepperTitleProps) {
  return (
    <h4
      className={cn(
        'text-xs font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary',
        className
      )}
      {...props}
    />
  );
}

export interface StepperDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement> {}

export function StepperDescription({
  className,
  ...props
}: StepperDescriptionProps) {
  return (
    <p
      className={cn('text-2xs text-muted-foreground line-clamp-1', className)}
      {...props}
    />
  );
}

export interface StepperSeparatorProps
  extends React.HTMLAttributes<HTMLDivElement> {
  state?: StepState;
}

export function StepperSeparator({
  state = 'upcoming',
  className,
  ...props
}: StepperSeparatorProps) {
  return (
    <div
      role="separator"
      data-state={state}
      className={cn(
        'mx-2 h-0.5 flex-1 rounded-full bg-border/60 transition-colors duration-200',
        (state === 'completed' || state === 'active') && 'bg-primary/70',
        state === 'warning' && 'bg-amber-400/60 dark:bg-amber-600/60',
        state === 'error' && 'bg-destructive/60',
        className
      )}
      {...props}
    />
  );
}
