'use client';

import { useHealth } from '@/lib/hooks';
import { HexIndicator } from '@/components/shared/hex-indicator';
import { SERVICE_NAMES } from '@/lib/constants';
import type { ServiceName } from '@/lib/types';
import type { SSEConnectionState } from '@/lib/hooks/use-sse';

const SSE_INDICATOR: Record<SSEConnectionState, { color: string; dot: string }> = {
  connected: { color: 'text-green', dot: 'bg-green' },
  connecting: { color: 'text-amber', dot: 'bg-amber animate-glow-pulse' },
  disconnected: { color: 'text-red', dot: 'bg-red' },
};

interface StatusBarProps {
  sseState?: SSEConnectionState;
}

export function StatusBar({ sseState = 'connecting' }: StatusBarProps) {
  const { data: health } = useHealth();
  const sse = SSE_INDICATOR[sseState];

  return (
    <footer className="fixed bottom-0 left-16 right-0 z-30 flex h-7 items-center justify-between border-t border-border bg-surface/95 backdrop-blur-sm px-4">
      <div className="flex items-center gap-4 overflow-x-auto">
        {health?.services.map((svc) => (
          <div key={svc.name} className="flex items-center gap-1.5 shrink-0 transition-opacity duration-300">
            <HexIndicator status={svc.status} size="sm" />
            <span className="text-[10px] font-mono text-text-secondary">
              {SERVICE_NAMES[svc.name as ServiceName] ?? svc.name}
            </span>
            {svc.latency !== undefined && (
              <span className={`text-[10px] font-mono ${svc.latency > 500 ? 'text-amber' : 'text-muted'}`}>
                {svc.latency}ms
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <div className={`h-1.5 w-1.5 rounded-full ${sse.dot}`} />
        <span className={`text-[10px] font-mono ${sse.color}`}>
          {sseState}
        </span>
      </div>
    </footer>
  );
}
