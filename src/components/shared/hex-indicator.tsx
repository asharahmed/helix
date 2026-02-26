'use client';

import { cn } from '@/lib/utils';
import type { ServiceStatus } from '@/lib/types';

interface HexIndicatorProps {
  status: ServiceStatus;
  size?: 'sm' | 'md' | 'lg';
  pulse?: boolean;
}

const statusColors: Record<ServiceStatus, string> = {
  healthy: 'bg-green shadow-green/50',
  degraded: 'bg-amber shadow-amber/50',
  down: 'bg-red shadow-red/50',
  unknown: 'bg-muted shadow-muted/50',
};

const sizeClasses = {
  sm: 'w-2 h-2',
  md: 'w-3 h-3',
  lg: 'w-4 h-4',
};

export function HexIndicator({ status, size = 'md', pulse = false }: HexIndicatorProps) {
  return (
    <div
      className={cn(
        'rounded-full shadow-[0_0_8px]',
        statusColors[status],
        sizeClasses[size],
        pulse && status === 'down' && 'animate-glow-pulse'
      )}
    />
  );
}
