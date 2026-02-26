'use client';

import { FileWarning } from 'lucide-react';
import { GlowCard } from '@/components/shared/glow-card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';
import { ErrorState } from '@/components/shared/error-state';
import { useWazuhFIM } from '@/lib/hooks';
import { formatRelativeTime } from '@/lib/utils';

export function FIMEvents() {
  const { data, isLoading, error } = useWazuhFIM(360, 50);

  const events = data?.hits?.hits ?? [];

  return (
    <GlowCard>
      <div className="card-header">
        <FileWarning className="h-4 w-4 text-amber" />
        <h2 className="card-title">File Integrity Events</h2>
        {events.length > 0 && (
          <Badge variant="amber">{events.length}</Badge>
        )}
      </div>

      {isLoading ? (
        <LoadingSkeleton lines={4} />
      ) : error ? (
        <ErrorState message="Failed to load FIM events" />
      ) : events.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-text-secondary">
          <FileWarning className="h-6 w-6 text-muted mb-2" />
          <p className="text-sm font-mono">No FIM events</p>
        </div>
      ) : (
        <ScrollArea className="h-[300px]">
          <table className="data-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Agent</th>
                <th>Path</th>
                <th>Event</th>
              </tr>
            </thead>
            <tbody>
              {events.map((hit) => {
                const src = hit._source;
                const syscheck = src.syscheck;
                if (!syscheck) return null;

                return (
                  <tr key={hit._id}>
                    <td>
                      <span className="text-xs font-mono text-muted">
                        {formatRelativeTime(src.timestamp)}
                      </span>
                    </td>
                    <td>
                      <span className="text-xs font-mono text-text-primary">
                        {src.agent.name}
                      </span>
                    </td>
                    <td>
                      <span className="text-xs font-mono text-cyan truncate block max-w-[250px]">
                        {syscheck.path}
                      </span>
                    </td>
                    <td>
                      <Badge
                        variant={
                          syscheck.event === 'deleted'
                            ? 'red'
                            : syscheck.event === 'modified'
                            ? 'amber'
                            : 'cyan'
                        }
                      >
                        {syscheck.event}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </ScrollArea>
      )}
    </GlowCard>
  );
}
