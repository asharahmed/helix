'use client';

import { usePathname } from 'next/navigation';
import { Clock } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import { RefreshControl } from '@/components/shared/refresh-control';
import { NAV_ITEMS } from '@/lib/constants';
import { useHealth } from '@/lib/hooks';

const STATUS_MAP = {
  operational: { label: 'OPERATIONAL', className: 'text-green' },
  degraded: { label: 'DEGRADED', className: 'text-amber' },
  down: { label: 'OUTAGE', className: 'text-red' },
  loading: { label: 'CHECKING', className: 'text-muted' },
} as const;

export function Header() {
  const pathname = usePathname();
  const { data: health } = useHealth();
  const [time, setTime] = useState('');

  useEffect(() => {
    const update = () => {
      setTime(
        new Date().toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const systemStatus = useMemo(() => {
    if (!health) return STATUS_MAP.loading;
    const hasDown = health.services.some((s) => s.status === 'down');
    const hasDegraded = health.services.some((s) => s.status === 'degraded');
    if (hasDown) return STATUS_MAP.down;
    if (hasDegraded) return STATUS_MAP.degraded;
    return STATUS_MAP.operational;
  }, [health]);

  const currentPage = NAV_ITEMS.find((item) =>
    item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
  );

  return (
    <header className="sticky top-0 z-30 flex h-11 items-center justify-between border-b border-border bg-background/90 backdrop-blur-md px-6">
      <div className="flex items-center gap-3">
        <span className="text-sm font-sans font-medium text-text-primary tracking-tight">
          {currentPage?.label ?? 'Helix'}
        </span>
        <div className="h-3 w-px bg-border-bright" />
        <span className={`label-text transition-colors ${systemStatus.className}`}>
          {systemStatus.label}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <RefreshControl />
        <div className="flex items-center gap-1.5 text-muted">
          <Clock className="h-3 w-3" />
          <span className="font-mono text-[10px] tabular-nums">{time}</span>
        </div>
      </div>
    </header>
  );
}
