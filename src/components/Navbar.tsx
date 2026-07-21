'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUser, UserButton, SignInButton } from '@clerk/nextjs'
import ThemeToggle from './ThemeToggle'
import AppLogo from './AppLogo'
import { LanguageSwitcher, useI18n } from '@/lib/i18n/I18nContext'

export default function Navbar() {
  const pathname = usePathname()
  const { isSignedIn } = useUser()
  const { t } = useI18n()

  return (
    <header className="sticky top-0 z-50 bg-white/88 dark:bg-zinc-950/86 backdrop-blur-lg border-b border-zinc-100 dark:border-zinc-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-[72px] flex items-center justify-between gap-3">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <AppLogo size="sm" showWordmark className="transition-transform duration-200 group-hover:scale-[0.98] sm:[&>div]:h-10 sm:[&>div]:w-10 sm:[&>div]:rounded-2xl" />
        </Link>

        {/* Nav */}
        <nav className="hidden sm:flex items-center gap-1">
          {[
            { href: '/', label: t.nav.home },
            { href: '/pricing', label: t.nav.pricing },
            ...(isSignedIn ? [
              { href: '/dashboard', label: t.nav.dashboard },
              { href: '/history', label: t.nav.history },
            ] : []),
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`px-[18px] py-2.5 rounded-lg text-base transition-all duration-200 ${
                pathname === href
                  ? 'text-zinc-900 dark:text-white font-medium bg-zinc-100 dark:bg-zinc-800'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800/60'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <LanguageSwitcher />
          <ThemeToggle />

          {isSignedIn ? (
            <>
              <Link
                href="/dashboard"
                className="btn-primary shine inline-flex h-9 items-center rounded-xl px-4 text-sm font-semibold text-white sm:hidden"
              >
                {t.nav.dashboard}
              </Link>
              <UserButton />
            </>
          ) : (
            <>
              <SignInButton
                mode="modal"
                forceRedirectUrl="/dashboard"
                fallbackRedirectUrl="/dashboard"
                signUpForceRedirectUrl="/dashboard"
                signUpFallbackRedirectUrl="/dashboard"
              >
                <button className="hidden min-[420px]:inline-flex px-3 sm:px-[18px] py-2 rounded-lg text-sm sm:text-base text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-all duration-200">
                  {t.nav.login}
                </button>
              </SignInButton>
              <Link
                href="/sign-up"
                className="btn-primary shine inline-flex items-center h-9 sm:h-10 px-4 sm:px-6 text-white text-sm sm:text-base font-semibold rounded-xl"
              >
                {t.nav.start}
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
