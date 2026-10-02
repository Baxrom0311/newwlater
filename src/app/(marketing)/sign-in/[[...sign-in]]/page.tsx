import { SignIn } from '@clerk/nextjs'
import AuthShell, { clerkAppearance } from '@/components/AuthShell'

export default function SignInPage() {
  return (
    <AuthShell
      eyebrow="Xush kelibsiz"
      title="Dashboardga qayting"
      description="Hujjatlaringizni yangi alifboga o‘tkazish, limitlaringizni ko‘rish va konversiya tarixini boshqarish uchun kiring."
    >
      {/* No forceRedirectUrl — honor ?redirect_url=... (e.g. return to /pricing
          to finish checkout); /dashboard is only the fallback. */}
      <SignIn
        appearance={clerkAppearance}
        fallbackRedirectUrl="/dashboard"
        signUpFallbackRedirectUrl="/dashboard"
      />
    </AuthShell>
  )
}
