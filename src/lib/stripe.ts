import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-06-24.dahlia',
  typescript: true,
})

export async function createStripeCustomer(email: string, userId: string) {
  return stripe.customers.create({
    email,
    metadata: { userId },
  })
}

export async function createCheckoutSession({
  userId,
  email,
  priceId,
  plan,
}: {
  userId: string
  email: string
  priceId: string
  plan: string
}) {
  const customer = await stripe.customers.list({ email, limit: 1 })
  const customerId = customer.data[0]?.id

  return stripe.checkout.sessions.create({
    customer: customerId,
    customer_email: customerId ? undefined : email,
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
