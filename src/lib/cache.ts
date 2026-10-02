/**
 * Redis cache utility — thin wrapper over the `kv` abstraction in lib/redis.ts.
 *
 * Design rules:
 * - Every Redis operation is wrapped in try/catch; cache failure is always transparent.
 * - Never use SCAN, KEYS, or pattern-based delete (unavailable on Upstash free tier).
 * - List invalidation uses a per-module version counter (`{module}:v`).
 *   Incrementing the counter orphans old list keys, which then expire via TTL.
 * - Cache is NOT used for public ISR pages — Next.js CDN caching handles those.
 *   Only admin-path list/single-record queries are cached here.
 *
 * Cache key naming convention:
 *   {module}:list:v{version}:{params}   → list query results  (TTL = LIST_TTL)
 *   {module}:id:{id}                     → single record by ID  (TTL = RECORD_TTL)
 *   {module}:slug:{slug}                 → single record by slug (TTL = RECORD_TTL)
 *   {module}:v                           → integer version counter (no TTL)
 */

import { kv } from '@/lib/redis'

export const LIST_TTL   = 120  // seconds — list query results
export const RECORD_TTL = 300  // seconds — single-record lookups

// ── Primitives ────────────────────────────────────────────────────────────────

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    return await kv.get<T>(key)
  } catch (err) {
    console.error('[cache] get error:', err)
    return null
  }
}

export async function cacheSet(key: string, value: unknown, ttl: number): Promise<void> {
  try {
    await kv.set(key, value, ttl)
  } catch (err) {
    console.error('[cache] set error:', err)
  }
}

/**
 * Delete one or more exact cache keys.
 * Does not support patterns — use cacheInvalidateLists() for list invalidation.
 */
export async function cacheDel(...keys: string[]): Promise<void> {
  if (keys.length === 0) return
  try {
    // kv.del accepts a single key; iterate for multiple keys.
    await Promise.all(keys.map(key => kv.del(key)))
  } catch (err) {
    console.error('[cache] del error:', err)
  }
}

// ── Version-counter helpers (list invalidation) ───────────────────────────────

/**
 * Read the current version counter for a module.
 * Returns 0 if the key has never been set.
 */
export async function cacheGetVersion(versionKey: string): Promise<number> {
  try {
    const v = await kv.get<number>(versionKey)
    return v ?? 0
  } catch {
    return 0
  }
}

/**
 * Atomically increment the module version counter, orphaning all old list keys.
 * Old keys expire naturally via TTL; no SCAN/KEYS needed.
 */
export async function cacheInvalidateLists(versionKey: string): Promise<void> {
  try {
    await kv.incr(versionKey)
  } catch (err) {
    console.error('[cache] incr error:', err)
  }
}
