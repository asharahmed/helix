'use client';

import { useMemo } from 'react';
import { Clock, AlertTriangle, Shield, Activity } from 'lucide-react';
import { GlowCard } from '@/components/shared/glow-card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';
import { useAlertmanagerAlerts, useRecentEvents, useWazuhAlerts } from '@/lib/hooks';
import { formatRelativeTime } from '@/lib/utils';
import type { BusEvent } from '@/lib/types';

interface TimelineEvent {
  id: string;
  source: string;
  title: string;
  timestamp: string;
  type: 'alert' | 'security' | 'system';
}

function getPersistedEventTitle(event: BusEvent): string {
  const payload = event.data as Record<string, any> | undefined;

  if (event.source === 'alertmanager') {
    return (
      payload?.alerts?.[0]?.labels?.alertname ||
      payload?.alerts?.[0]?.annotations?.summary ||
      payload?.title ||
      'Alertmanager webhook received'
    );
  }

  if (event.source === 'wazuh') {
    return (
      payload?.rule?.description ||
      payload?._source?.rule?.description ||
      payload?.title ||
      'Wazuh event received'
    );
  }

  return 'System event';
}

export function EventsTimeline() {
  const { data: amAlerts, isLoading: amLoading } = useAlertmanagerAlerts();
  const { data: wazuhAlerts, isLoading: wazLoading } = useWazuhAlerts(60, 15, 6);
  const { data: persistedEvents, isLoading: persistedLoading } = useRecentEvents(15);

  const events = useMemo<TimelineEvent[]>(() => {
    const items: TimelineEvent[] = [];

    if (amAlerts) {
      for (const alert of amAlerts.slice(0, 8)) {
        items.push({
          id: `am-${alert.fingerprint}`,
          source: 'Alertmanager',
          title: alert.labels.alertname || 'Alert',
          timestamp: alert.updatedAt || alert.startsAt,
          type: 'alert',
        });
      }
    }

    if (wazuhAlerts?.hits?.hits) {
      for (const hit of wazuhAlerts.hits.hits.slice(0, 8)) {
        items.push({
          id: `waz-${hit._id}`,
          source: 'Wazuh',
          title: hit._source.rule.description,
          timestamp: hit._source.timestamp,
          type: 'security',
        });
      }
    }

    if (persistedEvents) {
      for (const [index, event] of persistedEvents.entries()) {
        items.push({
          id: `evt-${event.timestamp}-${index}`,
          source: event.source === 'alertmanager' ? 'Alertmanager' : event.source === 'wazuh' ? 'Wazuh' : 'System',
          title: getPersistedEventTitle(event),
          timestamp: event.timestamp,
          type: event.type,
        });
      }
    }

    return items
      .filter((event, index, list) => {
        const dedupeKey = `${event.source}:${event.title}:${event.timestamp}`;
        return index === list.findIndex((candidate) => `${candidate.source}:${candidate.title}:${candidate.timestamp}` === dedupeKey);
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 15);
  }, [amAlerts, persistedEvents, wazuhAlerts]);

  const isLoading = amLoading || wazLoading || persistedLoading;

  const typeIcon = (type: string) => {
    switch (type) {
      case 'alert':
        return <AlertTriangle className="h-3.5 w-3.5 text-amber" />;
      case 'security':
        return <Shield className="h-3.5 w-3.5 text-red" />;
      default:
        return <Activity className="h-3.5 w-3.5 text-cyan" />;
    }
  };

  return (
    <GlowCard>
      <div className="card-header">
        <Clock className="h-4 w-4 text-cyan" />
        <h2 className="card-title">Events Timeline</h2>
      </div>

      {isLoading ? (
        <LoadingSkeleton lines={6} />
      ) : events.length === 0 ? (
        <p className="text-sm text-text-secondary font-mono py-4 text-center">
          No recent events
        </p>
      ) : (
        <ScrollArea className="h-[340px]">
          <div className="relative pr-2">
            {/* Timeline line */}
            <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border" />

            <div className="space-y-3">
              {events.map((event) => (
                <div key={event.id} className="flex items-start gap-3 pl-1 rounded py-1 transition-colors duration-150 hover:bg-white/[0.02]">
                  <div className="relative z-10 mt-0.5">
                    {typeIcon(event.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-mono text-text-primary truncate">
                      {event.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge>{event.source}</Badge>
                      <span className="text-[10px] font-mono text-muted">
                        {formatRelativeTime(event.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>
      )}
    </GlowCard>
  );
}
