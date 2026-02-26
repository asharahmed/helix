'use client';

import { useQuery } from '@tanstack/react-query';
import { DEFAULT_POLLING_INTERVAL } from '@/lib/constants';
import type { LokiQueryResponse, LokiLabelsResponse, LogEntry } from '@/lib/types';

export function useLokiQuery(
  query: string,
  limit = 100,
  start?: string,
  end?: string,
  enabled = true,
  interval?: number
) {
  return useQuery<LokiQueryResponse>({
    queryKey: ['loki', 'query', query, limit, start, end],
    queryFn: async () => {
      const params = new URLSearchParams({ query, limit: String(limit) });
      if (start) params.set('start', start);
      if (end) params.set('end', end);
      const res = await fetch(`/api/loki/query?${params}`);
      if (!res.ok) throw new Error(`Failed: ${res.statusText}`);
      return res.json();
    },
    enabled: enabled && !!query,
    refetchInterval: interval ?? DEFAULT_POLLING_INTERVAL,
  });
}

export function useLokiLabels() {
  return useQuery<LokiLabelsResponse>({
    queryKey: ['loki', 'labels'],
    queryFn: async () => {
      const res = await fetch('/api/loki/labels');
      if (!res.ok) throw new Error(`Failed: ${res.statusText}`);
      return res.json();
    },
    staleTime: 30000,
  });
}

export function useLokiLabelValues(label: string, enabled = true) {
  return useQuery<LokiLabelsResponse>({
    queryKey: ['loki', 'labelValues', label],
    queryFn: async () => {
      const res = await fetch(`/api/loki/labels?label=${encodeURIComponent(label)}`);
      if (!res.ok) throw new Error(`Failed: ${res.statusText}`);
      return res.json();
    },
    enabled: enabled && !!label,
    staleTime: 30000,
  });
}

/** Parse Loki streams into flat LogEntry array */
export function parseLokiStreams(data: LokiQueryResponse | undefined): LogEntry[] {
  if (!data?.data?.result) return [];
  const entries: LogEntry[] = [];

  for (const stream of data.data.result) {
    for (const [ts, line] of stream.values) {
      entries.push({
        timestamp: ts,
        line,
        labels: stream.stream,
        id: `${ts}-${line.slice(0, 20)}`,
      });
    }
  }

  return entries.sort((a, b) => {
    const tsA = BigInt(a.timestamp);
    const tsB = BigInt(b.timestamp);
    return tsA > tsB ? -1 : tsA < tsB ? 1 : 0;
  });
}
