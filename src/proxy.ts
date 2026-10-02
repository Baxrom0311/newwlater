import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/history(.*)',
  '/admin(.*)',
  '/api/convert(.*)',
  '/api/history(.*)',
  '/api/me(.*)',
  '/api/billing(.*)',
])

export default clerkMiddleware(async (auth, req) => {
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
