import { NextResponse } from 'next/server';
import { getPrometheusAlerts } from '@/lib/clients/prometheus';

export async function GET() {
  try {
    const data = await getPrometheusAlerts();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to fetch alerts' },
      { status: 502 }
    );
  }
}
