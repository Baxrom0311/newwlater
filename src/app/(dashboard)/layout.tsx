import Link from 'next/link'
import { UserButton } from '@clerk/nextjs'
import { LayoutDashboard, History, Zap, ArrowLeft, Crown } from 'lucide-react'
import AppLogo from '@/components/AppLogo'
import MobileBottomNav from '@/components/MobileBottomNav'
import ThemeToggle from '@/components/ThemeToggle'

const NAV = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/history', icon: History, label: 'Tarix' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dashboard-surface min-h-screen flex">

      {/* Sidebar */}
      <aside className="hidden md:flex w-72 shrink-0 p-5">
        <div className="dashboard-sidebar flex min-h-[calc(100vh-40px)] w-full flex-col rounded-[28px] border border-zinc-200/80 bg-white/92 px-4 py-5 shadow-[0_24px_70px_rgba(15,23,42,0.10)] backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-950/72 dark:shadow-[0_24px_70px_rgba(0,0,0,0.36)]">

        {/* Logo */}
        <Link href="/" className="group mb-8 flex items-center gap-3 rounded-2xl px-2 py-1.5">
          <AppLogo size="lg" className="transition-transform group-hover:scale-95" />
          <div>
            <span className="block text-lg font-black tracking-tight text-zinc-950 dark:text-white">AlifboAI</span>
            <span className="block text-xs font-bold text-zinc-600 dark:text-zinc-400">2026 konvertor</span>
          </div>
        </Link>

        {/* Nav */}
        <nav className="flex-1 space-y-1.5">
          {NAV.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className="group flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-bold text-zinc-600 transition-all duration-150 hover:bg-blue-50 hover:text-blue-700 dark:text-zinc-400 dark:hover:bg-blue-950/30 dark:hover:text-blue-300"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-100 text-zinc-500 transition-colors group-hover:bg-white group-hover:text-blue-600 dark:bg-zinc-900 dark:text-zinc-400 dark:group-hover:bg-zinc-800 dark:group-hover:text-blue-300">
                <Icon className="h-4 w-4" />
              </span>
              {label}
            </Link>
          ))}
        </nav>

        {/* Bottom */}
        <div className="mt-4 space-y-3">
          <Link
            href="/pricing"
            className="block rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-600 to-teal-500 p-4 text-white shadow-xl shadow-blue-600/18 transition-transform hover:-translate-y-0.5"
          >
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-2xl bg-white/18">
              <Crown className="h-4 w-4" />
            </div>
            <p className="text-sm font-black">Pro imkoniyatlar</p>
            <p className="mt-1 text-xs font-semibold leading-relaxed text-white/90">PDF, OCR va katta fayllarni oching.</p>
            <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold">
              Upgrade <Zap className="h-3.5 w-3.5" />
            </span>
          </Link>

          <div className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white px-3 py-3 dark:border-zinc-800 dark:bg-zinc-900/70">
            <UserButton />
            <div className="min-w-0">
              <span className="block truncate text-sm font-bold text-zinc-800 dark:text-zinc-100">Profil</span>
              <span className="block truncate text-xs font-semibold text-zinc-600 dark:text-zinc-400">Account</span>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white px-3 py-3 dark:border-zinc-800 dark:bg-zinc-900/70">
            <div>
              <span className="block text-sm font-bold text-zinc-800 dark:text-zinc-100">Theme</span>
              <span className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400">Light · Dark · System</span>
            </div>
            <ThemeToggle />
          </div>

          <Link
            href="/"
            className="flex items-center gap-2 rounded-2xl px-3 py-2.5 text-xs font-bold text-zinc-600 transition-all hover:bg-zinc-50 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-200"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Bosh sahifa
          </Link>
        </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="fixed left-0 right-0 top-0 z-40 flex h-16 items-center justify-between border-b border-zinc-200 bg-white/94 px-4 shadow-sm backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/86 md:hidden">
        <Link href="/dashboard" className="flex items-center gap-2">
          <AppLogo size="sm" showWordmark />
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/"
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 text-xs font-bold text-zinc-700 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Bosh
          </Link>
          <UserButton />
        </div>
      </div>

      {/* Main */}
      <main className="min-w-0 flex-1 overflow-auto pb-24 pt-16 md:pb-0 md:pt-0">{children}</main>
      <MobileBottomNav />
    </div>
  )
}
