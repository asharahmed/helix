import { NextRequest, NextResponse } from 'next/server';
import { eventBus } from '@/lib/event-bus';
import { secureCompare } from '@/lib/utils/secure-compare';

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.WEBHOOK_SECRET || '';
  const auth = req.headers.get('Authorization');
  if (!auth || !secureCompare(auth, `Bearer ${webhookSecret}`)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const payload = await req.json();

    eventBus.publish({
      type: 'alert',
      source: 'alertmanager',
      data: payload,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ status: 'ok' });
  } catch (err) {
    return NextResponse.json(
      { error: 'Invalid payload' },
      { status: 400 }
    );
  }
}
