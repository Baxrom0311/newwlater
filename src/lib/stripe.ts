import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-08-26.dahlia',
  typescript: true,
})

export async function createStripeCustomer(email: string, userId: string) {
  return stripe.customers.create({
    email,
    metadata: { userId },
  })
}

/**
 * Resolve the Stripe customer id for a user, preferring a previously stored id
 * and creating (once) if none exists — rather than the fragile list-by-email.
 */
export async function resolveStripeCustomerId(params: {
  userId: string
  email: string
  storedCustomerId?: string | null
}): Promise<string> {
  if (params.storedCustomerId) return params.storedCustomerId
  const customer = await createStripeCustomer(params.email, params.userId)
  return customer.id
}

export async function createCheckoutSession({
  userId,
  customerId,
  priceId,
  plan,
}: {
  userId: string
  customerId: string
  priceId: string
  plan: string
}) {
  return stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
    metadata: { userId, plan },
    subscription_data: {
      metadata: { userId, plan },
    },
  })
}

export async function createBillingPortalSession(customerId: string) {
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
  })
}
