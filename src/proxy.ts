import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher([
  '/api/me(.*)',
  '/api/history(.*)',
  '/api/convert(.*)',
  '/api/billing(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    '/api/me(.*)',
    '/api/history(.*)',
    '/api/convert(.*)',
    '/api/billing(.*)',
  ],
}
