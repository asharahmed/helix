import { NextRequest, NextResponse } from 'next/server';
import { eventStore } from '@/lib/event-store';

export function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '50', 10) || 50, 1), 500);

  return NextResponse.json(eventStore.getRecent(limit));
}
