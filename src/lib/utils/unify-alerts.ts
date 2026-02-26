import { SEVERITY_ORDER } from '@/lib/constants';
import type { AlertmanagerAlert, WazuhAlertSearchResponse, UnifiedAlert } from '@/lib/types';

export function unifyAlerts(
  amAlerts: AlertmanagerAlert[] | undefined,
  wazuhAlerts: WazuhAlertSearchResponse | undefined
): UnifiedAlert[] {
  const alerts: UnifiedAlert[] = [];

  if (amAlerts) {
    for (const alert of amAlerts) {
      alerts.push({
        id: alert.fingerprint,
        source: 'prometheus',
        severity:
          alert.labels.severity === 'critical'
            ? 'critical'
            : alert.labels.severity === 'warning'
            ? 'warning'
            : 'info',
        title: alert.labels.alertname || 'Unknown',
        description: alert.annotations?.description || alert.annotations?.summary || '',
        timestamp: alert.startsAt,
        status: alert.status.state,
        labels: alert.labels,
        raw: alert,
      });
    }
  }

  if (wazuhAlerts?.hits?.hits) {
    for (const hit of wazuhAlerts.hits.hits) {
      const src = hit._source;
      alerts.push({
        id: hit._id,
        source: 'wazuh',
        severity:
          src.rule.level >= 12 ? 'critical' : src.rule.level >= 8 ? 'warning' : 'info',
        title: src.rule.description,
        description: src.full_log || '',
        timestamp: src.timestamp,
        status: 'active',
        labels: {
          agent: src.agent.name,
          rule_id: src.rule.id,
          level: String(src.rule.level),
          ...(src.rule.groups ? { groups: src.rule.groups.join(', ') } : {}),
        },
        raw: hit,
      });
    }
  }

  return alerts.sort((a, b) => {
    const sa = SEVERITY_ORDER[a.severity] ?? 99;
    const sb = SEVERITY_ORDER[b.severity] ?? 99;
    if (sa !== sb) return sa - sb;
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });
}
