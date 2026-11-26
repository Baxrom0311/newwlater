import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import type { NextRequest } from 'next/server'
import { recordHit } from '@/lib/site-stats'

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/history(.*)',
  '/admin(.*)',
  '/api/convert(.*)',
  '/api/history(.*)',
  '/api/me(.*)',
  '/api/billing(.*)',
])

// The landing page polls these, so counting them would inflate the numbers.
const isUncountedRoute = createRouteMatcher(['/api/stats(.*)', '/api/qr(.*)'])

function isPageView(req: NextRequest): boolean {
  if (req.method !== 'GET') return false
  // Client-side navigations and prefetches fetch RSC payloads, not documents.
  if (req.headers.has('rsc') || req.headers.has('next-router-prefetch')) return false
  const dest = req.headers.get('sec-fetch-dest')
  if (dest) return dest === 'document'
  return req.headers.get('accept')?.includes('text/html') ?? false
}

export default clerkMiddleware(async (auth, req, event) => {
  if (!isUncountedRoute(req)) {
    // Stats must never break or slow down the request itself.
    event.waitUntil(recordHit({ pageView: isPageView(req) }).catch(() => undefined))
  }

  if (isProtectedRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|pptx?|pdf|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
