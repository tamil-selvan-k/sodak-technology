import { Redis as UpstashRedis } from '@upstash/redis'
import IoRedis from 'ioredis'

export interface KV {
  get<T>(key: string): Promise<T | null>
  set(key: string, value: unknown, exSeconds: number): Promise<void>
  del(key: string): Promise<void>
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
  }
}

function createIoRedisKV(): KV {
  const client = new IoRedis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
    lazyConnect: true,
    maxRetriesPerRequest: 1,
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
  }
}

export const kv: KV =
  process.env.NODE_ENV === 'production'
    ? createUpstashKV()
    : createIoRedisKV()
