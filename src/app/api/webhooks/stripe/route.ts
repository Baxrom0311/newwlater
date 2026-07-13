import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
type Plan = 'FREE' | 'PRO' | 'BUSINESS'

function planFromMetadata(metadata: Stripe.Metadata): Plan {
  const p = (metadata.plan ?? '').toUpperCase()
  if (p === 'PRO') return 'PRO'
  if (p === 'BUSINESS') return 'BUSINESS'
  return 'FREE'
}

export async function POST(req: NextRequest) {
  const payload = await req.text()
  const sig = req.headers.get('stripe-signature') ?? ''

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(payload, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('[stripe webhook]', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const sub = event.data.object as Stripe.Subscription

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const userId = sub.metadata.userId
      if (!userId) break
      const plan = planFromMetadata(sub.metadata)
      const periodEnd = new Date((sub as unknown as { current_period_end: number }).current_period_end * 1000)

      await prisma.$transaction([
        prisma.user.upsert({
          where: { id: userId },
          update: { plan },
          create: { id: userId, email: '', plan },
        }),
        prisma.subscription.upsert({
          where: { userId },
          update: {
            plan,
            status: sub.status,
            currentPeriodEnd: periodEnd,
            cancelAtPeriodEnd: sub.cancel_at_period_end,
            stripeSubscriptionId: sub.id,
          },
          create: {
            userId,
            stripeCustomerId: sub.customer as string,
            stripeSubscriptionId: sub.id,
            plan,
            status: sub.status,
            currentPeriodEnd: periodEnd,
          },
        }),
      ])
      break
    }

    case 'customer.subscription.deleted': {
      const userId = sub.metadata.userId
      if (!userId) break
      await prisma.$transaction([
        prisma.user.update({ where: { id: userId }, data: { plan: 'FREE' } }),
        prisma.subscription.updateMany({
          where: { userId },
          data: { status: 'canceled' },
        }),
      ])
      break
    }
  }

  return NextResponse.json({ received: true })
}
