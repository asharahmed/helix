'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { TopologyGraph } from '@/components/command-centre/topology-graph';
import { ActiveAlertsPanel } from '@/components/command-centre/active-alerts-panel';
import { MetricSparklines } from '@/components/command-centre/metric-sparklines';
import { EventsTimeline } from '@/components/command-centre/events-timeline';
import { SystemStatusSummary } from '@/components/command-centre/system-status-summary';

export default function CommandCenterPage() {
  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="page-header">
          <div>
            <h1 className="page-title">Command Centre</h1>
            <p className="page-subtitle">Infrastructure overview</p>
          </div>
          <span className="label-text">HELIX v1.1</span>
        </div>

        {/* Status Summary Cards */}
        <SystemStatusSummary />

        {/* Main Grid */}
        <div className="grid grid-cols-12 gap-4 grid-stretch">
          <div className="col-span-12 lg:col-span-7">
            <TopologyGraph />
          </div>
          <div className="col-span-12 lg:col-span-5">
            <ActiveAlertsPanel />
          </div>
        </div>

        {/* Bottom Grid */}
        <div className="grid grid-cols-12 gap-4 grid-stretch">
          <div className="col-span-12 lg:col-span-6">
            <MetricSparklines />
          </div>
          <div className="col-span-12 lg:col-span-6">
            <EventsTimeline />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
