import { NextRequest, NextResponse } from 'next/server';
import { getAlertmanagerSilences, createSilence, expireSilence } from '@/lib/clients/alertmanager';
import type { CreateSilencePayload } from '@/lib/types';

export async function GET() {
  try {
    const data = await getAlertmanagerSilences();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to fetch silences' },
      { status: 502 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload: CreateSilencePayload = await req.json();

    if (!payload.matchers?.length || !payload.startsAt || !payload.endsAt || !payload.createdBy) {
      return NextResponse.json({ error: 'Invalid silence payload' }, { status: 400 });
    }
    if (payload.comment && payload.comment.length > 2000) {
      return NextResponse.json({ error: 'Comment too long (max 2000 chars)' }, { status: 400 });
    }

    const result = await createSilence(payload);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to create silence' },
      { status: 502 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Missing silence ID' }, { status: 400 });
  }

  try {
    await expireSilence(id);
    return NextResponse.json({ status: 'ok' });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to expire silence' },
      { status: 502 }
    );
  }
}
