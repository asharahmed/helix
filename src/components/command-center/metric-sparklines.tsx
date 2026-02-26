'use client';

import { useMemo } from 'react';
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';
import { Cpu, HardDrive, MemoryStick, Network } from 'lucide-react';
import { GlowCard } from '@/components/shared/glow-card';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';
import { usePrometheusRange } from '@/lib/hooks';

const SPARKLINE_QUERIES = [
  {
    key: 'cpu',
    label: 'CPU Usage',
    icon: Cpu,
    query: '100 - (avg(rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)',
    unit: '%',
    color: '#00d4ff',
  },
  {
    key: 'memory',
    label: 'Memory Usage',
    icon: MemoryStick,
    query: '(1 - node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes) * 100',
    unit: '%',
    color: '#ffb800',
  },
  {
    key: 'disk',
    label: 'Disk Usage',
    icon: HardDrive,
    query: '(1 - node_filesystem_avail_bytes{mountpoint="/"} / node_filesystem_size_bytes{mountpoint="/"}) * 100',
    unit: '%',
    color: '#00e676',
  },
  {
    key: 'network',
    label: 'Network I/O',
    icon: Network,
    query: 'rate(node_network_receive_bytes_total{device!="lo"}[5m])',
    unit: 'B/s',
    color: '#ff3b4f',
  },
];

function SparklineCard({
  config,
}: {
  config: (typeof SPARKLINE_QUERIES)[number];
}) {
  // Memoize time window - only recalculate once per minute to prevent
  // infinite re-fetch loops (new timestamp -> new query key -> new fetch -> re-render)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const { start, end, step } = useMemo(() => {
    const now = Math.floor(Date.now() / 1000);
    return { start: String(now - 1800), end: String(now), step: '60' };
  }, [Math.floor(Date.now() / 60000)]);

  const { data, isLoading } = usePrometheusRange(
    config.query,
    start,
    end,
    step
  );

  const chartData = useMemo(() => {
    if (!data?.data?.result?.[0]?.values) return [];
    return data.data.result[0].values.map(([ts, val]) => ({
      time: ts,
      value: parseFloat(val),
    }));
  }, [data]);

  const currentValue = chartData.length > 0
    ? chartData[chartData.length - 1].value
    : null;

  const Icon = config.icon;

  return (
    <div className="glow-card p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className="h-3.5 w-3.5" style={{ color: config.color }} />
          <span className="text-xs font-sans text-text-secondary">{config.label}</span>
        </div>
        {currentValue !== null && (
          <span className="font-mono text-sm font-medium" style={{ color: config.color }}>
            {currentValue.toFixed(1)}{config.unit}
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="h-[60px] shimmer rounded" />
      ) : (
        <ResponsiveContainer width="100%" height={60}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id={`grad-${config.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={config.color} stopOpacity={0.3} />
                <stop offset="100%" stopColor={config.color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <YAxis domain={['dataMin', 'dataMax']} hide />
            <Area
              type="monotone"
              dataKey="value"
              stroke={config.color}
              strokeWidth={1.5}
              fill={`url(#grad-${config.key})`}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export function MetricSparklines() {
  return (
    <GlowCard>
      <h2 className="text-sm font-sans font-medium text-text-primary mb-3">
        System Metrics
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {SPARKLINE_QUERIES.map((config) => (
          <SparklineCard key={config.key} config={config} />
        ))}
      </div>
    </GlowCard>
  );
}
