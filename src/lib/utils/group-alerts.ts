import { SEVERITY_ORDER } from '@/lib/constants';
import type { AlertGroup, UnifiedAlert } from '@/lib/types';

function getGroupIdentity(alert: UnifiedAlert): { key: string; label: string } {
  if (alert.source === 'prometheus') {
    const identity = alert.labels.instance || alert.labels.job || 'prometheus';
    return { key: `prom:${identity}`, label: identity };
  }

  const agent = alert.labels.agent || 'wazuh';
  return { key: `wazuh:${agent}`, label: agent };
}

function getHighestSeverity(alerts: UnifiedAlert[]): AlertGroup['highestSeverity'] {
  if (alerts.some((alert) => alert.severity === 'critical')) return 'critical';
  if (alerts.some((alert) => alert.severity === 'warning')) return 'warning';
  return 'info';
}

export function groupAlerts(alerts: UnifiedAlert[]): AlertGroup[] {
  const grouped = new Map<string, AlertGroup>();

  for (const alert of alerts) {
    const { key, label } = getGroupIdentity(alert);
    const current = grouped.get(key);
    if (current) {
      current.alerts.push(alert);
      current.count += 1;
      current.highestSeverity = getHighestSeverity(current.alerts);
      continue;
    }

    grouped.set(key, {
      key,
      label,
      alerts: [alert],
      highestSeverity: alert.severity === 'critical' ? 'critical' : alert.severity === 'warning' ? 'warning' : 'info',
      count: 1,
    });
  }

  return Array.from(grouped.values())
    .map((group) => ({
      ...group,
      alerts: group.alerts.sort((a, b) => {
        const sa = SEVERITY_ORDER[a.severity] ?? 99;
        const sb = SEVERITY_ORDER[b.severity] ?? 99;
        if (sa !== sb) return sa - sb;
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      }),
    }))
    .sort((a, b) => {
      const sa = SEVERITY_ORDER[a.highestSeverity] ?? 99;
      const sb = SEVERITY_ORDER[b.highestSeverity] ?? 99;
      if (sa !== sb) return sa - sb;
      return b.count - a.count;
    });
}
