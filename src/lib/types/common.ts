export type ServiceName =
  | 'prometheus'
  | 'alertmanager'
  | 'loki'
  | 'wazuh'
  | 'wazuh-indexer'
  | 'crowdsec';

export type ServiceStatus = 'healthy' | 'degraded' | 'down' | 'unknown';

export interface ServiceHealth {
  name: ServiceName;
  status: ServiceStatus;
  latency?: number;
  error?: string;
}

export interface HealthResponse {
  status: 'ok' | 'degraded' | 'down';
  services: ServiceHealth[];
  timestamp: string;
}

export interface BusEvent {
  type: 'alert' | 'security' | 'system';
  source: 'alertmanager' | 'wazuh';
  data: unknown;
  timestamp: string;
}

export interface TopologyNode {
  id: string;
  label: string;
  type: 'core' | 'exporter' | 'security' | 'proxy';
  status: ServiceStatus;
  alertCount: number;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface TopologyEdge {
  source: string;
  target: string;
  type: 'data' | 'alert' | 'proxy';
}

export interface UnifiedAlert {
  id: string;
  source: 'prometheus' | 'wazuh';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  timestamp: string;
  status: string;
  labels: Record<string, string>;
  raw: unknown;
}
