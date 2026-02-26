import { NextRequest, NextResponse } from 'next/server';
import { getCrowdSecDecisions, deleteCrowdSecDecision } from '@/lib/clients/crowdsec';

export async function GET() {
  try {
    const data = await getCrowdSecDecisions();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to fetch decisions' },
      { status: 502 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Missing decision ID' }, { status: 400 });
  }
  const numericId = parseInt(id, 10);
  if (isNaN(numericId) || numericId < 0) {
    return NextResponse.json({ error: 'Invalid decision ID' }, { status: 400 });
  }

  try {
    await deleteCrowdSecDecision(numericId);
    return NextResponse.json({ status: 'ok' });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to delete decision' },
      { status: 502 }
    );
  }
}
