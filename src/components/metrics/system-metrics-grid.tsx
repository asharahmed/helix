'use client';

import { TimeSeriesChart } from './time-series-chart';
import { formatBytes } from '@/lib/utils';

interface SystemMetricsGridProps {
  start: string;
  end: string;
  step: string;
}

const METRICS = [
  {
    title: 'CPU Usage',
    query: '100 - (avg(rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)',
    color: '#00d4ff',
    unit: '%',
  },
  {
    title: 'Memory Usage',
    query: '(1 - node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes) * 100',
    color: '#ffb800',
    unit: '%',
  },
  {
    title: 'Disk Usage',
    query: '(1 - node_filesystem_avail_bytes{mountpoint="/"} / node_filesystem_size_bytes{mountpoint="/"}) * 100',
    color: '#00e676',
    unit: '%',
  },
  {
    title: 'Network Receive',
    query: 'rate(node_network_receive_bytes_total{device!="lo"}[5m])',
    color: '#ff3b4f',
    unit: '',
    format: (v: number) => formatBytes(v) + '/s',
  },
  {
    title: 'Network Transmit',
    query: 'rate(node_network_transmit_bytes_total{device!="lo"}[5m])',
    color: '#00d4ff',
    unit: '',
    format: (v: number) => formatBytes(v) + '/s',
  },
  {
    title: 'Load Average (1m)',
    query: 'node_load1',
    color: '#ffb800',
    unit: '',
  },
];

export function SystemMetricsGrid({ start, end, step }: SystemMetricsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {METRICS.map((metric) => (
        <TimeSeriesChart
          key={metric.title}
          title={metric.title}
          query={metric.query}
          color={metric.color}
          unit={metric.unit}
          start={start}
          end={end}
          step={step}
          format={metric.format}
        />
      ))}
    </div>
  );
}
