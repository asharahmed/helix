'use client';

import { useQuery, keepPreviousData, type UseQueryResult } from '@tanstack/react-query';
import type { TopologyData } from '@/lib/types';

export function useTopology(interval = 60000): UseQueryResult<TopologyData> {
  return useQuery<TopologyData>({
    queryKey: ['topology'],
    queryFn: async () => {
      const res = await fetch('/api/topology');
      if (!res.ok) throw new Error(`Failed: ${res.statusText}`);
      return res.json();
    },
    refetchInterval: interval,
    placeholderData: keepPreviousData,
  });
}
