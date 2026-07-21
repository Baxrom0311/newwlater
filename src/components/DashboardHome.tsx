'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth, useUser } from '@clerk/nextjs'
import { ArrowUpRight, FileText, Loader2, Sparkles, ChevronRight, ShieldCheck } from 'lucide-react'
import DashboardTabs from '@/components/DashboardTabs'
import FileConverter from '@/components/FileConverter'
import TextConverter from '@/components/TextConverter'
import UsageBar from '@/components/UsageBar'
import { useI18n } from '@/lib/i18n/I18nContext'

type PlanKey = 'FREE' | 'PRO' | 'BUSINESS'

interface DashboardMe {
  plan: PlanKey
  used: number
  limit: number | null
  maxFileSizeMB: number
  remaining: number | null
}

export default function DashboardHome() {
  const { t } = useI18n()
  const router = useRouter()
  const { isLoaded, isSignedIn, user: clerkUser } = useUser()
  const { getToken } = useAuth()
  const [data, setData] = useState<DashboardMe | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoaded) return
    if (!isSignedIn) {
      router.replace('/sign-in?redirect_url=/dashboard')
      return
    }

    let cancelled = false
    setError(null)

    getToken()
      .then(token => {
        if (!token) throw new Error('Unauthorized')
        return fetch('/api/me', {
          cache: 'no-store',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      })
      .then(async res => {
        if (res.status === 401) {
          router.replace('/sign-in?redirect_url=/dashboard')
          return null
        }
        if (!res.ok) {
          const body = await res.json().catch(() => null)
          throw new Error(body?.error ?? "Error")
        }
        return res.json() as Promise<DashboardMe>
      })
      .then(body => {
        if (!cancelled && body) setData(body)
      })
      .catch(err => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Error")
      })

    return () => {
      cancelled = true
    }
  }, [getToken, isLoaded, isSignedIn, router])

  const limit = useMemo(() => data?.limit ?? Infinity, [data?.limit])

  // Skeleton loading state according to SaaS best practices
  if (!isLoaded || (isSignedIn && !data && !error)) {
    return (
      <div className="mx-auto w-full max-w-7xl px-3 py-3 sm:px-5 sm:py-4 lg:px-6 space-y-3">
        <div className="h-32 w-full animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-900" />
        <div className="h-20 w-full animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-900" />
        <div className="h-96 w-full animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-900" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-lg items-center px-4">
        <div className="w-full rounded-2xl border border-red-100 bg-white p-5 text-center shadow-sm dark:border-red-950/60 dark:bg-zinc-950">
          <p className="text-base font-black text-zinc-950 dark:text-white">{t.nav.dashboard}</p>
          <p className="mt-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
            {error ?? "Error"}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 h-9 rounded-xl bg-blue-600 px-4 text-xs font-black text-white transition-colors hover:bg-blue-700"
          >
            {t.converter.retry_btn}
          </button>
        </div>
      </div>
    )
  }

  const planLabel = data.plan === 'PRO' ? t.pricing.pro_plan : data.plan === 'BUSINESS' ? t.pricing.business_plan : t.pricing.free_plan

  return (
    <div className="mx-auto w-full max-w-7xl px-3 py-3 sm:px-5 sm:py-4 lg:px-6">

      {/* Top Breadcrumb & User Status Bar */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-600 dark:text-zinc-400">
          <Link href="/" className="hover:text-zinc-900 dark:hover:text-white transition-colors">{t.nav.home}</Link>
          <ChevronRight className="h-3 w-3 text-zinc-400" />
          <span className="text-zinc-900 dark:text-white font-extrabold">{t.nav.dashboard}</span>
        </div>
        {clerkUser && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400 hidden sm:inline">
              {clerkUser.firstName || clerkUser.emailAddresses[0]?.emailAddress}
            </span>
            <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-extrabold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
              <ShieldCheck className="h-3 w-3" /> 2026 Ready
            </span>
          </div>
        )}
      </div>

      {/* Hero header */}
      <section className="dashboard-hero mb-3 overflow-hidden rounded-2xl border border-zinc-200/80 bg-white/92 p-4 shadow-sm backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-950/72 sm:mb-4 sm:rounded-3xl sm:p-5 lg:p-6">
        <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-2 inline-flex max-w-full items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50/80 px-2.5 py-1 text-[11px] font-bold text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/36 dark:text-blue-300">
              <Sparkles className="h-3 w-3" />
              {t.hero.badge}
            </div>
            <h1 className="text-xl font-black tracking-tight text-zinc-950 dark:text-white min-[390px]:text-2xl sm:text-3xl lg:text-4xl">
              {t.dashboard.hero_title}
            </h1>
            <p className="mt-1.5 max-w-xl text-xs font-medium leading-relaxed text-zinc-600 dark:text-zinc-400 sm:text-sm">
              {t.dashboard.hero_sub}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:min-w-[320px]">
            <div className="rounded-xl border border-zinc-200/80 bg-white p-2.5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/70 sm:rounded-2xl sm:p-3">
              <p className="text-[10px] font-black uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{t.dashboard.plan_label}</p>
              <p className="mt-1 text-lg font-black text-zinc-950 dark:text-white sm:text-xl">
                {planLabel}
              </p>
            </div>
            <div className="rounded-xl border border-zinc-200/80 bg-white p-2.5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/70 sm:rounded-2xl sm:p-3">
              <p className="text-[10px] font-black uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{t.dashboard.remaining_label}</p>
              <p className="mt-1 text-lg font-black text-zinc-950 dark:text-white sm:text-xl">
                {data.remaining === null ? t.dashboard.unlimited : data.remaining}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Usage bar and upgrade grid */}
      <div className="mb-3 grid gap-3 sm:mb-4 lg:grid-cols-[1fr_280px]">
        <UsageBar used={data.used} limit={limit} plan={data.plan} />
        {data.plan === 'FREE' ? (
          <Link
            href="/pricing"
            className="group flex items-center justify-between rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-600 to-teal-500 px-4 py-3 text-white shadow-md transition-transform hover:-translate-y-0.5"
          >
            <div>
              <p className="text-xs font-black">{t.dashboard.upgrade_pro}</p>
              <p className="mt-0.5 text-[11px] font-semibold text-white/90">{t.dashboard.upgrade_sub}</p>
            </div>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/18 transition-transform group-hover:translate-x-0.5">
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </Link>
        ) : (
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/80 px-4 py-3 dark:border-emerald-900/60 dark:bg-emerald-950/28">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-black text-zinc-900 dark:text-zinc-100">{t.dashboard.pro_active}</p>
              <p className="mt-0.5 text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">{t.dashboard.pro_active_sub}</p>
            </div>
          </div>
        )}
      </div>

      <DashboardTabs
        textConverter={<TextConverter />}
        fileConverter={<FileConverter plan={data.plan} maxFileSizeMB={data.maxFileSizeMB} />}
      />
    </div>
  )
}
