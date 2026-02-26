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
      <Sidebar />
      <div className="ml-16 pb-8">
        <Header />
        <main key={pathname} className="p-6 animate-page-enter">
          {children}
        </main>
      </div>
      <StatusBar sseState={connectionState} />
    </div>
  );
}
