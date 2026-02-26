import { NextRequest } from 'next/server';
import { tailLoki } from '@/lib/clients/loki';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const query = searchParams.get('query');
  if (!query) {
    return new Response('Missing query parameter', { status: 400 });
  }
  if (query.length > 2000) {
    return new Response('Query too long (max 2000 chars)', { status: 400 });
  }

  const start = searchParams.get('start') || undefined;

  try {
    // CRITICAL: pass req.signal to upstream fetch.
    // Without this, closing the browser tab aborts the client connection
    // but leaves the Loki connection open indefinitely.
    const lokiRes = await tailLoki(query, req.signal, start);

    if (!lokiRes.ok) {
      return new Response(`Loki tail error: ${lokiRes.statusText}`, {
        status: lokiRes.status,
      });
    }

    return new Response(lokiRes.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      return new Response(null, { status: 499 });
    }
    return new Response(
      err instanceof Error ? err.message : 'Tail failed',
      { status: 502 }
    );
  }
}
