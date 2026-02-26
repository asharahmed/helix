import { LRUCache } from 'lru-cache';

// Cache raw text strings, NOT parsed objects.
// JSON.stringify() for sizeCalculation is synchronous and CPU-bound --
// a 5MB Prometheus response would block the event loop, stalling SSE.
const cache = new LRUCache<string, string>({
  max: 50,
  ttl: 5000,
  maxSize: 50 * 1024 * 1024, // 50MB cap
  sizeCalculation: (val) => val.length, // O(1) for strings
});

// Pin to globalThis for HMR survival in dev
const globalCache = (globalThis as Record<string, unknown>).__ncCache as typeof cache | undefined;
const effectiveCache = globalCache ?? cache;
if (process.env.NODE_ENV !== 'production') {
  (globalThis as Record<string, unknown>).__ncCache = effectiveCache;
}

export async function cached<T>(key: string, fn: () => Promise<Response>): Promise<T> {
  const hit = effectiveCache.get(key);
  if (hit) return JSON.parse(hit) as T;
  const res = await fn();
  if (!res.ok) {
    throw new Error(`Upstream error ${res.status}: ${res.statusText}`);
  }
  const text = await res.text();
  effectiveCache.set(key, text);
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
