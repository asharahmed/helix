'use client';

import { useEffect, useRef, useState } from 'react';
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
  type SimulationNodeDatum,
  type SimulationLinkDatum,
} from 'd3-force';
import { select } from 'd3-selection';
import { drag } from 'd3-drag';
import { zoom } from 'd3-zoom';
import Link from 'next/link';
import { X, ExternalLink } from 'lucide-react';
import { GlowCard } from '@/components/shared/glow-card';
import { HexIndicator } from '@/components/shared/hex-indicator';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';
import { useHealth, useTopology } from '@/lib/hooks';
import { FALLBACK_NODES, STATIC_EDGES, NODE_COLORS, STATUS_COLORS } from '@/lib/topology/config';
import { SERVICE_NAMES } from '@/lib/constants';
import type { TopologyNode, ServiceStatus, ServiceName } from '@/lib/types';

const SERVICE_LINKS: Record<string, string> = {
  prometheus: '/metrics',
  alertmanager: '/alerts',
  loki: '/logs',
  wazuh: '/security',
  'wazuh-manager': '/security',
  'wazuh-indexer': '/security',
  crowdsec: '/security',
};

interface SimNode extends SimulationNodeDatum {
  id: string;
  label: string;
  type: 'core' | 'exporter' | 'security' | 'proxy';
  status: ServiceStatus;
  alertCount: number;
}

interface SimLink extends SimulationLinkDatum<SimNode> {
  type: 'data' | 'alert' | 'proxy';
}

