'use client';

import { useQuery } from '@tanstack/react-query';
import type { HealthResponse } from '@/lib/types';

export function useHealth(interval = 30000) {
  return useQuery<HealthResponse>({
    queryKey: ['health'],
    queryFn: async () => {
      const res = await fetch('/api/health');
      return res.json();
    },
    refetchInterval: interval,
  });
}
