'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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

  return (
    <TooltipProvider delayDuration={0}>
      <aside className="fixed left-0 top-0 z-40 flex h-screen w-16 flex-col items-center border-r border-border bg-surface py-4">
        {/* Logo */}
        <div className="mb-8 flex items-center justify-center">
          <Hexagon className="h-8 w-8 text-cyan" strokeWidth={1.5} />
        </div>

        {/* Nav items */}
        <nav className="flex flex-1 flex-col items-center gap-2">
          {NAV_ITEMS.map((item) => {
            const Icon = iconMap[item.icon];
            const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);

            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-lg transition-all',
                      isActive
                        ? 'bg-cyan/10 text-cyan border border-cyan/30'
                        : 'text-text-secondary hover:text-text-primary hover:bg-surface'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{item.label}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </nav>

        {/* Bottom spacer */}
        <div className="mt-auto">
          <div className="h-2 w-2 rounded-full bg-cyan animate-glow-pulse" />
        </div>
      </aside>
    </TooltipProvider>
  );
}
