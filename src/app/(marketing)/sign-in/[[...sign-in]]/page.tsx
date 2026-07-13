import { SignIn } from '@clerk/nextjs'
import AuthShell, { clerkAppearance } from '@/components/AuthShell'

export default function SignInPage() {
  return (
    <AuthShell
      eyebrow="Xush kelibsiz"
      title="Dashboardga qayting"
      description="Hujjatlaringizni yangi alifboga o‘tkazish, limitlaringizni ko‘rish va konversiya tarixini boshqarish uchun kiring."
    >
      <SignIn
        appearance={clerkAppearance}
        forceRedirectUrl="/dashboard"
        fallbackRedirectUrl="/dashboard"
        signUpForceRedirectUrl="/dashboard"
        signUpFallbackRedirectUrl="/dashboard"
      />
    </AuthShell>
  )
}
