'use client';

import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ErrorStateProps {
  message?: string;
  className?: string;
}

export function ErrorState({ message = 'Failed to load data', className }: ErrorStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-8 text-text-secondary', className)}>
      <AlertTriangle className="h-8 w-8 text-amber mb-2" />
      <p className="text-sm font-mono">{message}</p>
    </div>
  );
}
