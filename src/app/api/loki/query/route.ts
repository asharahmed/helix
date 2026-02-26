import { NextRequest, NextResponse } from 'next/server';
import { queryLoki } from '@/lib/clients/loki';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const query = searchParams.get('query');
  if (!query) {
    return NextResponse.json({ error: 'Missing query parameter' }, { status: 400 });
  }
  if (query.length > 2000) {
    return NextResponse.json({ error: 'Query too long (max 2000 chars)' }, { status: 400 });
  }

  try {
    const limit = Math.min(Math.max(1, parseInt(searchParams.get('limit') || '100') || 100), 1000);
    const start = searchParams.get('start') || undefined;
    const end = searchParams.get('end') || undefined;
    const direction = (searchParams.get('direction') as 'forward' | 'backward') || 'backward';

    const data = await queryLoki(query, limit, start, end, direction);
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Query failed' },
      { status: 502 }
    );
  }
}
