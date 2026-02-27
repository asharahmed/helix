'use client';

import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { DEFAULT_POLLING_INTERVAL } from '@/lib/constants';
import type { WazuhVulnerabilityResponse } from '@/lib/types';

export function useWazuhVulnerabilities(size = 200, interval?: number) {
  return useQuery<WazuhVulnerabilityResponse>({
    queryKey: ['wazuh-vulnerabilities', size],
    queryFn: async () => {
      const params = new URLSearchParams({ size: String(size) });
      const res = await fetch(`/api/wazuh/vulnerabilities?${params}`);
      if (!res.ok) throw new Error(`Failed: ${res.statusText}`);
      return res.json();
    },
    refetchInterval: interval ?? DEFAULT_POLLING_INTERVAL,
    placeholderData: keepPreviousData,
  });
}
