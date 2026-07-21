'use client'

import Link from 'next/link'
import { UserButton } from '@clerk/nextjs'
import { LayoutDashboard, History, Zap, ArrowLeft, Crown } from 'lucide-react'
import AppLogo from '@/components/AppLogo'
import MobileBottomNav from '@/components/MobileBottomNav'
import ThemeToggle from '@/components/ThemeToggle'
import { LanguageSwitcher, useI18n } from '@/lib/i18n/I18nContext'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { t } = useI18n()

  const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: t.nav.dashboard },
    { href: '/history', icon: History, label: t.nav.history },
  ]

  return (
    <div className="dashboard-surface h-screen max-h-screen overflow-hidden flex">

      {/* Fixed Sidebar - Never scrolls with main content */}
      <aside className="hidden h-full w-64 shrink-0 p-3 md:flex lg:w-72 lg:p-4">
        <div className="dashboard-sidebar flex h-full w-full flex-col overflow-y-auto rounded-[24px] border border-zinc-200/80 bg-white/92 p-3 shadow-sm backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-950/72">

          {/* Logo */}
          <Link href="/" className="group mb-4 flex items-center gap-2.5 rounded-2xl px-2 py-1">
            <AppLogo size="md" className="transition-transform group-hover:scale-95" />
            <div>
              <span className="block text-base font-black tracking-tight text-zinc-950 dark:text-white">AlifboAI</span>
              <span className="block text-[11px] font-bold text-zinc-500 dark:text-zinc-400">2026 konvertor</span>
            </div>
          </Link>

          {/* Nav */}
          <nav className="flex-1 space-y-1">
            {navItems.map(({ href, icon: Icon, label }) => (
              <Link
                key={href}
                href={href}
                className="group flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-extrabold text-zinc-600 transition-all duration-150 hover:bg-blue-50 hover:text-blue-700 dark:text-zinc-400 dark:hover:bg-blue-950/30 dark:hover:text-blue-300"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500 transition-colors group-hover:bg-white group-hover:text-blue-600 dark:bg-zinc-900 dark:text-zinc-400 dark:group-hover:bg-zinc-800 dark:group-hover:text-blue-300">
                  <Icon className="h-3.5 w-3.5" />
                </span>
                {label}
              </Link>
            ))}
          </nav>

          {/* Bottom compact section */}
          <div className="mt-2 space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
            <Link
              href="/pricing"
              className="block rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-600 to-teal-500 p-3 text-white shadow-md transition-transform hover:-translate-y-0.5"
            >
              <div className="mb-2 flex h-7 w-7 items-center justify-center rounded-xl bg-white/18">
                <Crown className="h-3.5 w-3.5" />
              </div>
              <p className="text-xs font-black">{t.dashboard.upgrade_pro}</p>
              <p className="mt-0.5 text-[10px] font-semibold leading-tight text-white/90">{t.dashboard.upgrade_sub}</p>
              <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold">
                Upgrade <Zap className="h-3 w-3" />
              </span>
            </Link>

            <div className="flex items-center justify-between rounded-xl border border-zinc-200/80 bg-white px-2.5 py-1.5 dark:border-zinc-800 dark:bg-zinc-900/70">
              <span className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400">Til</span>
              <LanguageSwitcher />
            </div>

            <div className="flex items-center gap-2.5 rounded-xl border border-zinc-200/80 bg-white p-2 dark:border-zinc-800 dark:bg-zinc-900/70">
              <UserButton />
              <div className="min-w-0">
                <span className="block truncate text-xs font-bold text-zinc-800 dark:text-zinc-100">Profil</span>
                <span className="block truncate text-[10px] font-semibold text-zinc-500 dark:text-zinc-400">Account</span>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-zinc-200/80 bg-white p-2 dark:border-zinc-800 dark:bg-zinc-900/70">
              <div>
                <span className="block text-xs font-bold text-zinc-800 dark:text-zinc-100">Theme</span>
              </div>
              <ThemeToggle />
            </div>

            <Link
              href="/"
              className="flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-bold text-zinc-500 transition-all hover:bg-zinc-50 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-200"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              {t.nav.home}
            </Link>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="fixed left-0 right-0 top-0 z-40 flex h-14 items-center justify-between border-b border-zinc-200 bg-white/94 px-3 shadow-sm backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/86 md:hidden">
        <Link href="/dashboard" className="flex items-center gap-2">
          <AppLogo size="sm" showWordmark />
        </Link>
        <div className="flex items-center gap-1.5">
          <LanguageSwitcher />
          <ThemeToggle />
          <UserButton />
        </div>
      </div>

      {/* Main Content Area - Independent Scroll */}
      <main className="h-full min-w-0 flex-1 overflow-y-auto pb-20 pt-14 md:pb-6 md:pt-0">{children}</main>
      <MobileBottomNav />
    </div>
  )
}
