'use client';

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Box } from 'lucide-react';
import { GlowCard } from '@/components/shared/glow-card';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';
import { ErrorState } from '@/components/shared/error-state';
import { usePrometheusQuery } from '@/lib/hooks';
import { formatBytes } from '@/lib/utils';

export function ContainerResources() {
  const { data: cpuData, isLoading: cpuLoading } = usePrometheusQuery(
    'sum(rate(container_cpu_usage_seconds_total{name!=""}[5m])) by (name) * 100'
  );
  const { data: memData, isLoading: memLoading } = usePrometheusQuery(
    'container_memory_usage_bytes{name!=""}'
  );

  const chartData = useMemo(() => {
    const containers: Record<string, { name: string; cpu: number; memory: number }> = {};

    if (cpuData?.data?.result) {
      for (const metric of cpuData.data.result) {
        const name = metric.metric.name || 'unknown';
        if (!containers[name]) containers[name] = { name, cpu: 0, memory: 0 };
        containers[name].cpu = parseFloat(metric.value?.[1] || '0');
      }
    }

    if (memData?.data?.result) {
      for (const metric of memData.data.result) {
        const name = metric.metric.name || 'unknown';
        if (!containers[name]) containers[name] = { name, cpu: 0, memory: 0 };
        containers[name].memory = parseFloat(metric.value?.[1] || '0') / (1024 * 1024); // MB
      }
    }

    return Object.values(containers)
      .sort((a, b) => b.memory - a.memory)
      .slice(0, 15);
  }, [cpuData, memData]);

  const isLoading = cpuLoading || memLoading;

  return (
    <GlowCard>
      <div className="flex items-center gap-2 mb-3">
        <Box className="h-4 w-4 text-cyan" />
        <h2 className="text-sm font-sans font-medium text-text-primary">
          Container Resources
        </h2>
      </div>

      {isLoading ? (
        <LoadingSkeleton lines={5} />
      ) : chartData.length === 0 ? (
        <ErrorState message="No container data" />
      ) : (
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 100 }}>
            <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 10, fontFamily: 'JetBrains Mono' }} />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fill: '#e0e0e0', fontSize: 10, fontFamily: 'JetBrains Mono' }}
              width={100}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f0f1a',
                border: '1px solid #1a1a2e',
                borderRadius: 8,
                fontSize: 12,
                fontFamily: 'JetBrains Mono',
              }}
              formatter={(value: number, name: string) => {
                if (name === 'memory') return [`${value.toFixed(0)} MB`, 'Memory'];
                return [`${value.toFixed(1)}%`, 'CPU'];
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: 10, fontFamily: 'JetBrains Mono' }}
            />
            <Bar dataKey="memory" fill="#00d4ff" name="Memory (MB)" radius={[0, 4, 4, 0]} barSize={10} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </GlowCard>
  );
}
