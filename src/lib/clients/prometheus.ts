import { cached } from '@/lib/cache';
import type { PrometheusQueryResult, PrometheusAlertGroup, PrometheusTargetResponse } from '@/lib/types';

const PROMETHEUS_URL = process.env.PROMETHEUS_URL || 'http://prometheus:9090';

export async function queryPrometheus(query: string, time?: string): Promise<PrometheusQueryResult> {
  const params = new URLSearchParams({ query });
  if (time) params.set('time', time);
  return cached<PrometheusQueryResult>(
    `prom:query:${query}:${time || 'now'}`,
    () => fetch(`${PROMETHEUS_URL}/api/v1/query?${params}`)
  );
}

export async function queryPrometheusRange(
  query: string,
  start: string,
  end: string,
  step: string
): Promise<PrometheusQueryResult> {
  const params = new URLSearchParams({ query, start, end, step });
  return cached<PrometheusQueryResult>(
    `prom:range:${query}:${start}:${end}:${step}`,
    () => fetch(`${PROMETHEUS_URL}/api/v1/query_range?${params}`)
  );
}

export async function getPrometheusAlerts(): Promise<{ data: { groups: PrometheusAlertGroup[] } }> {
  return cached(
    'prom:alerts',
    () => fetch(`${PROMETHEUS_URL}/api/v1/rules?type=alert`)
  );
}

export async function getPrometheusTargets(): Promise<PrometheusTargetResponse> {
  return cached(
    'prom:targets',
    () => fetch(`${PROMETHEUS_URL}/api/v1/targets`)
  );
}
