'use client';

import { useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import {
  LayoutDashboard,
  Bell,
  Shield,
  Activity,
  ScrollText,
  Hexagon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { NAV_ITEMS } from '@/lib/constants';
import { prefetchRouteData } from '@/lib/prefetch';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Bell,
  Shield,
  Activity,
  ScrollText,
};

export function Sidebar() {
  const pathname = usePathname();
  const queryClient = useQueryClient();

  const handlePrefetch = useCallback(
    (href: string) => prefetchRouteData(queryClient, href),
    [queryClient]
  );

  return (
    <TooltipProvider delayDuration={150}>
      <aside className="fixed left-0 top-0 z-40 flex h-screen w-16 flex-col items-center border-r border-border bg-surface py-4">
        {/* Logo */}
        <Link href="/" className="mb-8 flex items-center justify-center group">
          <Hexagon className="h-8 w-8 text-cyan transition-transform duration-200 group-hover:scale-110" strokeWidth={1.5} />
        </Link>

        {/* Nav items */}
        <nav className="flex flex-1 flex-col items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const Icon = iconMap[item.icon];
            const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);

            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    onMouseEnter={() => handlePrefetch(item.href)}
                    className={cn(
                      'relative flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-150',
                      isActive
                        ? 'bg-cyan/10 text-cyan'
                        : 'text-text-secondary hover:text-text-primary hover:bg-white/[0.03]'
                    )}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-5 bg-cyan rounded-r" />
                    )}
                    <Icon className="h-5 w-5" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={8}>
                  <p>{item.label}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </nav>

        {/* Status indicator */}
        <div className="mt-auto">
          <div className="h-2 w-2 rounded-full bg-cyan animate-glow-pulse" />
        </div>
      </aside>
    </TooltipProvider>
  );
}
