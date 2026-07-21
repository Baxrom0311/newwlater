import { NextResponse } from 'next/server'
import { clerkClient, verifyToken } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { getPlan, type PlanKey } from '@/lib/plans'
import { getMonthlyUsage } from '@/lib/usage'

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

  let user = await prisma.user.findUnique({ where: { id: userId } }).catch(() => null)
  if (!user) {
    try {
      const clerk = await clerkClient()
      const clerkUser = await clerk.users.getUser(userId)
      user = await prisma.user.create({
        data: {
          id: userId,
          email: clerkUser.emailAddresses[0]?.emailAddress ?? '',
          name: `${clerkUser.firstName ?? ''} ${clerkUser.lastName ?? ''}`.trim() || null,
          imageUrl: clerkUser.imageUrl,
        },
      }).catch(() => ({
        id: userId,
        plan: 'FREE',
      }))
    } catch {
      user = { id: userId, plan: 'FREE' }
    }
  }

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
