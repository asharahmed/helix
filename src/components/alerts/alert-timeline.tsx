'use client';

import { useMemo } from 'react';
import { useAlertmanagerAlerts } from '@/lib/hooks';
import { GlowCard } from '@/components/shared/glow-card';
import { Badge } from '@/components/ui/badge';
import { formatTimestamp } from '@/lib/utils';

export function AlertTimeline() {
  const { data: alerts } = useAlertmanagerAlerts();

  const timelineData = useMemo(() => {
    if (!alerts) return [];
    return alerts
      .slice(0, 20)
      .sort((a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime())
      .map((alert) => ({
        id: alert.fingerprint,
        name: alert.labels.alertname,
        state: alert.status.state,
        start: alert.startsAt,
        severity: alert.labels.severity || 'info',
      }));
  }, [alerts]);

  return (
    <GlowCard>
      <h3 className="text-sm font-sans font-medium text-text-primary mb-3">
        Alert History
      </h3>

      {timelineData.length === 0 ? (
        <p className="text-sm font-mono text-text-secondary text-center py-4">
          No alert history
        </p>
      ) : (
        <div className="space-y-2">
          {timelineData.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 text-xs font-mono"
            >
              <span className="text-muted w-16 shrink-0">
                {formatTimestamp(item.start)}
              </span>
              <div
                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                  item.state === 'active' ? 'bg-red' : 'bg-green'
                }`}
              />
              <span className="text-text-primary truncate">{item.name}</span>
              <Badge
                variant={
                  item.severity === 'critical'
                    ? 'red'
                    : item.severity === 'warning'
                    ? 'amber'
                    : 'default'
                }
                className="ml-auto shrink-0"
              >
                {item.state}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </GlowCard>
  );
}
