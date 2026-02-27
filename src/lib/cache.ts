import { LRUCache } from 'lru-cache';

interface CacheEntry {
  text: string;
  expiresAt: number;
}

// Cache raw text strings, NOT parsed objects.
// JSON.stringify() for sizeCalculation is synchronous and CPU-bound --
// a 5MB Prometheus response would block the event loop, stalling SSE.
const cache = new LRUCache<string, CacheEntry>({
  max: 50,
  maxSize: 50 * 1024 * 1024, // 50MB cap
  sizeCalculation: (val) => val.text.length, // O(1) for strings
});

// Pin to globalThis for HMR survival in dev
const globalCache = (globalThis as Record<string, unknown>).__helixCache as typeof cache | undefined;
const effectiveCache = globalCache ?? cache;
export interface CacheOptions {
  ttl?: number;
}

if (process.env.NODE_ENV !== 'production') {
  (globalThis as Record<string, unknown>).__helixCache = effectiveCache;
}

export async function cached<T>(
  key: string,
  fn: () => Promise<Response>,
  options: CacheOptions = {}
): Promise<T> {
  const ttl = options.ttl ?? 5000;
  const hit = effectiveCache.get(key);
  if (hit) {
    if (hit.expiresAt > Date.now()) {
      return JSON.parse(hit.text) as T;
    }
    effectiveCache.delete(key);
  }

  const res = await fn();
  if (!res.ok) {
    throw new Error(`Upstream error ${res.status}: ${res.statusText}`);
  }

  const text = await res.text();
  effectiveCache.set(key, { text, expiresAt: Date.now() + ttl });
  return JSON.parse(text) as T;
}

export function invalidateCache(pattern?: string) {
  if (!pattern) {
    effectiveCache.clear();
    return;
  }
  for (const key of effectiveCache.keys()) {
    if (key.includes(pattern)) {
      effectiveCache.delete(key);
    }
  }
}
