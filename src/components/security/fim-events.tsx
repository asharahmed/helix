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
      <div className="flex items-center gap-2 mb-3">
        <FileWarning className="h-4 w-4 text-amber" />
        <h2 className="text-sm font-sans font-medium text-text-primary">
          File Integrity Events
        </h2>
        {events.length > 0 && (
          <Badge variant="amber">{events.length}</Badge>
        )}
      </div>

      {isLoading ? (
        <LoadingSkeleton lines={4} />
      ) : error ? (
        <ErrorState message="Failed to load FIM events" />
      ) : events.length === 0 ? (
        <p className="text-sm font-mono text-text-secondary text-center py-4">
          No FIM events
        </p>
      ) : (
        <ScrollArea className="h-[300px]">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="label-text text-left pb-2 pr-3">Time</th>
                <th className="label-text text-left pb-2 pr-3">Agent</th>
                <th className="label-text text-left pb-2 pr-3">Path</th>
                <th className="label-text text-left pb-2 pr-3">Event</th>
              </tr>
            </thead>
            <tbody>
              {events.map((hit) => {
                const src = hit._source;
                const syscheck = src.syscheck;
                if (!syscheck) return null;

                return (
                  <tr
                    key={hit._id}
                    className="border-b border-border/50 hover:bg-surface/50 transition-colors"
                  >
                    <td className="py-2 pr-3">
                      <span className="text-xs font-mono text-muted">
                        {formatRelativeTime(src.timestamp)}
                      </span>
                    </td>
                    <td className="py-2 pr-3">
                      <span className="text-xs font-mono text-text-primary">
                        {src.agent.name}
                      </span>
                    </td>
                    <td className="py-2 pr-3">
                      <span className="text-xs font-mono text-cyan truncate block max-w-[250px]">
                        {syscheck.path}
                      </span>
                    </td>
                    <td className="py-2 pr-3">
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
