import type { AlertmanagerAlert, AlertmanagerSilence, CreateSilencePayload } from '@/lib/types';
import { cached, invalidateCache } from '@/lib/cache';

const ALERTMANAGER_URL = process.env.ALERTMANAGER_URL || 'http://alertmanager:9093';

export async function getAlertmanagerAlerts(): Promise<AlertmanagerAlert[]> {
  return cached<AlertmanagerAlert[]>(
    'am:alerts',
    () => fetch(`${ALERTMANAGER_URL}/api/v2/alerts`)
  );
}

export async function getAlertmanagerSilences(): Promise<AlertmanagerSilence[]> {
  return cached<AlertmanagerSilence[]>(
    'am:silences',
    () => fetch(`${ALERTMANAGER_URL}/api/v2/silences`)
  );
}

export async function createSilence(payload: CreateSilencePayload): Promise<{ silenceID: string }> {
  invalidateCache('am:');
  const res = await fetch(`${ALERTMANAGER_URL}/api/v2/silences`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to create silence: ${res.statusText}`);
  return res.json();
}

export async function expireSilence(silenceId: string): Promise<void> {
  invalidateCache('am:');
  const res = await fetch(`${ALERTMANAGER_URL}/api/v2/silence/${silenceId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error(`Failed to expire silence: ${res.statusText}`);
}
