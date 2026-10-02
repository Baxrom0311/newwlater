import { NextResponse } from 'next/server'
import { verifyToken } from '@clerk/nextjs/server'
import { getPlan, type PlanKey } from '@/lib/plans'
import { getMonthlyUsage } from '@/lib/usage'
import { ensureUserRecord } from '@/lib/clerk-user'

async function userIdFromBearer(req: Request) {
  const token = req.headers.get('authorization')?.match(/^Bearer\s+(.+)$/i)?.[1]
  if (!token) return null
  const payload = await verifyToken(token, { secretKey: process.env.CLERK_SECRET_KEY })
  return payload.sub
}

export async function GET(req: Request) {
  const userId = await userIdFromBearer(req).catch(() => null)
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await ensureUserRecord(userId).catch(() => ({ id: userId, plan: 'FREE' as string }))

  const plan = (user?.plan ?? 'FREE') as PlanKey
  const planConfig = getPlan(plan)
  const used = await getMonthlyUsage(userId).catch(() => 0)
  const limit = planConfig.monthlyLimit === Infinity ? null : planConfig.monthlyLimit

  return NextResponse.json({
    plan,
    used,
    limit,
    maxFileSizeMB: planConfig.maxFileSizeMB,
    remaining: limit === null ? null : Math.max(0, limit - used),
  })
}
