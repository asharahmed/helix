import { NextRequest, NextResponse } from 'next/server';
import { getRecentWazuhAlerts } from '@/lib/clients/wazuh-indexer';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const minutes = Math.min(Math.max(1, parseInt(searchParams.get('minutes') || '60') || 60), 10080);
  const size = Math.min(Math.max(1, parseInt(searchParams.get('size') || '100') || 100), 1000);
  const minLevel = Math.min(Math.max(0, parseInt(searchParams.get('minLevel') || '0') || 0), 15);

  try {
    const data = await getRecentWazuhAlerts(minutes, size, minLevel);
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to fetch Wazuh alerts' },
      { status: 502 }
    );
  }
}
