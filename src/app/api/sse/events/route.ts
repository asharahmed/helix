import { eventBus } from '@/lib/event-bus';

export const dynamic = 'force-dynamic';

const encoder = new TextEncoder();

export async function GET(req: Request) {
  // SSE is read-only: it only broadcasts data that was already authenticated
  // at the webhook ingestion point. No auth check needed here.

  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection event
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: 'connected', timestamp: new Date().toISOString() })}\n\n`)
      );

      // Subscribe to event bus
      const unsub = eventBus.subscribe((event) => {
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(event)}\n\n`)
          );
        } catch {
          // Controller may be closed
          unsub();
        }
      });

      // Heartbeat every 30s to keep connection alive
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': heartbeat\n\n'));
        } catch {
          clearInterval(heartbeat);
          unsub();
        }
      }, 30000);

      // Clean up on client disconnect
      req.signal.addEventListener('abort', () => {
        unsub();
        clearInterval(heartbeat);
        try {
          controller.close();
        } catch {
          // Already closed
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable nginx/caddy buffering
    },
  });
}
