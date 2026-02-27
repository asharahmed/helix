'use client';

import { useMemo } from 'react';
import { Download, ExternalLink } from 'lucide-react';
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
import { Button } from '@/components/ui/button';
import { usePrometheusRange } from '@/lib/hooks';
import { CHART_AXIS, CHART_GRID, CHART_TOOLTIP } from '@/lib/chart-theme';
import { exportToCSV } from '@/lib/utils/export';

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
  const grafanaBaseUrl = process.env.GRAFANA_URL;

  const chartData = useMemo(() => {
    if (!data?.data?.result) return [];
    const series = data.data.result[0];
    if (!series?.values) return [];

    return series.values.map(([ts, val]) => ({
      time: ts * 1000,
      value: parseFloat(val),
    }));
  }, [data]);

  const chartExportName = useMemo(
    () => `helix-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}`,
    [title]
  );

  const grafanaExploreUrl = useMemo(() => {
    if (!grafanaBaseUrl) return '';
    const left = JSON.stringify({
      queries: [{ refId: 'A', expr: query }],
    });
    return `${grafanaBaseUrl.replace(/\/$/, '')}/explore?orgId=1&left=${encodeURIComponent(left)}`;
  }, [grafanaBaseUrl, query]);

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
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="card-title">{title}</h3>
        <div className="flex items-center gap-1">
          {grafanaExploreUrl ? (
            <Button asChild variant="ghost" size="icon" aria-label={`Open ${title} in Grafana`}>
              <a href={grafanaExploreUrl} target="_blank" rel="noreferrer">
                <ExternalLink className="h-3.5 w-3.5 text-muted hover:text-cyan" />
              </a>
            </Button>
          ) : null}
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Export ${title} as CSV`}
            onClick={() =>
              exportToCSV(
                chartData.map((point) => ({
                  time: new Date(point.time).toISOString(),
                  value: point.value,
                })),
                chartExportName
              )
            }
            disabled={chartData.length === 0}
          >
            <Download className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

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
            <CartesianGrid {...CHART_GRID} />
            <XAxis
              dataKey="time"
              tickFormatter={formatTime}
              tick={CHART_AXIS}
              stroke={CHART_GRID.stroke}
            />
            <YAxis
              tickFormatter={(v) => formatValue(v)}
              tick={CHART_AXIS}
              stroke={CHART_GRID.stroke}
              width={60}
            />
            <Tooltip
              {...CHART_TOOLTIP}
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
