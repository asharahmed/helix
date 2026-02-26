'use client';

import { cn } from '@/lib/utils';

interface LoadingSkeletonProps {
  className?: string;
  lines?: number;
}

export function LoadingSkeleton({ className, lines = 3 }: LoadingSkeletonProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="shimmer h-4 rounded"
          style={{ width: `${85 - i * 15}%` }}
        />
      ))}
    </div>
  );
}

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('glow-card p-4 space-y-3', className)}>
      <div className="shimmer h-4 w-1/3 rounded" />
      <div className="shimmer h-8 w-2/3 rounded" />
      <div className="shimmer h-3 w-1/2 rounded" />
    </div>
  );
}
