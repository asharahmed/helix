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
