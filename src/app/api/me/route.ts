import { NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { getPlan, type PlanKey } from '@/lib/plans'
import { getMonthlyUsage } from '@/lib/usage'

export async function GET() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) {
    const clerk = await clerkClient()
    const clerkUser = await clerk.users.getUser(userId)
    user = await prisma.user.create({
      data: {
        id: userId,
        email: clerkUser.emailAddresses[0]?.emailAddress ?? '',
        name: `${clerkUser.firstName ?? ''} ${clerkUser.lastName ?? ''}`.trim() || null,
        imageUrl: clerkUser.imageUrl,
      },
    })
  }

  const plan = user.plan as PlanKey
  const planConfig = getPlan(plan)
  const used = await getMonthlyUsage(userId)
  const limit = planConfig.monthlyLimit === Infinity ? null : planConfig.monthlyLimit

  return NextResponse.json({
    plan,
    used,
    limit,
    maxFileSizeMB: planConfig.maxFileSizeMB,
    remaining: limit === null ? null : Math.max(0, limit - used),
  })
}
