'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { WazuhAlertsPanel } from '@/components/security/wazuh-alerts';
import { AgentGrid } from '@/components/security/agent-grid';
import { CrowdSecDecisions } from '@/components/security/crowdsec-decisions';
import { FIMEvents } from '@/components/security/fim-events';

export default function SecurityPage() {
  return (
    <AppLayout>
      <div className="space-y-4">
        <div>
          <h1 className="page-title">Security</h1>
          <p className="page-subtitle">Wazuh agents, HIDS alerts, FIM, and CrowdSec</p>
        </div>

        <div className="grid grid-cols-12 gap-4 grid-stretch">
          <div className="col-span-12 lg:col-span-6">
            <WazuhAlertsPanel />
          </div>
          <div className="col-span-12 lg:col-span-6">
            <AgentGrid />
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4 grid-stretch">
          <div className="col-span-12 lg:col-span-6">
            <CrowdSecDecisions />
          </div>
          <div className="col-span-12 lg:col-span-6">
            <FIMEvents />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
