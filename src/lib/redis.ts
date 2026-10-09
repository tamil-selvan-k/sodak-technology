import { Redis as UpstashRedis } from '@upstash/redis'
import IoRedis from 'ioredis'

export interface KV {
  get<T>(key: string): Promise<T | null>
  set(key: string, value: unknown, exSeconds: number): Promise<void>
  del(key: string): Promise<void>
  /** Atomically increment a counter and return the new value. */
  incr(key: string): Promise<number>
}

function createUpstashKV(): KV {
  const client = new UpstashRedis({
    url:   process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  })
  return {
    get:  (key)                    => client.get(key),
    set:  (key, value, exSeconds)  => client.set(key, value, { ex: exSeconds }).then(() => undefined),
    del:  (key)                    => client.del(key).then(() => undefined),
    incr: (key)                    => client.incr(key),
  }
}

function createIoRedisKV(): KV {
  const client = new IoRedis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
    lazyConnect: true,
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false,
  })
  // Prevent unhandled 'error' event from crashing the process when Redis is unavailable
  client.on('error', (err: Error) => {
    console.error('[redis] connection error (cache disabled):', err.message)
  })

  return {
    async get<T>(key: string): Promise<T | null> {
      const raw = await client.get(key)
      if (raw === null) return null
      try { return JSON.parse(raw) as T } catch { return raw as unknown as T }
    },
    async set(key: string, value: unknown, exSeconds: number) {
      await client.setex(key, exSeconds, JSON.stringify(value))
    },
    async del(key: string) {
      await client.del(key)
    },
    async incr(key: string) {
      return client.incr(key)
    },
  }
}

// No-op KV — used when no Redis env vars are configured (cache silently disabled)
const noopKV: KV = {
  get:  async ()      => null,
  set:  async ()      => undefined,
  del:  async ()      => undefined,
  incr: async ()      => 0,
}

/** Returns true only for a real, non-placeholder Upstash URL */
function isRealUpstashUrl(url: string | undefined): boolean {
  if (!url) return false
  // Reject placeholder values copied from .env.example
  if (url.includes('your-url') || url.includes('your_url') || url === 'https://') return false
  try { return new URL(url).hostname.endsWith('.upstash.io') } catch { return false }
}

function createKV(): KV {
  // Upstash REST (works in any environment, preferred when real credentials are present)
  if (isRealUpstashUrl(process.env.UPSTASH_REDIS_REST_URL) && process.env.UPSTASH_REDIS_REST_TOKEN) {
    return createUpstashKV()
  }
  // Local / self-hosted Redis via ioredis
  if (process.env.REDIS_URL) {
    return createIoRedisKV()
  }
  // No Redis configured — cache disabled, all operations are no-ops
  if (process.env.NODE_ENV !== 'test') {
    console.warn('[redis] No valid Redis credentials found — cache disabled. Set UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN or REDIS_URL to enable.')
  }
  return noopKV
}

export const kv: KV = createKV()
