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
    <header className="sticky top-0 z-30 flex h-11 items-center justify-between border-b border-border bg-background/90 backdrop-blur-md px-6">
      <div className="flex items-center gap-3">
        <span className="text-sm font-sans font-medium text-text-primary tracking-tight">
          {currentPage?.label ?? 'Helix'}
        </span>
        <div className="h-3 w-px bg-border-bright" />
        <span className="label-text text-green">OPERATIONAL</span>
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
