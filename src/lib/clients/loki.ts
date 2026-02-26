import { cached } from '@/lib/cache';
import type { LokiQueryResponse, LokiLabelsResponse } from '@/lib/types';

const LOKI_URL = process.env.LOKI_URL || 'http://loki:3100';

export async function queryLoki(
  query: string,
  limit = 100,
  start?: string,
  end?: string,
  direction: 'forward' | 'backward' = 'backward'
): Promise<LokiQueryResponse> {
  const params = new URLSearchParams({
    query,
    limit: String(limit),
    direction,
  });
  if (start) params.set('start', start);
  if (end) params.set('end', end);

  return cached<LokiQueryResponse>(
    `loki:query:${query}:${limit}:${start}:${end}:${direction}`,
    () => fetch(`${LOKI_URL}/loki/api/v1/query_range?${params}`)
  );
}

export async function getLokiLabels(): Promise<LokiLabelsResponse> {
  return cached<LokiLabelsResponse>(
    'loki:labels',
    () => fetch(`${LOKI_URL}/loki/api/v1/labels`)
  );
}

export async function getLokiLabelValues(label: string): Promise<LokiLabelsResponse> {
  return cached<LokiLabelsResponse>(
    `loki:labelvals:${label}`,
    () => fetch(`${LOKI_URL}/loki/api/v1/label/${encodeURIComponent(label)}/values`)
  );
}

/**
 * Returns a Response with streaming body for Loki tail.
 * The caller must pass req.signal for abort propagation.
 */
export function tailLoki(query: string, signal: AbortSignal, start?: string): Promise<Response> {
  const params = new URLSearchParams({ query, delay_for: '0', limit: '100' });
  if (start) params.set('start', start);
  return fetch(`${LOKI_URL}/loki/api/v1/tail?${params}`, { signal });
}

export const LOKI_URL_INTERNAL = LOKI_URL;
