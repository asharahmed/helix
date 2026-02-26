'use client';

import { useEffect } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Helix] Unhandled error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background grid-bg flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="glow-card p-8 text-center space-y-4">
          <AlertTriangle className="h-12 w-12 text-amber mx-auto" />
          <h1 className="text-lg font-serif font-semibold text-text-primary tracking-tight">
            System Error
          </h1>
          <p className="text-sm font-mono text-text-secondary">
            {error.message || 'An unexpected error occurred'}
          </p>
          {error.digest && (
            <p className="text-xs font-mono text-muted">
              Digest: {error.digest}
            </p>
          )}
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-cyan/30 bg-cyan/10 text-cyan text-sm font-mono hover:bg-cyan/20 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            Retry
          </button>
        </div>
      </div>
    </div>
  );
}
