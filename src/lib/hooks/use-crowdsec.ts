'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DEFAULT_POLLING_INTERVAL } from '@/lib/constants';
import type { CrowdSecDecision } from '@/lib/types';

export function useCrowdSecDecisions(interval?: number) {
  return useQuery<CrowdSecDecision[]>({
    queryKey: ['crowdsec-decisions'],
    queryFn: async () => {
      const res = await fetch('/api/crowdsec/decisions');
      if (!res.ok) throw new Error(`Failed: ${res.statusText}`);
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
    refetchInterval: interval ?? DEFAULT_POLLING_INTERVAL,
  });
}

export function useDeleteDecision() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (decisionId: number) => {
      const res = await fetch(`/api/crowdsec/decisions?id=${decisionId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error(`Failed: ${res.statusText}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crowdsec-decisions'] });
    },
  });
}
