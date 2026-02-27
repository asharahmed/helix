import type { BusEvent } from '@/lib/types';
import { eventStore } from '@/lib/event-store';

type Listener = (event: BusEvent) => void;

class EventBus {
  private listeners = new Set<Listener>();

  subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  }

  publish(event: BusEvent): void {
    eventStore.push(event);
    this.listeners.forEach((fn) => {
      try {
        fn(event);
      } catch {
        // Don't let one listener failure break others
      }
    });
  }

  get listenerCount(): number {
    return this.listeners.size;
  }
}

// Pin to globalThis for HMR survival in dev
const createEventBus = () => new EventBus();

export const eventBus: EventBus =
  (globalThis as Record<string, unknown>).__helixEventBus as EventBus ?? createEventBus();

if (process.env.NODE_ENV !== 'production') {
  (globalThis as Record<string, unknown>).__helixEventBus = eventBus;
}
