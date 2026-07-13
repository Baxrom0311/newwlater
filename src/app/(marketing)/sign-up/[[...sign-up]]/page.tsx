import { SignUp } from '@clerk/nextjs'
import AuthShell, { clerkAppearance } from '@/components/AuthShell'

export default function SignUpPage() {
  return (
    <AuthShell
      eyebrow="Bepul boshlang"
      title="Yangi alifboga tayyor workspace"
      description="Ro'yxatdan o'ting va DOCX, TXT hamda matnlarni yangi alifboga tezda o‘tkazing. Birinchi 10 ta konversiya bepul."
    >
      <SignUp
        appearance={clerkAppearance}
        forceRedirectUrl="/dashboard"
        fallbackRedirectUrl="/dashboard"
        signInForceRedirectUrl="/dashboard"
        signInFallbackRedirectUrl="/dashboard"
      />
    </AuthShell>
  )
}