export function TopologyGraph() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { data: health } = useHealth();
  const { data: topologyData, isLoading: topologyLoading } = useTopology();
  const hoveredNodeRef = useRef<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const nodesList = topologyData?.nodes ?? FALLBACK_NODES.map((node) => ({
    ...node,
    status: 'unknown' as ServiceStatus,
    alertCount: 0,
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = container.getBoundingClientRect();
    const width = rect.width;
    const height = 400;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    // Build simulation data
    const nodes: SimNode[] = nodesList.map((node) => ({
      ...node,
    }));

    const links: SimLink[] = (topologyData?.edges ?? STATIC_EDGES).map((e) => ({
      source: e.source,
      target: e.target,
      type: e.type,
    }));

    const simulation = forceSimulation<SimNode>(nodes)
      .force(
        'link',
        forceLink<SimNode, SimLink>(links)
          .id((d) => d.id)
          .distance(80)
      )
      .force('charge', forceManyBody().strength(-200))
      .force('center', forceCenter(width / 2, height / 2))
      .force('collide', forceCollide(30));

    let transform = { x: 0, y: 0, k: 1 };
    let animId: number;

    function draw() {
      if (!ctx) return;
      ctx.save();
      ctx.clearRect(0, 0, width, height);

      ctx.translate(transform.x, transform.y);
      ctx.scale(transform.k, transform.k);

      // Draw edges
      links.forEach((link) => {
        const source = link.source as SimNode;
        const target = link.target as SimNode;
        if (source.x == null || source.y == null || target.x == null || target.y == null) return;

        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(target.x, target.y);
        ctx.strokeStyle =
          link.type === 'alert'
            ? 'rgba(255, 184, 0, 0.3)'
            : link.type === 'proxy'
            ? 'rgba(0, 230, 118, 0.2)'
            : 'rgba(0, 212, 255, 0.15)';
        ctx.lineWidth = link.type === 'alert' ? 2 : 1;
        ctx.stroke();
      });

      // Draw nodes
      nodes.forEach((node) => {
        if (node.x == null || node.y == null) return;

        const baseColor = NODE_COLORS[node.type];
        const statusColor = STATUS_COLORS[node.status];
        const isHovered = hoveredNodeRef.current === node.id;
        const radius = isHovered ? 10 : node.type === 'core' ? 8 : node.type === 'security' ? 7 : 5;

        // Glow
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius + 4, 0, Math.PI * 2);
        const gradient = ctx.createRadialGradient(
          node.x, node.y, radius,
          node.x, node.y, radius + 8
        );
        gradient.addColorStop(0, `${statusColor}40`);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.fill();

        // Node circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = isHovered ? statusColor : `${baseColor}cc`;
        ctx.fill();
        ctx.strokeStyle = statusColor;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Label
        ctx.fillStyle = '#e0e0e0';
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(node.label, node.x, node.y + radius + 14);
      });

      ctx.restore();
      animId = requestAnimationFrame(draw);
    }

    simulation.on('tick', () => {});
    animId = requestAnimationFrame(draw);

    // Zoom
    const zoomBehavior = zoom<HTMLCanvasElement, unknown>()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => {
        transform = event.transform;
      });

    // Drag
    const dragBehavior = drag<HTMLCanvasElement, unknown>()
      .subject((event) => {
        const [mx, my] = [
          (event.x - transform.x) / transform.k,
          (event.y - transform.y) / transform.k,
        ];
        return nodes.find((n) => {
          if (n.x == null || n.y == null) return false;
          const dx = n.x - mx;
          const dy = n.y - my;
          return dx * dx + dy * dy < 400;
        });
      })
      .on('start', (event) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        const d = event.subject as SimNode;
        d.fx = d.x;
        d.fy = d.y;
      })
      .on('drag', (event) => {
        const d = event.subject as SimNode;
        d.fx = (event.x - transform.x) / transform.k;
        d.fy = (event.y - transform.y) / transform.k;
      })
      .on('end', (event) => {
        if (!event.active) simulation.alphaTarget(0);
        const d = event.subject as SimNode;
        d.fx = null;
        d.fy = null;
      });

    const sel = select(canvas);
    sel.call(zoomBehavior as any);
    sel.call(dragBehavior as any);

    // Hover detection
    canvas.addEventListener('mousemove', (event) => {
      const rect = canvas.getBoundingClientRect();
      const mx = ((event.clientX - rect.left) - transform.x) / transform.k;
      const my = ((event.clientY - rect.top) - transform.y) / transform.k;
      const found = nodes.find((n) => {
        if (n.x == null || n.y == null) return false;
        const dx = n.x - mx;
        const dy = n.y - my;
        return dx * dx + dy * dy < 400;
      });
      hoveredNodeRef.current = found?.id ?? null;
      canvas.style.cursor = found ? 'pointer' : 'default';
    });

    // Click detection for detail panel
    canvas.addEventListener('click', (event) => {
      const rect = canvas.getBoundingClientRect();
      const mx = ((event.clientX - rect.left) - transform.x) / transform.k;
      const my = ((event.clientY - rect.top) - transform.y) / transform.k;
      const found = nodes.find((n) => {
        if (n.x == null || n.y == null) return false;
        const dx = n.x - mx;
        const dy = n.y - my;
        return dx * dx + dy * dy < 400;
      });
      setSelectedNode(found?.id ?? null);
    });

    return () => {
      cancelAnimationFrame(animId);
      simulation.stop();
      sel.on('.zoom', null);
      sel.on('.drag', null);
    };
  }, [nodesList, topologyData]);

  const selectedNodeData = selectedNode
    ? nodesList.find((n) => n.id === selectedNode)
    : null;
  const selectedSvc = selectedNodeData
    ? health?.services.find((s) => selectedNodeData.id.startsWith(s.name))
    : null;

  return (
    <GlowCard className="relative overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <h2 className="card-title">Service Topology</h2>
        <span className="label-text">{nodesList.length} services</span>
      </div>

      <div
        ref={containerRef}
        className="w-full relative"
        role="group"
        aria-label="Service topology graph"
      >
        {topologyLoading && !topologyData ? (
          <div className="h-[400px]">
            <LoadingSkeleton lines={6} />
          </div>
        ) : null}
        <canvas ref={canvasRef} aria-hidden="true" className="rounded" />
        <ul className="sr-only" aria-label="Service topology">
          {nodesList.map((n) => (
            <li key={n.id}>
              {n.label}: {n.status}
            </li>
          ))}
        </ul>

        {/* Node detail panel */}
        {selectedNodeData && (
          <div className="absolute top-2 right-2 w-56 rounded-lg border border-border bg-surface/95 backdrop-blur-sm p-3 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-mono font-medium text-text-primary">
                {selectedNodeData.label}
              </span>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-muted hover:text-text-primary"
                aria-label="Close topology details"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex items-center gap-2">
                <HexIndicator status={selectedNodeData.status} size="sm" />
                <span className="text-text-secondary capitalize">{selectedNodeData.status}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted">Type</span>
                <span className="text-text-secondary capitalize">{selectedNodeData.type}</span>
              </div>
              {selectedSvc?.latency !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-muted">Latency</span>
                  <span className="text-text-secondary">{selectedSvc.latency}ms</span>
                </div>
              )}
              {SERVICE_LINKS[selectedNodeData.id] && (
                <Link
                  href={SERVICE_LINKS[selectedNodeData.id]}
                  className="flex items-center gap-1.5 text-cyan hover:text-cyan/80 mt-2 pt-2 border-t border-border"
                >
                  <ExternalLink className="h-3 w-3" />
                  {SERVICE_NAMES[selectedNodeData.id.replace('-manager', '').replace('-indexer', '') as ServiceName] ?? selectedNodeData.label}
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </GlowCard>
  );
}
