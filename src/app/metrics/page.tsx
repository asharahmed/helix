'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { AppLayout } from '@/components/layout/app-layout';
import { NetworkProbes } from '@/components/metrics/network-probes';
import { TimeRangePicker } from '@/components/metrics/time-range-picker';
import { CardSkeleton } from '@/components/shared/loading-skeleton';
import { TIME_RANGES } from '@/lib/constants';

const SystemMetricsGrid = dynamic(
  () => import('@/components/metrics/system-metrics-grid').then((m) => m.SystemMetricsGrid),
  { ssr: false, loading: () => <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{[1,2,3,4,5,6].map(i => <CardSkeleton key={i} className="h-[240px]" />)}</div> }
);

const ContainerResources = dynamic(
  () => import('@/components/metrics/container-resources').then((m) => m.ContainerResources),
  { ssr: false, loading: () => <CardSkeleton className="h-[400px]" /> }
);

export default function MetricsPage() {
  const [timeRange, setTimeRange] = useState('1h');

  const { start, end, step } = useMemo(() => {
    // Quantize to 30-second boundaries so cache keys stay stable across navigation.
    // Without this, every mount produces a unique timestamp, causing a full cache miss.
    const now = Math.floor(Date.now() / 1000 / 30) * 30;
    const range = TIME_RANGES.find((r) => r.value === timeRange) ?? TIME_RANGES[2];
    const seconds = range.seconds;

    // Compute step to get ~120 data points
    const step = Math.max(Math.floor(seconds / 120), 15);

    return {
      start: String(now - seconds),
      end: String(now),
      step: String(step),
    };
  }, [timeRange]);

  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="page-header">
          <div>
            <h1 className="page-title">Metrics</h1>
            <p className="page-subtitle">System and container performance</p>
          </div>
          <TimeRangePicker value={timeRange} onChange={setTimeRange} />
        </div>

        <SystemMetricsGrid start={start} end={end} step={step} />

        <div className="grid grid-cols-12 gap-4 grid-stretch">
          <div className="col-span-12 lg:col-span-6">
            <ContainerResources />
          </div>
          <div className="col-span-12 lg:col-span-6">
            <NetworkProbes />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
