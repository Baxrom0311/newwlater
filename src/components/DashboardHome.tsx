'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { ArrowUpRight, FileText, Loader2, Sparkles } from 'lucide-react'
import DashboardTabs from '@/components/DashboardTabs'
import FileConverter from '@/components/FileConverter'
import TextConverter from '@/components/TextConverter'
import UsageBar from '@/components/UsageBar'

type PlanKey = 'FREE' | 'PRO' | 'BUSINESS'

interface DashboardMe {
  plan: PlanKey
  used: number
  limit: number | null
  maxFileSizeMB: number
  remaining: number | null
}

function planLabel(plan: PlanKey) {
  if (plan === 'PRO') return 'Pro'
  if (plan === 'BUSINESS') return 'Business'
  return 'Bepul'
}

export default function DashboardHome() {
  const router = useRouter()
  const { isLoaded, isSignedIn } = useUser()
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

    fetch('/api/me', { cache: 'no-store' })
      .then(async res => {
        if (res.status === 401) {
          router.replace('/sign-in?redirect_url=/dashboard')
          return null
        }
        if (!res.ok) {
          const body = await res.json().catch(() => null)
          throw new Error(body?.error ?? "Ma'lumot yuklanmadi")
        }
        return res.json() as Promise<DashboardMe>
      })
      .then(body => {
        if (!cancelled && body) setData(body)
      })
      .catch(err => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Ma'lumot yuklanmadi")
      })

    return () => {
      cancelled = true
    }
  }, [isLoaded, isSignedIn, router])

  const limit = useMemo(() => data?.limit ?? Infinity, [data?.limit])

  if (!isLoaded || (isSignedIn && !data && !error)) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="flex items-center gap-3 rounded-3xl border border-zinc-200 bg-white px-5 py-4 text-sm font-black text-zinc-700 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          Dashboard yuklanmoqda
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-xl items-center px-4">
        <div className="w-full rounded-[28px] border border-red-100 bg-white p-6 text-center shadow-sm dark:border-red-950/60 dark:bg-zinc-950">
          <p className="text-lg font-black text-zinc-950 dark:text-white">Dashboard ochilmadi</p>
          <p className="mt-2 text-sm font-semibold text-zinc-600 dark:text-zinc-400">
            {error ?? "Ma'lumot yuklanmadi"}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-5 h-11 rounded-2xl bg-blue-600 px-5 text-sm font-black text-white transition-colors hover:bg-blue-700"
          >
            Qayta urinish
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-3 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      <section className="dashboard-hero mb-4 overflow-hidden rounded-[24px] border border-zinc-200/80 bg-white/92 p-4 shadow-[0_18px_48px_rgba(15,23,42,0.09)] backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-950/72 dark:shadow-[0_24px_70px_rgba(0,0,0,0.36)] sm:mb-6 sm:rounded-[32px] sm:p-7 lg:p-8">
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex max-w-full items-center gap-2 rounded-full border border-blue-100 bg-blue-50/80 px-3 py-1.5 text-xs font-bold text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/36 dark:text-blue-300 sm:mb-4">
              <Sparkles className="h-3.5 w-3.5" />
              Yangi 2026 O'zbek alifbosi
            </div>
            <h1 className="text-2xl font-black tracking-tight text-zinc-950 dark:text-white min-[390px]:text-3xl sm:text-4xl lg:text-5xl">
              Hujjatlaringizni bir joyda konvert qiling
            </h1>
            <p className="mt-3 max-w-xl text-sm font-medium leading-relaxed text-zinc-600 dark:text-zinc-400 sm:mt-4 sm:text-lg">
              Matn, DOCX va TXT fayllarni yangi alifboga tez o'tkazing. Natijani darhol nusxalang yoki yuklab oling.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:min-w-[360px] sm:gap-3">
            <div className="rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/70 sm:rounded-3xl sm:p-4">
              <p className="text-xs font-black uppercase tracking-wide text-zinc-600 dark:text-zinc-400">Reja</p>
              <p className="mt-1.5 text-xl font-black text-zinc-950 dark:text-white sm:mt-2 sm:text-2xl">
                {planLabel(data.plan)}
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/70 sm:rounded-3xl sm:p-4">
              <p className="text-xs font-black uppercase tracking-wide text-zinc-600 dark:text-zinc-400">Qoldi</p>
              <p className="mt-1.5 text-xl font-black text-zinc-950 dark:text-white sm:mt-2 sm:text-2xl">
                {data.remaining === null ? 'Cheksiz' : data.remaining}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="mb-4 grid gap-3 sm:mb-6 sm:gap-4 lg:grid-cols-[1fr_320px]">
        <UsageBar used={data.used} limit={limit} plan={data.plan} />
        {data.plan === 'FREE' ? (
          <Link
            href="/pricing"
            className="group flex items-center justify-between rounded-[26px] border border-blue-100 bg-gradient-to-br from-blue-600 to-teal-500 px-5 py-4 text-white shadow-xl shadow-blue-600/18 transition-transform hover:-translate-y-0.5"
          >
            <div>
              <p className="text-sm font-black">Pro ga o'tish</p>
              <p className="mt-1 text-xs font-semibold text-white/90">PDF, OCR va 500 ta konversiya</p>
            </div>
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/18 transition-transform group-hover:translate-x-0.5">
              <ArrowUpRight className="h-5 w-5" />
            </span>
          </Link>
        ) : (
          <div className="flex items-center gap-4 rounded-[26px] border border-emerald-100 bg-emerald-50/80 px-5 py-4 dark:border-emerald-900/60 dark:bg-emerald-950/28">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-black text-zinc-900 dark:text-zinc-100">Pro aktiv</p>
              <p className="mt-1 text-xs font-semibold text-zinc-600 dark:text-zinc-400">Katta fayllar va tarix ochiq.</p>
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
