import type { ReactNode } from 'react'
import { CheckCircle2, FileText, Sparkles } from 'lucide-react'
import AppLogo from './AppLogo'

interface AuthShellProps {
  children: ReactNode
  eyebrow: string
  title: string
  description: string
}

const BENEFITS = [
  '10 ta bepul konversiya',
  'DOCX va TXT darhol tayyor',
  'Formatlash saqlanadi',
]

export const clerkAppearance = {
  variables: {
    colorPrimary: '#2563eb',
    colorText: '#18181b',
    colorTextSecondary: '#71717a',
    borderRadius: '16px',
    fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  elements: {
    rootBox: 'w-full',
    cardBox: 'shadow-none border-0 bg-transparent w-full',
    card: 'shadow-none border-0 bg-transparent p-0 w-full',
    headerTitle: 'text-2xl font-bold text-zinc-900',
    headerSubtitle: 'text-zinc-500 text-base',
    socialButtonsBlockButton:
      'h-12 rounded-xl border-zinc-200 hover:bg-zinc-50 text-zinc-700 font-semibold',
    formFieldInput:
      'h-12 rounded-xl border-zinc-200 focus:border-blue-500 focus:ring-blue-500/20',
    formButtonPrimary:
      'h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-base font-semibold shadow-lg shadow-blue-600/20',
    footerActionLink: 'text-blue-600 font-semibold hover:text-blue-700',
  },
} as const

export default function AuthShell({ children, eyebrow, title, description }: AuthShellProps) {
  return (
    <div className="landing-surface min-h-[calc(100vh-72px)] px-4 py-12">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-[1fr_460px] gap-8 items-center min-h-[calc(100vh-168px)]">
        <section className="auth-brand-panel">
          <AppLogo size="xl" className="mb-8" />
          <p className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-4">{eyebrow}</p>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight leading-[1.05] text-zinc-900 dark:text-white mb-6">
            {title}
          </h1>
          <p className="text-xl text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-xl mb-9">
            {description}
          </p>

          <div className="grid sm:grid-cols-3 lg:grid-cols-1 gap-3 max-w-xl">
            {BENEFITS.map((benefit) => (
              <div key={benefit} className="auth-benefit">
                <CheckCircle2 className="w-5 h-5" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>

          <div className="auth-float auth-float-1" aria-hidden="true">
            <FileText className="w-7 h-7" />
          </div>
          <div className="auth-float auth-float-2" aria-hidden="true">
            <Sparkles className="w-7 h-7" />
          </div>
        </section>

        <section className="auth-form-panel">
          {children}
        </section>
      </div>
    </div>
  )
}
