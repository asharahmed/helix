import { NextRequest, NextResponse } from 'next/server';
import { getLokiLabels, getLokiLabelValues } from '@/lib/clients/loki';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const label = searchParams.get('label');
  if (label && label.length > 200) {
    return NextResponse.json({ error: 'Label name too long (max 200 chars)' }, { status: 400 });
  }

  try {
    if (label) {
      const data = await getLokiLabelValues(label);
      return NextResponse.json(data);
    }
    const data = await getLokiLabels();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to fetch labels' },
      { status: 502 }
    );
  }
}
