'use client';

import { useState } from 'react';
import { ShieldBan, Trash2 } from 'lucide-react';
import { GlowCard } from '@/components/shared/glow-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';
import { ErrorState } from '@/components/shared/error-state';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { useCrowdSecDecisions, useDeleteDecision } from '@/lib/hooks';
import { useToast } from '@/components/shared/toast';

export function CrowdSecDecisions() {
  const { data: decisions, isLoading, error } = useCrowdSecDecisions();
  const deleteDecision = useDeleteDecision();
  const [unbanTarget, setUnbanTarget] = useState<{ id: number; value: string } | null>(null);
  const { toast } = useToast();

  return (
    <GlowCard>
      <div className="card-header">
        <ShieldBan className="h-4 w-4 text-red" />
        <h2 className="card-title">CrowdSec Decisions</h2>
        {decisions && decisions.length > 0 && (
          <Badge variant="red">{decisions.length}</Badge>
        )}
      </div>

      {isLoading ? (
        <LoadingSkeleton lines={4} />
      ) : error ? (
        <ErrorState message="Failed to load decisions" />
      ) : !decisions || decisions.length === 0 ? (
        <p className="text-sm font-mono text-text-secondary text-center py-4">
          No active bans
        </p>
      ) : (
        <ScrollArea className="h-[300px]">
          <table className="data-table">
            <thead>
              <tr>
                <th>IP/Value</th>
                <th>Scenario</th>
                <th>Type</th>
                <th>Duration</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {decisions.map((decision) => (
                <tr key={decision.id}>
                  <td>
                    <span className="text-sm font-mono text-red">{decision.value}</span>
                  </td>
                  <td>
                    <span className="text-xs font-mono text-text-secondary truncate block max-w-[200px]">
                      {decision.scenario}
                    </span>
                  </td>
                  <td>
                    <Badge variant="red">{decision.type}</Badge>
                  </td>
                  <td>
                    <span className="text-xs font-mono text-muted">{decision.duration}</span>
                  </td>
                  <td>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setUnbanTarget({ id: decision.id, value: decision.value })}
                      disabled={deleteDecision.isPending}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Unban
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </ScrollArea>
      )}
      <ConfirmDialog
        open={!!unbanTarget}
        onOpenChange={(open) => { if (!open) setUnbanTarget(null); }}
        title="Unban IP"
        description={`Unban ${unbanTarget?.value ?? ''}? This will remove the ban decision and allow traffic from this address.`}
        confirmLabel="Unban"
        isPending={deleteDecision.isPending}
        onConfirm={() => {
          if (unbanTarget) {
            deleteDecision.mutate(unbanTarget.id, {
              onSuccess: () => toast({ title: 'IP unbanned', variant: 'success' }),
              onError: (err) => toast({ title: `Unban failed: ${err.message}`, variant: 'error' }),
            });
          }
        }}
      />
    </GlowCard>
  );
}
