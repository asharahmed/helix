import { NextResponse } from 'next/server';
import { getAlertmanagerAlerts } from '@/lib/clients/alertmanager';

export async function GET() {
  try {
    const data = await getAlertmanagerAlerts();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to fetch alerts' },
      { status: 502 }
    );
  }
}
