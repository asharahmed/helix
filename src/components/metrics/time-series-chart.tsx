'use client';

import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { GlowCard } from '@/components/shared/glow-card';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';
import { ErrorState } from '@/components/shared/error-state';
import { usePrometheusRange } from '@/lib/hooks';

interface TimeSeriesChartProps {
  title: string;
  query: string;
  color: string;
  unit?: string;
  start: string;
  end: string;
  step: string;
  format?: (v: number) => string;
}

export function TimeSeriesChart({
  title,
  query,
  color,
  unit = '',
  start,
  end,
  step,
  format,
}: TimeSeriesChartProps) {
  const { data, isLoading, error } = usePrometheusRange(query, start, end, step);

  const chartData = useMemo(() => {
    if (!data?.data?.result) return [];
    const series = data.data.result[0];
    if (!series?.values) return [];

    return series.values.map(([ts, val]) => ({
      time: ts * 1000,
      value: parseFloat(val),
    }));
  }, [data]);

  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatValue = format ?? ((v: number) => `${v.toFixed(1)}${unit}`);

  return (
    <GlowCard>
      <h3 className="text-sm font-sans font-medium text-text-primary mb-3">
        {title}
      </h3>

      {isLoading ? (
        <div className="h-[200px]"><LoadingSkeleton lines={4} /></div>
      ) : error ? (
        <ErrorState message="Failed to load metric" />
      ) : chartData.length === 0 ? (
        <div className="h-[200px] flex items-center justify-center text-sm font-mono text-text-secondary">
          No data
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id={`grad-${title}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.2} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a1a2e" />
            <XAxis
              dataKey="time"
              tickFormatter={formatTime}
              tick={{ fill: '#6b7280', fontSize: 10, fontFamily: 'JetBrains Mono' }}
              stroke="#1a1a2e"
            />
            <YAxis
              tickFormatter={(v) => formatValue(v)}
              tick={{ fill: '#6b7280', fontSize: 10, fontFamily: 'JetBrains Mono' }}
              stroke="#1a1a2e"
              width={60}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f0f1a',
                border: '1px solid #1a1a2e',
                borderRadius: 8,
                fontSize: 12,
                fontFamily: 'JetBrains Mono',
              }}
              labelFormatter={(ts) => formatTime(ts as number)}
              formatter={(value: number) => [formatValue(value), title]}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              fill={`url(#grad-${title})`}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </GlowCard>
  );
}
