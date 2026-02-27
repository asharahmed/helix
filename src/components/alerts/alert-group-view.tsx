'use client';

import { useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, VolumeX } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { groupAlerts } from '@/lib/utils/group-alerts';
import { formatRelativeTime, severityColor, truncate } from '@/lib/utils';
import type { UnifiedAlert } from '@/lib/types';

interface AlertGroupViewProps {
  alerts: UnifiedAlert[];
  onSelectAlert: (alert: UnifiedAlert) => void;
  onSilenceAlert: (alert: UnifiedAlert) => void;
}

export function AlertGroupView({
  alerts,
  onSelectAlert,
  onSilenceAlert,
}: AlertGroupViewProps) {
  const groups = useMemo(() => groupAlerts(alerts), [alerts]);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  return (
    <div className="space-y-3">
      {groups.map((group) => {
        const severityCounts = group.alerts.reduce(
          (acc, alert) => {
            acc[alert.severity] += 1;
            return acc;
          },
          { critical: 0, warning: 0, info: 0 }
        );
        const isCollapsed = collapsed[group.key] ?? false;

        return (
          <div key={group.key} className="rounded-lg border border-border bg-background/40">
            <button
              type="button"
              className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left hover:bg-white/[0.02]"
              aria-expanded={!isCollapsed}
              onClick={() =>
                setCollapsed((prev) => ({
                  ...prev,
                  [group.key]: !isCollapsed,
                }))
              }
            >
              <div className="flex items-center gap-2">
                {isCollapsed ? (
                  <ChevronRight className="h-4 w-4 text-muted" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted" />
                )}
                <span className="text-sm font-mono text-text-primary">{group.label}</span>
                <Badge
                  variant={
                    group.highestSeverity === 'critical'
                      ? 'red'
                      : group.highestSeverity === 'warning'
                      ? 'amber'
                      : 'default'
                  }
                >
                  {group.count}
                </Badge>
              </div>

              <div className="flex items-center gap-2 text-[10px] font-mono text-muted">
                <span>critical {severityCounts.critical}</span>
                <span>warning {severityCounts.warning}</span>
                <span>info {severityCounts.info}</span>
              </div>
            </button>

            {!isCollapsed ? (
              <div className="border-t border-border/60">
                <table className="data-table">
                  <tbody>
                    {group.alerts.map((alert) => (
                      <tr
                        key={alert.id}
                        className="cursor-pointer"
                        role="button"
                        tabIndex={0}
                        onClick={() => onSelectAlert(alert)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            onSelectAlert(alert);
                          }
                        }}
                      >
                        <td className="w-[120px]">
                          <Badge
                            variant={
                              alert.severity === 'critical'
                                ? 'red'
                                : alert.severity === 'warning'
                                ? 'amber'
                                : 'default'
                            }
                          >
                            {alert.severity}
                          </Badge>
                        </td>
                        <td>
                          <div>
                            <span className={`text-sm font-mono ${severityColor(alert.severity)}`}>
                              {truncate(alert.title, 50)}
                            </span>
                            {alert.description ? (
                              <p className="mt-0.5 max-w-md truncate text-xs text-muted">
                                {alert.description}
                              </p>
                            ) : null}
                          </div>
                        </td>
                        <td className="w-[140px]">
                          <span className="text-xs font-mono text-muted">
                            {formatRelativeTime(alert.timestamp)}
                          </span>
                        </td>
                        <td className="w-[120px]">
                          {alert.source === 'prometheus' ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(event) => {
                                event.stopPropagation();
                                onSilenceAlert(alert);
                              }}
                            >
                              <VolumeX className="mr-1 h-3.5 w-3.5" />
                              Silence
                            </Button>
                          ) : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
