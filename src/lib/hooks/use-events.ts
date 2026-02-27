'use client';

import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { DEFAULT_POLLING_INTERVAL } from '@/lib/constants';
import type { BusEvent } from '@/lib/types';

export function useRecentEvents(limit = 50, interval?: number) {
  return useQuery<BusEvent[]>({
    queryKey: ['events', limit],
    queryFn: async () => {
      const res = await fetch(`/api/events?limit=${limit}`);
      if (!res.ok) throw new Error(`Failed: ${res.statusText}`);
      return res.json();
    },
    refetchInterval: interval ?? DEFAULT_POLLING_INTERVAL,
    placeholderData: keepPreviousData,
  });
}
