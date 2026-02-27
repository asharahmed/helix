import fs from 'node:fs';
import type { BusEvent } from '@/lib/types';

class EventStore {
  private events: BusEvent[] = [];
  private readonly maxEvents = 500;
  private writeTimeout: NodeJS.Timeout | null = null;
  private readonly filePath = '/tmp/helix-events.json';

  constructor() {
    this.loadFromDisk();
  }

  push(event: BusEvent): void {
    this.events.push(event);
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(this.events.length - this.maxEvents);
    }

    if (this.writeTimeout) {
      clearTimeout(this.writeTimeout);
    }

    this.writeTimeout = setTimeout(() => {
      this.writeToDisk();
    }, 200);
  }

  getRecent(limit = 50): BusEvent[] {
    const clampedLimit = Math.min(Math.max(1, limit), this.maxEvents);
    return this.events.slice(-clampedLimit).reverse();
  }

  private loadFromDisk(): void {
    try {
      if (!fs.existsSync(this.filePath)) return;
      const raw = fs.readFileSync(this.filePath, 'utf8');
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return;
      this.events = parsed
        .filter((item): item is BusEvent => Boolean(item?.type && item?.source && item?.timestamp))
        .slice(-this.maxEvents);
    } catch {
      // best-effort load only
    }
  }

  private writeToDisk(): void {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.events), 'utf8');
    } catch {
      // best-effort persistence only
    }
  }
}

const createEventStore = () => new EventStore();

export const eventStore: EventStore =
  ((globalThis as Record<string, unknown>).__helixEventStore as EventStore | undefined) ?? createEventStore();

if (process.env.NODE_ENV !== 'production') {
  (globalThis as Record<string, unknown>).__helixEventStore = eventStore;
}

export { EventStore };
