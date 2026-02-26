import { NextResponse } from 'next/server';
import { getPrometheusTargets } from '@/lib/clients/prometheus';

export async function GET() {
  try {
    const data = await getPrometheusTargets();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to fetch targets' },
      { status: 502 }
    );
  }
}
