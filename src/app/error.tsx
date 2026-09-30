'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Global error boundary for the [lang] segment.
 * Catches runtime errors in Server and Client Components.
 */
export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log error to monitoring service (e.g. Sentry)
    console.error('[ErrorBoundary]', error);
  }, [error]);

  return (
    <div
      role="alert"
      className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center"
    >
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">
          Something went wrong
        </h1>
        <p className="text-muted-foreground max-w-md">
          An unexpected error occurred. Our team has been notified.
        </p>
        {process.env.NODE_ENV === 'development' && (
          <p className="text-destructive mt-2 rounded border p-2 font-mono text-sm">
            {error.message}
          </p>
        )}
      </div>
      <Button
        onClick={reset}
        variant="outline"
        aria-label="Try to recover from error"
      >
        Try again
      </Button>
    </div>
  );
}
