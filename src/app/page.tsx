'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { TopologyGraph } from '@/components/command-center/topology-graph';
import { ActiveAlertsPanel } from '@/components/command-center/active-alerts-panel';
import { MetricSparklines } from '@/components/command-center/metric-sparklines';
import { EventsTimeline } from '@/components/command-center/events-timeline';
import { SystemStatusSummary } from '@/components/command-center/system-status-summary';

export default function CommandCenterPage() {
  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold font-sans text-text-primary">
            Command Centre
          </h1>
          <span className="label-text">HELIX v1.1</span>
        </div>

        {/* Status Summary Cards */}
        <SystemStatusSummary />

        {/* Main Grid */}
        <div className="grid grid-cols-12 gap-4">
          {/* Topology Graph */}
          <div className="col-span-12 lg:col-span-7">
            <TopologyGraph />
          </div>

          {/* Active Alerts */}
          <div className="col-span-12 lg:col-span-5">
            <ActiveAlertsPanel />
          </div>
        </div>

        {/* Bottom Grid */}
        <div className="grid grid-cols-12 gap-4">
          {/* Metric Sparklines */}
          <div className="col-span-12 lg:col-span-7">
            <MetricSparklines />
          </div>

          {/* Events Timeline */}
          <div className="col-span-12 lg:col-span-5">
            <EventsTimeline />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
