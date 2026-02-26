'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { AlertTable } from '@/components/alerts/alert-table';
import { AlertTimeline } from '@/components/alerts/alert-timeline';

export default function AlertsPage() {
  return (
    <AppLayout>
      <div className="space-y-4">
        <h1 className="text-xl font-semibold font-sans text-text-primary">
          Alerts
        </h1>

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
