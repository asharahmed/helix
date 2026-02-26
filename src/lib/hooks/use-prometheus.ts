'use client';

import { useQuery } from '@tanstack/react-query';
import { DEFAULT_POLLING_INTERVAL } from '@/lib/constants';
import type { PrometheusQueryResult, PrometheusAlertGroup, PrometheusTargetResponse } from '@/lib/types';

export function usePrometheusQuery(query: string, enabled = true, interval?: number) {
  return useQuery<PrometheusQueryResult>({
    queryKey: ['prometheus', 'query', query],
    queryFn: async () => {
      const res = await fetch(`/api/prometheus/query?query=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error(`Query failed: ${res.statusText}`);
      return res.json();
    },
    enabled,
    refetchInterval: interval ?? DEFAULT_POLLING_INTERVAL,
  });
}

export function usePrometheusRange(
  query: string,
  start: string,
  end: string,
  step: string,
  enabled = true,
  interval?: number
) {
  return useQuery<PrometheusQueryResult>({
    queryKey: ['prometheus', 'range', query, start, end, step],
    queryFn: async () => {
      const params = new URLSearchParams({ query, start, end, step });
      const res = await fetch(`/api/prometheus/query?${params}`);
      if (!res.ok) throw new Error(`Range query failed: ${res.statusText}`);
      return res.json();
    },
    enabled,
    refetchInterval: interval ?? DEFAULT_POLLING_INTERVAL,
  });
}

export function usePrometheusAlerts(interval?: number) {
  return useQuery<{ data: { groups: PrometheusAlertGroup[] } }>({
    queryKey: ['prometheus', 'alerts'],
    queryFn: async () => {
      const res = await fetch('/api/prometheus/alerts');
      if (!res.ok) throw new Error(`Alerts failed: ${res.statusText}`);
      return res.json();
    },
    refetchInterval: interval ?? DEFAULT_POLLING_INTERVAL,
  });
}

export function usePrometheusTargets(interval?: number) {
  return useQuery<PrometheusTargetResponse>({
    queryKey: ['prometheus', 'targets'],
    queryFn: async () => {
      const res = await fetch('/api/prometheus/targets');
      if (!res.ok) throw new Error(`Targets failed: ${res.statusText}`);
      return res.json();
    },
    refetchInterval: interval ?? DEFAULT_POLLING_INTERVAL,
  });
}
