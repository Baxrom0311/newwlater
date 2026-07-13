export const PLANS = {
  FREE: {
    name: 'Bepul',
    monthlyLimit: 10,
    maxFileSizeMB: 5,
    formats: ['txt', 'md', 'csv', 'docx'],
    history: false,
    api: false,
    stripePriceId: null,
  },
  PRO: {
    name: 'Pro',
    monthlyLimit: 500,
    maxFileSizeMB: 50,
    formats: ['txt', 'md', 'csv', 'docx', 'pdf', 'jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'tiff'],
    history: true,
    api: false,
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID ?? '',
  },
  BUSINESS: {
    name: 'Business',
    monthlyLimit: Infinity,
    maxFileSizeMB: 500,
    formats: ['txt', 'md', 'csv', 'docx', 'pdf', 'jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'tiff'],
    history: true,
    api: true,
    stripePriceId: process.env.STRIPE_BUSINESS_PRICE_ID ?? '',
  },
} as const

export type PlanKey = keyof typeof PLANS

export function getPlan(plan: PlanKey) {
  return PLANS[plan]
}
