'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { LogStream } from '@/components/logs/log-stream';

export default function LogsPage() {
  return (
    <AppLayout>
      <div className="space-y-4">
        <h1 className="text-xl font-semibold font-sans text-text-primary">
          Logs
        </h1>
        <LogStream />
      </div>
    </AppLayout>
  );
}
