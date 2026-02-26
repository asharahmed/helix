'use client';

import { usePathname } from 'next/navigation';
import { Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { RefreshControl } from '@/components/shared/refresh-control';
import { NAV_ITEMS } from '@/lib/constants';

export function Header() {
  const pathname = usePathname();
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

  const currentPage = NAV_ITEMS.find((item) =>
    item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
  );

  return (
    <header className="sticky top-0 z-30 flex h-12 items-center justify-between border-b border-border bg-background/80 backdrop-blur-sm px-6">
      <div className="flex items-center gap-3">
        <span className="text-sm font-sans font-medium text-text-primary">
          {currentPage?.label ?? 'Helix'}
        </span>
        <span className="text-xs text-muted">//</span>
        <span className="label-text">OPERATIONAL</span>
      </div>

      <div className="flex items-center gap-4">
        <RefreshControl />
        <div className="flex items-center gap-1.5 text-text-secondary">
          <Clock className="h-3.5 w-3.5" />
          <span className="font-mono text-xs tabular-nums">{time}</span>
        </div>
      </div>
    </header>
  );
}
