import { NextRequest, NextResponse } from 'next/server';
import { getWazuhVulnerabilities } from '@/lib/clients/wazuh-indexer';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const size = Math.min(Math.max(parseInt(searchParams.get('size') || '200', 10) || 200, 1), 500);

  try {
    const data = await getWazuhVulnerabilities(size);
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to fetch Wazuh vulnerabilities' },
      { status: 502 }
    );
  }
}
