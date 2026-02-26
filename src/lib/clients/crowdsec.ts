import { cached, invalidateCache } from '@/lib/cache';
import type { CrowdSecDecision } from '@/lib/types';

const CROWDSEC_URL = process.env.CROWDSEC_URL || 'http://crowdsec:8080';
const CROWDSEC_API_KEY = process.env.CROWDSEC_BOUNCER_API_KEY || '';

function crowdsecHeaders(): HeadersInit {
  return {
    'X-Api-Key': CROWDSEC_API_KEY,
  };
}

export async function getCrowdSecDecisions(): Promise<CrowdSecDecision[]> {
  return cached<CrowdSecDecision[]>('cs:decisions', () =>
    fetch(`${CROWDSEC_URL}/v1/decisions`, {
      headers: crowdsecHeaders(),
    })
  );
}

export async function deleteCrowdSecDecision(decisionId: number): Promise<void> {
  invalidateCache('cs:');
  const res = await fetch(`${CROWDSEC_URL}/v1/decisions/${decisionId}`, {
    method: 'DELETE',
    headers: crowdsecHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to delete CrowdSec decision: ${res.statusText}`);
}
