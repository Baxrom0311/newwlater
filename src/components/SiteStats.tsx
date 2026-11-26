'use client'

import { useEffect, useState } from 'react'
import { Activity, Download, Eye, FileCheck2, QrCode } from 'lucide-react'
import type { SiteStats as Stats } from '@/lib/site-stats'
import { useI18n } from '@/lib/i18n/I18nContext'

const REFRESH_MS = 30_000

export default function SiteStats() {
  const { t } = useI18n()
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = () =>
      fetch('/api/stats', { cache: 'no-store' })
        .then((res) => (res.ok ? res.json() : null))
        .then((data: Stats | null) => {
          if (!cancelled && data) setStats(data)
        })
        .catch(() => undefined)

    load()
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') load()
    }, REFRESH_MS)
    return () => {
      cancelled = true
      clearInterval(timer)
    }
  }, [])

  const tiles = [
    { icon: Activity, label: t.stats.requests, total: stats?.total.requests, today: stats?.today.requests },
    { icon: Eye, label: t.stats.page_views, total: stats?.total.pageViews, today: stats?.today.pageViews },
    { icon: QrCode, label: t.stats.qr_scans, total: stats?.total.qrScans, today: stats?.today.qrScans },
    { icon: FileCheck2, label: t.stats.conversions, total: stats?.conversions },
  ]

  return (
    <section className="px-4 py-14 sm:py-20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10 sm:mb-12">
          <p className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 uppercase tracking-widest mb-4">
            <span className="relative flex h-2.5 w-2.5">
              <span className="ping-slow absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-70" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
            </span>
            {t.stats.tag}
          </p>
          <h2 className="text-3xl sm:text-5xl font-bold text-zinc-900 dark:text-white tracking-tight">{t.stats.title}</h2>
          <p className="text-zinc-600 dark:text-zinc-400 mt-4 text-base sm:text-lg">{t.stats.sub}</p>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
          <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-4">
            {tiles.map(({ icon: Icon, label, total, today }) => (
              <div
                key={label}
                className="rounded-3xl border border-zinc-200 bg-white p-5 sm:p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex items-center gap-2.5 text-sm font-semibold text-zinc-500 dark:text-zinc-400">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300">
                    <Icon className="h-4.5 w-4.5" />
                  </span>
                  {label}
                </div>
                <p className="mt-4 text-3xl sm:text-4xl font-bold tabular-nums text-zinc-950 dark:text-white">
                  {total === undefined ? '—' : total.toLocaleString()}
                </p>
                {today !== undefined && (
                  <p className="mt-1 text-sm font-medium text-green-600 dark:text-green-400 tabular-nums">
                    +{today.toLocaleString()} {t.stats.today}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="flex flex-col items-center rounded-3xl border border-zinc-200 bg-white p-6 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            {/* eslint-disable-next-line @next/next/no-img-element -- dynamic SVG from our own route */}
            <img
              src="/api/qr"
              alt={t.stats.qr_title}
              width={200}
              height={200}
              className="h-[200px] w-[200px] rounded-2xl bg-white p-2 ring-1 ring-zinc-200 dark:ring-zinc-700"
            />
            <h3 className="mt-5 text-lg font-bold text-zinc-950 dark:text-white">{t.stats.qr_title}</h3>
            <p className="mt-1.5 text-sm text-zinc-600 dark:text-zinc-400">{t.stats.qr_sub}</p>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- file download, not a page */}
            <a
              href="/api/qr?download=1"
              download
              className="mt-5 inline-flex items-center gap-2 rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:border-blue-300 hover:text-blue-700 dark:border-zinc-700 dark:text-zinc-300 dark:hover:text-blue-300"
            >
              <Download className="h-4 w-4" />
              {t.stats.qr_download}
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
