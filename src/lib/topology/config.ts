import type { TopologyNode, TopologyEdge } from '@/lib/types';

export const TOPOLOGY_NODES: Omit<TopologyNode, 'status' | 'alertCount'>[] = [
  // Core services
  { id: 'prometheus', label: 'Prometheus', type: 'core' },
  { id: 'alertmanager', label: 'Alertmanager', type: 'core' },
  { id: 'loki', label: 'Loki', type: 'core' },
  { id: 'grafana', label: 'Grafana', type: 'core' },

  // Security
  { id: 'wazuh-manager', label: 'Wazuh Mgr', type: 'security' },
  { id: 'wazuh-indexer', label: 'Wazuh Idx', type: 'security' },
  { id: 'crowdsec', label: 'CrowdSec', type: 'security' },

  // Proxy
  { id: 'caddy', label: 'Caddy', type: 'proxy' },
  { id: 'authelia', label: 'Authelia', type: 'proxy' },

  // Exporters
  { id: 'node-exporter', label: 'Node Exp', type: 'exporter' },
  { id: 'cadvisor', label: 'cAdvisor', type: 'exporter' },
  { id: 'blackbox', label: 'Blackbox', type: 'exporter' },
];

export const TOPOLOGY_EDGES: TopologyEdge[] = [
  // Prometheus scrapes
  { source: 'prometheus', target: 'node-exporter', type: 'data' },
  { source: 'prometheus', target: 'cadvisor', type: 'data' },
  { source: 'prometheus', target: 'blackbox', type: 'data' },
  { source: 'prometheus', target: 'crowdsec', type: 'data' },

  // Alert flow
  { source: 'prometheus', target: 'alertmanager', type: 'alert' },

  // Log flow
  { source: 'loki', target: 'grafana', type: 'data' },
  { source: 'prometheus', target: 'grafana', type: 'data' },

  // Security
  { source: 'wazuh-manager', target: 'wazuh-indexer', type: 'data' },
  { source: 'crowdsec', target: 'caddy', type: 'data' },

  // Proxy
  { source: 'caddy', target: 'authelia', type: 'proxy' },
];

export const NODE_COLORS = {
  core: '#00d4ff',
  security: '#ffb800',
  proxy: '#00e676',
  exporter: '#6b7280',
} as const;

export const STATUS_COLORS = {
  healthy: '#00e676',
  degraded: '#ffb800',
  down: '#ff3b4f',
  unknown: '#6b7280',
} as const;
