import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

type LimiterName = 'convert' | 'api'

const limiters = new Map<LimiterName, Ratelimit | null>()

function getLimiter(name: LimiterName): Ratelimit | null {
  if (limiters.has(name)) return limiters.get(name) ?? null

  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) {
    // Not configured (e.g. local dev) — fail open so the app still works.
    limiters.set(name, null)
    return null
  }

  const redis = new Redis({ url, token })
  const config =
    name === 'convert'
      ? Ratelimit.slidingWindow(20, '60 s') // heavy CPU work — tighter
      : Ratelimit.slidingWindow(60, '60 s')
  const limiter = new Ratelimit({ redis, limiter: config, prefix: `rl:${name}` })
  limiters.set(name, limiter)
  return limiter
}

export async function checkRateLimit(
  name: LimiterName,
  key: string
): Promise<{ ok: boolean; retryAfter: number }> {
  const limiter = getLimiter(name)
  if (!limiter) return { ok: true, retryAfter: 0 }
  try {
    const res = await limiter.limit(key)
    const retryAfter = res.success ? 0 : Math.max(1, Math.ceil((res.reset - Date.now()) / 1000))
    return { ok: res.success, retryAfter }
  } catch {
    // Redis hiccup shouldn't take down conversions — fail open.
    return { ok: true, retryAfter: 0 }
  }
}
