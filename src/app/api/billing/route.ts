import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { createCheckoutSession, createBillingPortalSession } from '@/lib/stripe'
import { PLANS, type PlanKey } from '@/lib/plans'

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { action, plan } = await req.json() as { action: 'checkout' | 'portal'; plan?: PlanKey }

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  if (action === 'portal') {
    const sub = await prisma.subscription.findUnique({ where: { userId } })
    if (!sub) return NextResponse.json({ error: 'No subscription' }, { status: 400 })
    const session = await createBillingPortalSession(sub.stripeCustomerId)
    return NextResponse.json({ url: session.url })
  }

  if (action === 'checkout' && plan && plan !== 'FREE') {
    const priceId = PLANS[plan].stripePriceId
    if (!priceId) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    const session = await createCheckoutSession({
      userId,
      email: user.email,
      priceId,
      plan,
    })
    return NextResponse.json({ url: session.url })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
