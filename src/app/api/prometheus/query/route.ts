import { NextRequest, NextResponse } from 'next/server';
import { queryPrometheus, queryPrometheusRange } from '@/lib/clients/prometheus';

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
    const start = searchParams.get('start');
    const end = searchParams.get('end');
    const step = searchParams.get('step');

    if (start && end && step) {
      const data = await queryPrometheusRange(query, start, end, step);
      return NextResponse.json(data);
    }

    const time = searchParams.get('time') || undefined;
    const data = await queryPrometheus(query, time);
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Query failed' },
      { status: 502 }
    );
  }
}
