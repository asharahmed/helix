'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { BusEvent } from '@/lib/types';

export type SSEConnectionState = 'connecting' | 'connected' | 'disconnected';

const MAX_RECONNECT_DELAY = 30000;
const INITIAL_RECONNECT_DELAY = 1000;

export function useSSE() {
  const queryClient = useQueryClient();
  const retryCount = useRef(0);
  const eventSourceRef = useRef<EventSource | null>(null);
  const [connectionState, setConnectionState] = useState<SSEConnectionState>('connecting');

  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    setConnectionState('connecting');
    const es = new EventSource('/api/sse/events');
    eventSourceRef.current = es;

    es.onopen = () => {
      retryCount.current = 0;
      setConnectionState('connected');
    };

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as BusEvent | { type: 'connected' };
        if (data.type === 'connected') return;

        // Invalidate relevant queries to trigger fresh pull
        // This avoids race conditions with stale in-flight poll responses
        if (data.type === 'alert') {
          queryClient.invalidateQueries({ queryKey: ['alerts'] });
          queryClient.invalidateQueries({ queryKey: ['alertmanager-alerts'] });
          queryClient.invalidateQueries({ queryKey: ['events'] });
        } else if (data.type === 'security') {
          queryClient.invalidateQueries({ queryKey: ['wazuh-alerts'] });
          queryClient.invalidateQueries({ queryKey: ['security'] });
          queryClient.invalidateQueries({ queryKey: ['events'] });
        }
      } catch {
        // Ignore parse errors (heartbeats, etc.)
      }
    };

    es.onerror = () => {
      es.close();
      eventSourceRef.current = null;
      setConnectionState('disconnected');

      // Exponential backoff with jitter
      const delay = Math.min(
        INITIAL_RECONNECT_DELAY * Math.pow(2, retryCount.current),
        MAX_RECONNECT_DELAY
      );
      const jitter = delay * 0.1 * Math.random();
      retryCount.current++;

      setTimeout(connect, delay + jitter);
    };
  }, [queryClient]);

  useEffect(() => {
    connect();
    return () => {
      eventSourceRef.current?.close();
      eventSourceRef.current = null;
    };
  }, [connect]);

  return { connectionState };
}
