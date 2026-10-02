'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUIStore } from '@/store/ui.store';
import { cn } from '@/lib/utils';

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const setStoreTheme = useUIStore((state) => state.setTheme);
  const mounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const toggleTheme = () => {
    const nextTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    setStoreTheme(nextTheme);
  };

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        aria-label="Toggle theme"
        className={cn('h-9 w-9 rounded-xl border border-border/40 opacity-70', className)}
      >
        <Sun className="h-4 w-4" />
      </Button>
    );
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={isDark ? 'Beralih ke mode terang' : 'Beralih ke mode gelap'}
      title={isDark ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
      className={cn(
        'relative h-9 w-9 rounded-xl border border-border/40 bg-background/50 backdrop-blur-sm hover:bg-accent/60 transition-all cursor-pointer',
        className
      )}
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0 text-amber-500" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100 text-sky-400" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
