'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { LogStream } from '@/components/logs/log-stream';

export default function LogsPage() {
  return (
    <AppLayout>
      <div className="space-y-4">
        <div>
          <h1 className="page-title">Logs</h1>
          <p className="page-subtitle">Loki log streams</p>
        </div>
        <LogStream />
      </div>
    </AppLayout>
  );
}
