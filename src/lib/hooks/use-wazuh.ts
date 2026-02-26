'use client';

import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { DEFAULT_POLLING_INTERVAL } from '@/lib/constants';
import type { WazuhAgentResponse, WazuhAlertSearchResponse } from '@/lib/types';

export function useWazuhAgents(interval?: number) {
  return useQuery<WazuhAgentResponse>({
    queryKey: ['wazuh-agents'],
    queryFn: async () => {
      const res = await fetch('/api/wazuh/agents');
      if (!res.ok) throw new Error(`Failed: ${res.statusText}`);
      return res.json();
    },
    refetchInterval: interval ?? DEFAULT_POLLING_INTERVAL,
    placeholderData: keepPreviousData,
  });
}

export function useWazuhAlerts(minutes = 60, size = 100, minLevel = 0, interval?: number) {
  return useQuery<WazuhAlertSearchResponse>({
    queryKey: ['wazuh-alerts', minutes, size, minLevel],
    queryFn: async () => {
      const params = new URLSearchParams({
        minutes: String(minutes),
        size: String(size),
        minLevel: String(minLevel),
      });
      const res = await fetch(`/api/wazuh/alerts?${params}`);
      if (!res.ok) throw new Error(`Failed: ${res.statusText}`);
      return res.json();
    },
    refetchInterval: interval ?? DEFAULT_POLLING_INTERVAL,
    placeholderData: keepPreviousData,
  });
}

export function useWazuhFIM(minutes = 60, size = 50, interval?: number) {
  return useQuery<WazuhAlertSearchResponse>({
    queryKey: ['wazuh-fim', minutes, size],
    queryFn: async () => {
      const params = new URLSearchParams({
        minutes: String(minutes),
        size: String(size),
      });
      const res = await fetch(`/api/wazuh/fim?${params}`);
      if (!res.ok) throw new Error(`Failed: ${res.statusText}`);
      return res.json();
    },
    refetchInterval: interval ?? DEFAULT_POLLING_INTERVAL,
    placeholderData: keepPreviousData,
  });
}

export function useTriggerScan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ agentId, action }: { agentId: string; action: 'syscheck' | 'rootcheck' }) => {
      const res = await fetch('/api/wazuh/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId, action }),
      });
      if (!res.ok) throw new Error(`Failed: ${res.statusText}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wazuh-agents'] });
    },
  });
}
