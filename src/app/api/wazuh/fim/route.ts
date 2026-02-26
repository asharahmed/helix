import { NextRequest, NextResponse } from 'next/server';
import { getWazuhFIMEvents } from '@/lib/clients/wazuh-indexer';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const minutes = Math.min(Math.max(1, parseInt(searchParams.get('minutes') || '60') || 60), 10080);
  const size = Math.min(Math.max(1, parseInt(searchParams.get('size') || '50') || 50), 1000);

  try {
    const data = await getWazuhFIMEvents(minutes, size);
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to fetch FIM events' },
      { status: 502 }
    );
  }
}
