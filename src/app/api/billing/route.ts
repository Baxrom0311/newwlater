import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import {
  createCheckoutSession,
  createBillingPortalSession,
  resolveStripeCustomerId,
} from '@/lib/stripe'
import { PLANS, type PlanKey } from '@/lib/plans'
import { ensureUserRecord } from '@/lib/clerk-user'

const PAID_PLANS: PlanKey[] = ['PRO', 'BUSINESS']
const ACTIVE_STATUSES = new Set(['active', 'trialing'])

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let payload: { action?: string; plan?: string }
  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
  const { action, plan } = payload

  const user = await ensureUserRecord(userId).catch(() => null)
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const sub = await prisma.subscription.findUnique({ where: { userId } })

  if (action === 'portal') {
    if (!sub) return NextResponse.json({ error: 'No subscription' }, { status: 400 })
    const session = await createBillingPortalSession(sub.stripeCustomerId)
    return NextResponse.json({ url: session.url })
  }

  if (action === 'checkout') {
    // Validate the requested plan.
    if (!plan || !PAID_PLANS.includes(plan as PlanKey)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }
    const priceId = PLANS[plan as PlanKey].stripePriceId
    if (!priceId) return NextResponse.json({ error: 'Plan not configured' }, { status: 400 })

    // Prevent double billing: an already-active subscriber should manage their
    // plan through the billing portal, not open a second checkout.
    if (sub && ACTIVE_STATUSES.has(sub.status)) {
      const portal = await createBillingPortalSession(sub.stripeCustomerId)
      return NextResponse.json({ url: portal.url, note: 'existing-subscription' })
    }

    const customerId = await resolveStripeCustomerId({
      userId,
      email: user.email,
      storedCustomerId: sub?.stripeCustomerId,
    })

    const session = await createCheckoutSession({ userId, customerId, priceId, plan })
    return NextResponse.json({ url: session.url })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
