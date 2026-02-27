'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { StatusBar } from './status-bar';
import { useSSE } from '@/lib/hooks';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  // Connect to SSE for real-time event updates
  const { connectionState } = useSSE();

  return (
    <div className="min-h-screen bg-background grid-bg">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:border focus:border-cyan/40 focus:bg-surface focus:px-3 focus:py-2 focus:text-sm focus:font-mono focus:text-text-primary"
      >
        Skip to content
      </a>
      <Sidebar />
      <div className="ml-16 pb-8">
        <Header />
        <main id="main-content" key={pathname} className="p-6 animate-page-enter">
          {children}
        </main>
      </div>
      <StatusBar sseState={connectionState} />
    </div>
  );
}
