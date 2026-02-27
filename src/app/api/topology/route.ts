import { NextResponse } from 'next/server';
import { cached } from '@/lib/cache';
import { getPrometheusTargets } from '@/lib/clients/prometheus';
import { FALLBACK_NODES, STATIC_EDGES } from '@/lib/topology/config';
import type { PrometheusTarget, ServiceStatus, TopologyData, TopologyEdge, TopologyNode } from '@/lib/types';

const LABEL_OVERRIDES: Record<string, string> = {
  prometheus: 'Prometheus',
  alertmanager: 'Alertmanager',
  loki: 'Loki',
  grafana: 'Grafana',
  'wazuh-manager': 'Wazuh Mgr',
  'wazuh-indexer': 'Wazuh Idx',
  crowdsec: 'CrowdSec',
  caddy: 'Caddy',
  authelia: 'Authelia',
  'node-exporter': 'Node Exp',
  cadvisor: 'cAdvisor',
  blackbox: 'Blackbox',
};

function normalizeId(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function titleCase(value: string): string {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function toServiceStatus(health: PrometheusTarget['health']): ServiceStatus {
  switch (health) {
    case 'up':
      return 'healthy';
    case 'down':
      return 'down';
    default:
      return 'unknown';
  }
}

function inferNodeId(job: string, instance: string): string {
  const lowerJob = job.toLowerCase();

  if (lowerJob === 'node' || lowerJob.includes('node-exporter')) return 'node-exporter';
  if (lowerJob.includes('cadvisor')) return 'cadvisor';
  if (lowerJob.includes('blackbox')) return 'blackbox';
  if (lowerJob.includes('wazuh') && lowerJob.includes('indexer')) return 'wazuh-indexer';
  if (lowerJob.includes('wazuh')) return 'wazuh-manager';
  if (lowerJob.includes('caddy')) return 'caddy';
  if (lowerJob.includes('authelia')) return 'authelia';
  if (lowerJob.includes('prometheus')) return 'prometheus';
  if (lowerJob.includes('alertmanager')) return 'alertmanager';
  if (lowerJob.includes('loki')) return 'loki';
  if (lowerJob.includes('grafana')) return 'grafana';
  if (lowerJob.includes('crowdsec')) return 'crowdsec';

  return normalizeId(job || instance || 'service');
}

function inferNodeType(job: string): TopologyNode['type'] {
  const lowerJob = job.toLowerCase();
  if (lowerJob === 'node' || lowerJob.includes('node-exporter') || lowerJob.includes('cadvisor') || lowerJob.includes('blackbox')) {
    return 'exporter';
  }
  if (lowerJob.includes('wazuh') || lowerJob.includes('crowdsec')) {
    return 'security';
  }
  if (lowerJob.includes('caddy') || lowerJob.includes('authelia')) {
    return 'proxy';
  }
  return 'core';
}

function targetToNode(target: PrometheusTarget): TopologyNode | null {
  const job = target.labels.job || target.discoveredLabels.job || target.scrapePool || '';
  const instance = target.labels.instance || target.discoveredLabels.__address__ || job;
  if (!job && !instance) return null;

  const id = inferNodeId(job, instance);

  return {
    id,
    label: LABEL_OVERRIDES[id] ?? titleCase(id),
    type: inferNodeType(job || instance),
    status: toServiceStatus(target.health),
    alertCount: 0,
  };
}

function mergeNodes(discoveredNodes: TopologyNode[]): TopologyNode[] {
  const merged = new Map<string, TopologyNode>();

  for (const fallback of FALLBACK_NODES) {
    merged.set(fallback.id, {
      ...fallback,
      status: 'unknown',
      alertCount: 0,
    });
  }

  for (const node of discoveredNodes) {
    const existing = merged.get(node.id);
    merged.set(node.id, {
      ...(existing ?? node),
      ...node,
      label: existing?.label ?? node.label,
      type: existing?.type ?? node.type,
    });
  }

  return Array.from(merged.values());
}

function mergeEdges(discoveredEdges: TopologyEdge[]): TopologyEdge[] {
  const merged = new Map<string, TopologyEdge>();

  for (const edge of [...STATIC_EDGES, ...discoveredEdges]) {
    merged.set(`${edge.source}:${edge.target}:${edge.type}`, edge);
  }

  return Array.from(merged.values());
}

async function buildTopology(): Promise<TopologyData> {
  let discoveredNodes: TopologyNode[] = [];
  let discoveredEdges: TopologyEdge[] = [];

  try {
    const targets = await getPrometheusTargets();
    const activeTargets = targets.data.activeTargets ?? [];

    discoveredNodes = activeTargets
      .map(targetToNode)
      .filter((node): node is TopologyNode => node !== null);

    discoveredEdges = discoveredNodes
      .filter((node) => node.id !== 'prometheus')
      .map((node) => ({
        source: 'prometheus',
        target: node.id,
        type: 'data' as const,
      }));
  } catch {
    // Fall back to the static topology when Prometheus is unavailable.
  }

  return {
    nodes: mergeNodes(discoveredNodes),
    edges: mergeEdges(discoveredEdges),
  };
}

export async function GET() {
  try {
    const data = await cached<TopologyData>(
      'topology:graph',
      async () =>
        new Response(JSON.stringify(await buildTopology()), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      { ttl: 60000 }
    );

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to build topology graph' },
      { status: 502 }
    );
  }
}
