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
        <h1 className="text-xl font-semibold font-sans text-text-primary">
          Security
        </h1>

        <div className="grid grid-cols-12 gap-4">
          {/* Wazuh Alerts */}
          <div className="col-span-12 lg:col-span-7">
            <WazuhAlertsPanel />
          </div>

          {/* Agent Grid */}
          <div className="col-span-12 lg:col-span-5">
            <AgentGrid />
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4">
          {/* CrowdSec Decisions */}
          <div className="col-span-12 lg:col-span-6">
            <CrowdSecDecisions />
          </div>

          {/* FIM Events */}
          <div className="col-span-12 lg:col-span-6">
            <FIMEvents />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
