import { SignUp } from '@clerk/nextjs'
import AuthShell, { clerkAppearance } from '@/components/AuthShell'

export default function SignUpPage() {
  return (
    <AuthShell
      eyebrow="Bepul boshlang"
      title="Yangi alifboga tayyor workspace"
      description="Ro'yxatdan o'ting va DOCX, TXT hamda matnlarni yangi alifboga tezda o‘tkazing. Birinchi 10 ta konversiya bepul."
    >
      {/* No forceRedirectUrl — so a ?redirect_url=... (e.g. back to /pricing
          to finish checkout) is honored; /dashboard is only the fallback. */}
      <SignUp
        appearance={clerkAppearance}
        fallbackRedirectUrl="/dashboard"
        signInFallbackRedirectUrl="/dashboard"
      />
    </AuthShell>
  )
}
