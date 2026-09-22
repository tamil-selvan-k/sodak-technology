import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

interface Limiter {
  limit(identifier: string): Promise<{ success: boolean }>
}

// In dev, always allow through — Upstash credentials aren't set locally.
const devLimiter: Limiter = {
  limit: async (_identifier: string) => ({ success: true }),
}

function createProdLimiter(): Limiter {
  const redis = new Redis({
    url:   process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  })
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '1 h'),
    prefix: 'sodak:form',
  })
}

// 5 form submissions per IP per hour
export const formRateLimit: Limiter =
  process.env.NODE_ENV === 'production' ? createProdLimiter() : devLimiter

export function getIP(req: Request): string {
  return (
    req.headers.get('cf-connecting-ip') ??
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    '127.0.0.1'
  )
}
