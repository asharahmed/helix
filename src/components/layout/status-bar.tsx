'use client';

import { useHealth } from '@/lib/hooks';
import { HexIndicator } from '@/components/shared/hex-indicator';
import { SERVICE_NAMES } from '@/lib/constants';
import type { ServiceName } from '@/lib/types';
import type { SSEConnectionState } from '@/lib/hooks/use-sse';

const SSE_STATUS_COLOR: Record<SSEConnectionState, string> = {
  connected: 'text-green',
  connecting: 'text-amber',
  disconnected: 'text-red',
};

interface StatusBarProps {
  sseState?: SSEConnectionState;
}

export function StatusBar({ sseState = 'connecting' }: StatusBarProps) {
  const { data: health } = useHealth();

  return (
    <footer className="fixed bottom-0 left-16 right-0 z-30 flex h-7 items-center justify-between border-t border-border bg-surface px-4">
      <div className="flex items-center gap-4">
        {health?.services.map((svc) => (
          <div key={svc.name} className="flex items-center gap-1.5">
            <HexIndicator status={svc.status} size="sm" />
            <span className="text-[10px] font-mono text-text-secondary">
              {SERVICE_NAMES[svc.name as ServiceName] ?? svc.name}
            </span>
            {svc.latency !== undefined && (
              <span className="text-[10px] font-mono text-muted">
                {svc.latency}ms
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <span className={`text-[10px] font-mono ${SSE_STATUS_COLOR[sseState]}`}>
          SSE: {sseState}
        </span>
      </div>
    </footer>
  );
}
