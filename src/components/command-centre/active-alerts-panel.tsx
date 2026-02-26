'use client';

import { useMemo } from 'react';
import { Bell, BellOff, AlertTriangle, XCircle } from 'lucide-react';
import { GlowCard } from '@/components/shared/glow-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';
import { ErrorState } from '@/components/shared/error-state';
import { useAlertmanagerAlerts, useWazuhAlerts } from '@/lib/hooks';
import { formatRelativeTime, severityColor } from '@/lib/utils';
import { unifyAlerts } from '@/lib/utils/unify-alerts';
import type { UnifiedAlert } from '@/lib/types';

export function ActiveAlertsPanel() {
  const { data: amAlerts, isLoading: amLoading, error: amError } = useAlertmanagerAlerts();
  const { data: wazuhAlerts, isLoading: wazLoading, error: wazError } = useWazuhAlerts(60, 20, 8);

  const unifiedAlerts = useMemo<UnifiedAlert[]>(
    () => unifyAlerts(amAlerts, wazuhAlerts).filter((a) => a.status === 'active'),
    [amAlerts, wazuhAlerts]
  );

  const isLoading = amLoading || wazLoading;
  const hasError = amError || wazError;

  return (
    <GlowCard variant={unifiedAlerts.some((a) => a.severity === 'critical') ? 'red' : 'default'}>
      <div className="card-header">
        <Bell className="h-4 w-4 text-cyan" />
        <h2 className="card-title">Active Alerts</h2>
        {unifiedAlerts.length > 0 && (
          <Badge variant={unifiedAlerts.some((a) => a.severity === 'critical') ? 'red' : 'amber'}>
            {unifiedAlerts.length}
          </Badge>
        )}
      </div>

      {isLoading ? (
        <LoadingSkeleton lines={5} />
      ) : hasError ? (
        <ErrorState message="Failed to load alerts" />
      ) : unifiedAlerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-text-secondary">
          <BellOff className="h-8 w-8 mb-2 text-green" />
          <p className="text-sm font-mono">All clear</p>
        </div>
      ) : (
        <ScrollArea className="h-[340px]">
          <div className="space-y-2 pr-2">
            {unifiedAlerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-start gap-3 rounded-md border border-border bg-background/50 p-3 hover:border-border-bright transition-colors"
              >
                <div className="mt-0.5">
                  {alert.severity === 'critical' ? (
                    <XCircle className="h-4 w-4 text-red" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-amber" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-mono font-medium ${severityColor(alert.severity)}`}>
                      {alert.title}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary mt-0.5 truncate">
                    {alert.description}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Badge variant={alert.source === 'prometheus' ? 'cyan' : 'amber'}>
                      {alert.source}
                    </Badge>
                    <span className="text-[10px] font-mono text-muted">
                      {formatRelativeTime(alert.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </GlowCard>
  );
}
