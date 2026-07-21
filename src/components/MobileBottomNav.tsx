'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { Home, LayoutDashboard, ReceiptText, History } from 'lucide-react'
import { useI18n } from '@/lib/i18n/I18nContext'

export default function MobileBottomNav() {
  const pathname = usePathname()
  const { isSignedIn } = useUser()
  const { t } = useI18n()

  const items = [
    { href: '/', label: t.nav.home, icon: Home, authHref: '/' },
    { href: '/pricing', label: t.nav.pricing, icon: ReceiptText, authHref: '/pricing' },
    { href: '/dashboard', label: t.nav.panel, icon: LayoutDashboard, authHref: '/sign-in' },
    { href: '/history', label: t.nav.history, icon: History, authHref: '/sign-in' },
  ]

  return (
    <nav className="fixed inset-x-3 bottom-3 z-50 rounded-[24px] border border-zinc-200/90 bg-white/94 p-1.5 shadow-[0_18px_55px_rgba(15,23,42,0.18)] backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/92 md:hidden">
      <div className="grid grid-cols-4 gap-1">
        {items.map(({ href, authHref, label, icon: Icon }) => {
          const target = href === '/dashboard' || href === '/history'
            ? isSignedIn ? href : authHref
            : href
          const active =
            href === '/'
              ? pathname === '/'
              : pathname === href || pathname?.startsWith(`${href}/`)

          return (
            <Link
              key={href}
              href={target}
              className={`flex h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-[18px] text-[11px] font-black transition-all ${
                active
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="truncate">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
