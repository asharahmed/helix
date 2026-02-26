import type { QueryClient } from '@tanstack/react-query';

const fetchJson = (url: string) => fetch(url).then((r) => r.json());

/**
 * Prefetch React Query data for a route on hover so it's in cache by click time.
 * Query keys match those used by the page's hooks exactly.
 */
export function prefetchRouteData(queryClient: QueryClient, href: string) {
  switch (href) {
    case '/security':
      queryClient.prefetchQuery({
        queryKey: ['wazuh-agents'],
        queryFn: () => fetchJson('/api/wazuh/agents'),
      });
      queryClient.prefetchQuery({
        queryKey: ['wazuh-alerts', 60, 200, 0],
        queryFn: () =>
          fetchJson('/api/wazuh/alerts?minutes=60&size=200&minLevel=0'),
      });
      queryClient.prefetchQuery({
        queryKey: ['crowdsec-decisions'],
        queryFn: () => fetchJson('/api/crowdsec/decisions'),
      });
      queryClient.prefetchQuery({
        queryKey: ['wazuh-fim', 360, 50],
        queryFn: () => fetchJson('/api/wazuh/fim?minutes=360&size=50'),
      });
      break;

    case '/metrics': {
      const queries = [
        'sum(rate(container_cpu_usage_seconds_total{name!=""}[5m])) by (name) * 100',
        'container_memory_usage_bytes{name!=""}',
        'probe_success',
        'probe_duration_seconds',
        'probe_http_status_code',
      ];
      for (const q of queries) {
        queryClient.prefetchQuery({
          queryKey: ['prometheus', 'query', q],
          queryFn: () =>
            fetchJson(
              `/api/prometheus/query?query=${encodeURIComponent(q)}`
            ),
        });
      }
      break;
    }

    case '/alerts':
      queryClient.prefetchQuery({
        queryKey: ['alertmanager-alerts'],
        queryFn: () => fetchJson('/api/alertmanager/alerts'),
      });
      queryClient.prefetchQuery({
        queryKey: ['prometheus', 'alerts'],
        queryFn: () => fetchJson('/api/prometheus/alerts'),
      });
      queryClient.prefetchQuery({
        queryKey: ['wazuh-alerts', 60, 200, 0],
        queryFn: () =>
          fetchJson('/api/wazuh/alerts?minutes=60&size=200&minLevel=0'),
      });
      break;

    case '/logs':
      queryClient.prefetchQuery({
        queryKey: ['loki', 'labels'],
        queryFn: () => fetchJson('/api/loki/labels'),
      });
      break;
  }
}
