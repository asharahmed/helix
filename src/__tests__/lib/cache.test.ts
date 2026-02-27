import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { cached, invalidateCache } from '@/lib/cache';

describe('cache', () => {
  beforeEach(() => {
    invalidateCache();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-26T00:00:00.000Z'));
  });

  afterEach(() => {
    invalidateCache();
    vi.useRealTimers();
  });

  it('returns cached result on repeated key lookups', async () => {
    const fetcher = vi.fn(async () =>
      new Response(JSON.stringify({ value: 42 }), { status: 200 })
    );

    const first = await cached<{ value: number }>('cache:test:set-get', fetcher);
    const second = await cached<{ value: number }>('cache:test:set-get', fetcher);

    expect(first.value).toBe(42);
    expect(second.value).toBe(42);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('expires entries after TTL', async () => {
    vi.useRealTimers();
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ value: 'first' }), { status: 200 })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ value: 'second' }), { status: 200 })
      );

    const first = await cached<{ value: string }>('cache:test:ttl', fetcher, { ttl: 10 });
    await new Promise((resolve) => setTimeout(resolve, 25));
    const second = await cached<{ value: string }>('cache:test:ttl', fetcher, { ttl: 10 });

    expect(first.value).toBe('first');
    expect(second.value).toBe('second');
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('invalidates keys by pattern', async () => {
    const alphaFetcher = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ value: 'a1' }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ value: 'a2' }), { status: 200 }));

    const betaFetcher = vi.fn(async () =>
      new Response(JSON.stringify({ value: 'b1' }), { status: 200 })
    );

    await cached<{ value: string }>('cache:alpha:1', alphaFetcher);
    await cached<{ value: string }>('cache:beta:1', betaFetcher);
    invalidateCache('alpha');

    const alphaAfterInvalidation = await cached<{ value: string }>('cache:alpha:1', alphaFetcher);
    const betaAfterInvalidation = await cached<{ value: string }>('cache:beta:1', betaFetcher);

    expect(alphaAfterInvalidation.value).toBe('a2');
    expect(betaAfterInvalidation.value).toBe('b1');
    expect(alphaFetcher).toHaveBeenCalledTimes(2);
    expect(betaFetcher).toHaveBeenCalledTimes(1);
  });

  it('clears the full cache when no pattern is provided', async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ value: 1 }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ value: 2 }), { status: 200 }));

    await cached<{ value: number }>('cache:full-clear', fetcher);
    invalidateCache();
    const afterClear = await cached<{ value: number }>('cache:full-clear', fetcher);

    expect(afterClear.value).toBe(2);
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
});
