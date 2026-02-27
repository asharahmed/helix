'use client';

import { Users, Play, Search } from 'lucide-react';
import { GlowCard } from '@/components/shared/glow-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { HexIndicator } from '@/components/shared/hex-indicator';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';
import { ErrorState } from '@/components/shared/error-state';
import { useWazuhAgents, useTriggerScan } from '@/lib/hooks';
import { useToast } from '@/components/shared/toast';
import { formatRelativeTime } from '@/lib/utils';
import type { ServiceStatus } from '@/lib/types';

export function AgentGrid() {
  const { data, isLoading, error } = useWazuhAgents();
  const triggerScan = useTriggerScan();
  const { toast } = useToast();

  const agents = data?.data?.affected_items ?? [];

  const agentStatus = (status: string): ServiceStatus => {
    switch (status) {
      case 'active':
        return 'healthy';
      case 'disconnected':
        return 'down';
      default:
        return 'unknown';
    }
  };

  return (
    <GlowCard>
      <div className="card-header">
        <Users className="h-4 w-4 text-cyan" />
        <h2 className="card-title">Wazuh Agents</h2>
        {agents.length > 0 && (
          <Badge variant="cyan">{agents.length}</Badge>
        )}
      </div>

      {isLoading ? (
        <LoadingSkeleton lines={4} />
      ) : error ? (
        <ErrorState message="Failed to load agents" />
      ) : agents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-text-secondary">
          <Users className="h-6 w-6 text-muted mb-2" />
          <p className="text-sm font-mono">No agents found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className="flex items-center gap-3 rounded-md border border-border bg-background/50 p-3 hover:border-border-bright transition-colors duration-150"
            >
              <HexIndicator status={agentStatus(agent.status)} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono text-text-primary font-medium">
                    {agent.name}
                  </span>
                  <Badge>{agent.status}</Badge>
                </div>
                <div className="flex items-center gap-3 mt-1 text-[10px] font-mono text-muted">
                  <span>{agent.ip}</span>
                  {agent.os && (
                    <span>{agent.os.name} {agent.os.version}</span>
                  )}
                  <span>Last: {formatRelativeTime(agent.lastKeepAlive)}</span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={`Run syscheck scan for ${agent.name}`}
                  onClick={() => triggerScan.mutate(
                    { agentId: agent.id, action: 'syscheck' },
                    {
                      onSuccess: () => toast({ title: `Syscheck scan triggered on ${agent.name}`, variant: 'success' }),
                      onError: (err) => toast({ title: `Syscheck failed: ${err.message}`, variant: 'error' }),
                    }
                  )}
                  disabled={triggerScan.isPending || agent.status !== 'active'}
                  title="Trigger syscheck scan"
                >
                  <Search className="h-3 w-3 mr-1" />
                  Syscheck
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={`Run rootcheck scan for ${agent.name}`}
                  onClick={() => triggerScan.mutate(
                    { agentId: agent.id, action: 'rootcheck' },
                    {
                      onSuccess: () => toast({ title: `Rootcheck scan triggered on ${agent.name}`, variant: 'success' }),
                      onError: (err) => toast({ title: `Rootcheck failed: ${err.message}`, variant: 'error' }),
                    }
                  )}
                  disabled={triggerScan.isPending || agent.status !== 'active'}
                  title="Trigger rootcheck scan"
                >
                  <Play className="h-3 w-3 mr-1" />
                  Rootcheck
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </GlowCard>
  );
}
