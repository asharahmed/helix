'use client';

import { Box, Users, Target, ShieldBan, BellOff } from 'lucide-react';
import { DataCounter } from '@/components/shared/data-counter';
import { GlowCard } from '@/components/shared/glow-card';
import { CardSkeleton } from '@/components/shared/loading-skeleton';
import {
  usePrometheusTargets,
  useAlertmanagerAlerts,
  useAlertmanagerSilences,
  useWazuhAgents,
  useCrowdSecDecisions,
} from '@/lib/hooks';

export function SystemStatusSummary() {
  const { data: targets, isLoading: targetsLoading } = usePrometheusTargets();
  const { data: amAlerts } = useAlertmanagerAlerts();
  const { data: silences } = useAlertmanagerSilences();
  const { data: agents, isLoading: agentsLoading } = useWazuhAgents();
  const { data: decisions, isLoading: decisionsLoading } = useCrowdSecDecisions();

  const targetsUp = targets?.data?.activeTargets?.filter((t) => t.health === 'up').length ?? 0;
  const targetsTotal = targets?.data?.activeTargets?.length ?? 0;
  const activeAlerts = amAlerts?.filter((a) => a.status.state === 'active').length ?? 0;
  const activeSilences = silences?.filter((s) => s.status.state === 'active').length ?? 0;
  const agentCount = agents?.data?.total_affected_items ?? 0;
  const activeAgents = agents?.data?.affected_items?.filter((a) => a.status === 'active').length ?? 0;
  const banCount = Array.isArray(decisions) ? decisions.length : 0;

  const cards = [
    {
      icon: Target,
      label: 'Targets',
      value: targetsUp,
      subtitle: `${targetsUp}/${targetsTotal} up`,
      color: targetsUp === targetsTotal ? 'green' as const : 'amber' as const,
      loading: targetsLoading,
    },
    {
      icon: Users,
      label: 'Wazuh Agents',
      value: activeAgents,
      subtitle: `${activeAgents}/${agentCount} active`,
      color: 'cyan' as const,
      loading: agentsLoading,
    },
    {
      icon: ShieldBan,
      label: 'CrowdSec Bans',
      value: banCount,
      subtitle: `active decisions`,
      color: banCount > 0 ? 'red' as const : 'green' as const,
      loading: decisionsLoading,
    },
    {
      icon: BellOff,
      label: 'Silences',
      value: activeSilences,
      subtitle: `active silences`,
      color: 'default' as const,
      loading: false,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {cards.map((card) => {
        if (card.loading) return <CardSkeleton key={card.label} />;
        const Icon = card.icon;
        return (
          <GlowCard key={card.label} className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <Icon className="h-4 w-4 text-text-secondary" />
              <span className="label-text">{card.label}</span>
            </div>
            <DataCounter value={card.value} label={card.subtitle} color={card.color} />
          </GlowCard>
        );
      })}
    </div>
  );
}
