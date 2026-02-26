import { NextRequest, NextResponse } from 'next/server';
import { eventBus } from '@/lib/event-bus';
import { secureCompare } from '@/lib/utils/secure-compare';

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || '';

export async function POST(req: NextRequest) {
  const auth = req.headers.get('Authorization');
  if (!auth || !secureCompare(auth, `Bearer ${WEBHOOK_SECRET}`)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const payload = await req.json();

    eventBus.publish({
      type: 'security',
      source: 'wazuh',
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
