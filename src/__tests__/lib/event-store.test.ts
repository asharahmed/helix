import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { BusEvent } from '@/lib/types';

const { existsSyncMock, readFileSyncMock, writeFileSyncMock } = vi.hoisted(() => ({
  existsSyncMock: vi.fn(),
  readFileSyncMock: vi.fn(),
  writeFileSyncMock: vi.fn(),
}));

vi.mock('node:fs', () => ({
  default: {
    existsSync: existsSyncMock,
    readFileSync: readFileSyncMock,
    writeFileSync: writeFileSyncMock,
  },
  existsSync: existsSyncMock,
  readFileSync: readFileSyncMock,
  writeFileSync: writeFileSyncMock,
}));

import { EventStore } from '@/lib/event-store';

function makeEvent(index: number): BusEvent {
  return {
    type: index % 2 === 0 ? 'alert' : 'security',
    source: index % 2 === 0 ? 'alertmanager' : 'wazuh',
    data: { index },
    timestamp: new Date(Date.UTC(2026, 1, 26, 12, 0, index)).toISOString(),
  };
}

describe('EventStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    existsSyncMock.mockReturnValue(false);
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('keeps a ring buffer capped at 500 events', () => {
    const store = new EventStore();

    for (let i = 1; i <= 505; i += 1) {
      store.push(makeEvent(i));
    }

    const recent = store.getRecent(500);

    expect(recent).toHaveLength(500);
    expect(recent[0].data).toEqual({ index: 505 });
    expect(recent[recent.length - 1].data).toEqual({ index: 6 });
  });

  it('returns the most recent events first', () => {
    const store = new EventStore();

    store.push(makeEvent(1));
    store.push(makeEvent(2));
    store.push(makeEvent(3));

    expect(store.getRecent(2).map((event) => event.data)).toEqual([{ index: 3 }, { index: 2 }]);
  });

  it('debounces writes to disk', () => {
    const store = new EventStore();

    store.push(makeEvent(1));
    store.push(makeEvent(2));

    vi.advanceTimersByTime(199);
    expect(writeFileSyncMock).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(writeFileSyncMock).toHaveBeenCalledTimes(1);
    expect(JSON.parse(writeFileSyncMock.mock.calls[0][1] as string)).toHaveLength(2);
  });
});
