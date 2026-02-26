export const POLLING_INTERVALS = {
  fast: 5000,
  normal: 15000,
  slow: 30000,
  lazy: 60000,
} as const;

export const DEFAULT_POLLING_INTERVAL = POLLING_INTERVALS.normal;

export const TIME_RANGES = [
  { label: '15m', value: '15m', seconds: 900 },
  { label: '30m', value: '30m', seconds: 1800 },
  { label: '1h', value: '1h', seconds: 3600 },
  { label: '3h', value: '3h', seconds: 10800 },
  { label: '6h', value: '6h', seconds: 21600 },
  { label: '12h', value: '12h', seconds: 43200 },
  { label: '24h', value: '24h', seconds: 86400 },
  { label: '7d', value: '7d', seconds: 604800 },
] as const;

export const SEVERITY_ORDER: Record<string, number> = {
  critical: 0,
  high: 1,
  warning: 2,
  medium: 3,
  info: 4,
  low: 5,
};

export const NAV_ITEMS = [
  { label: 'Command Centre', href: '/', icon: 'LayoutDashboard' },
  { label: 'Alerts', href: '/alerts', icon: 'Bell' },
  { label: 'Security', href: '/security', icon: 'Shield' },
  { label: 'Metrics', href: '/metrics', icon: 'Activity' },
  { label: 'Logs', href: '/logs', icon: 'ScrollText' },
] as const;

export const SERVICE_NAMES = {
  prometheus: 'Prometheus',
  alertmanager: 'Alertmanager',
  loki: 'Loki',
  wazuh: 'Wazuh Manager',
  'wazuh-indexer': 'Wazuh Indexer',
  crowdsec: 'CrowdSec',
} as const;
