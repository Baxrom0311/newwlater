'use client'

import Link from 'next/link'
import { useI18n } from '@/lib/i18n/I18nContext'

interface Props { used: number; limit: number; plan: string }

export default function UsageBar({ used, limit, plan }: Props) {
  const { t } = useI18n()
  const unlimited = limit === Infinity
  const pct = unlimited ? 0 : Math.min(100, Math.round((used / limit) * 100))
  const near = pct >= 80
  const full = pct >= 100

  const planName = plan === 'FREE' ? t.pricing.free_plan : plan === 'PRO' ? t.pricing.pro_plan : t.pricing.business_plan

  return (
    <div className="rounded-[26px] border border-zinc-200/80 bg-white/92 p-5 shadow-sm backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-950/72">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-black text-zinc-900 dark:text-zinc-100">{t.usage.monthly}</span>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
            plan === 'BUSINESS' ? 'bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-300' :
            plan === 'PRO'      ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300' :
                                  'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-300'
          }`}>
            {planName}
          </span>
        </div>
        <span className="text-sm font-black tabular-nums text-zinc-700 dark:text-zinc-400">
          {used} / {unlimited ? '∞' : limit}
        </span>
      </div>

      {!unlimited && (
        <>
          <div className="h-3 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                full ? 'bg-red-500' : near ? 'bg-amber-500' : 'bg-blue-500'
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>

          {full && plan === 'FREE' && (
            <div className="mt-3 flex items-center justify-between">
              <p className="text-sm font-bold text-red-500">{t.usage.limit_reached}</p>
              <Link href="/pricing" className="text-sm font-bold text-blue-600 transition-colors hover:text-blue-700">
                {t.usage.upgrade}
              </Link>
            </div>
          )}
          {near && !full && (
            <p className="mt-2 text-sm font-semibold text-amber-600">{limit - used} {t.usage.remaining}</p>
          )}
        </>
      )}
      {unlimited && (
        <p className="mt-1 text-sm font-bold text-zinc-600 dark:text-zinc-400">{t.usage.unlimited}</p>
      )}
    </div>
  )
}
