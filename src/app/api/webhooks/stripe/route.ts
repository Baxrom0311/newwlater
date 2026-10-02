import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
type Plan = 'FREE' | 'PRO' | 'BUSINESS'

function planFromPriceId(priceId: string | undefined): Plan | null {
  if (!priceId) return null
  if (priceId === process.env.STRIPE_PRO_PRICE_ID) return 'PRO'
  if (priceId === process.env.STRIPE_BUSINESS_PRICE_ID) return 'BUSINESS'
  return null
}

function planFromMetadata(metadata: Stripe.Metadata): Plan {
  const p = (metadata.plan ?? '').toUpperCase()
  if (p === 'PRO') return 'PRO'
  if (p === 'BUSINESS') return 'BUSINESS'
  return 'FREE'
}

// Entitlement is granted only for statuses that mean the customer is actually paying.
const ACTIVE_STATUSES = new Set(['active', 'trialing'])

function periodEndFrom(sub: Stripe.Subscription): Date {
  // In post-Basil API versions current_period_end lives on the subscription item.
  const item = sub.items?.data?.[0] as unknown as { current_period_end?: number } | undefined
  const unix = item?.current_period_end
  if (typeof unix === 'number' && Number.isFinite(unix)) return new Date(unix * 1000)
  // Fallback so a schema-shift never poisons the whole webhook (which would
  // otherwise 500 forever on retries and leave the user un-upgraded).
  return new Date(Date.now() + 31 * 24 * 60 * 60 * 1000)
}

async function applySubscription(sub: Stripe.Subscription) {
  const userId = sub.metadata.userId
  if (!userId) return

  const priceId = sub.items?.data?.[0]?.price?.id
  const purchasedPlan = planFromPriceId(priceId) ?? planFromMetadata(sub.metadata)
  // Downgrade to FREE unless the subscription is genuinely active/trialing.
  const effectivePlan: Plan = ACTIVE_STATUSES.has(sub.status) ? purchasedPlan : 'FREE'
  const periodEnd = periodEndFrom(sub)

  await prisma.$transaction([
    // Only touch plan for an existing user; create a placeholder (unique) email
    // if the Clerk webhook hasn't synced the user yet, to avoid colliding on the
    // empty-string email unique constraint.
    prisma.user.upsert({
      where: { id: userId },
      update: { plan: effectivePlan },
      create: { id: userId, email: `${userId}@no-email.local`, plan: effectivePlan },
    }),
    prisma.subscription.upsert({
      where: { userId },
      update: {
        plan: purchasedPlan,
        status: sub.status,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: sub.cancel_at_period_end,
        stripeSubscriptionId: sub.id,
        stripeCustomerId: sub.customer as string,
      },
      create: {
        userId,
        stripeCustomerId: sub.customer as string,
        stripeSubscriptionId: sub.id,
        plan: purchasedPlan,
        status: sub.status,
        currentPeriodEnd: periodEnd,
      },
    }),
  ])
}

export async function POST(req: NextRequest) {
  const payload = await req.text()
  const sig = req.headers.get('stripe-signature') ?? ''

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(payload, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('[stripe webhook] signature', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        await applySubscription(event.data.object as Stripe.Subscription)
        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        const userId = sub.metadata.userId
        if (!userId) break
        // updateMany / conditional so a missing user row can't throw and cause
        // Stripe to retry the event forever.
        await prisma.$transaction([
          prisma.user.updateMany({ where: { id: userId }, data: { plan: 'FREE' } }),
          prisma.subscription.updateMany({ where: { userId }, data: { status: 'canceled' } }),
        ])
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const subId = (invoice as unknown as { subscription?: string }).subscription
        if (subId) {
          await prisma.subscription.updateMany({
            where: { stripeSubscriptionId: subId },
            data: { status: 'past_due' },
          })
        }
        break
      }

      case 'charge.refunded':
      case 'charge.dispute.created': {
        // Revoke paid access on refund/chargeback by resolving the customer.
        const charge = event.data.object as Stripe.Charge
        const customerId = typeof charge.customer === 'string' ? charge.customer : charge.customer?.id
        if (customerId) {
          const sub = await prisma.subscription.findFirst({ where: { stripeCustomerId: customerId } })
          if (sub) {
            await prisma.$transaction([
              prisma.user.updateMany({ where: { id: sub.userId }, data: { plan: 'FREE' } }),
              prisma.subscription.updateMany({ where: { userId: sub.userId }, data: { status: 'canceled' } }),
            ])
          }
        }
        break
      }
    }
  } catch (err) {
    console.error('[stripe webhook] handler', event.type, err)
    return NextResponse.json({ error: 'Handler error' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
