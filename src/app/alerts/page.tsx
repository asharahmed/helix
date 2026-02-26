'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { AlertTable } from '@/components/alerts/alert-table';
import { AlertTimeline } from '@/components/alerts/alert-timeline';

export default function AlertsPage() {
  return (
    <AppLayout>
      <div className="space-y-4">
        <div>
          <h1 className="page-title">Alerts</h1>
          <p className="page-subtitle">Prometheus and Wazuh unified view</p>
        </div>

        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 lg:col-span-9">
            <AlertTable />
          </div>
          <div className="col-span-12 lg:col-span-3">
            <AlertTimeline />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
