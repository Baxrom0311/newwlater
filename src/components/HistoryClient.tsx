'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth, useUser } from '@clerk/nextjs'
import { Download, File, FileImage, FileText, Loader2, Lock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/lib/i18n/I18nContext'

interface ConversionItem {
  id: string
  originalName: string
  fileSize: number
  fileType: string
  inputMode: string
  status: string
  resultUrl: string | null
  createdAt: string
}

interface HistoryResponse {
  isPro: boolean
  conversions: ConversionItem[]
}

function fileIcon(type: string) {
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'tiff'].includes(type))
    return <FileImage className="h-4 w-4 text-purple-500" />
  if (type === 'pdf') return <File className="h-4 w-4 text-red-500" />
  return <FileText className="h-4 w-4 text-blue-500" />
}

function statusBadge(status: string) {
  if (status === 'DONE') return <Badge className="border-0 bg-green-100 text-xs text-green-700">OK</Badge>
  if (status === 'FAILED') return <Badge variant="destructive" className="text-xs">Error</Badge>
  if (status === 'PROCESSING') return <Badge className="border-0 bg-yellow-100 text-xs text-yellow-700">Processing</Badge>
  return <Badge variant="outline" className="text-xs">Pending</Badge>
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(value: string, lang: string) {
  const locale = lang === 'ru' ? 'ru-RU' : lang === 'en' ? 'en-US' : 'uz-UZ'
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

export default function HistoryClient() {
  const { t, lang } = useI18n()
  const router = useRouter()
  const { isLoaded, isSignedIn } = useUser()
  const { getToken } = useAuth()
  const [data, setData] = useState<HistoryResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoaded) return
    if (!isSignedIn) {
      router.replace('/sign-in?redirect_url=/history')
      return
    }

    let cancelled = false
    setError(null)

    getToken()
      .then(token => {
        if (!token) throw new Error('Unauthorized')
        return fetch('/api/history', {
          cache: 'no-store',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      })
      .then(async res => {
        if (res.status === 401) {
          router.replace('/sign-in?redirect_url=/history')
          return null
        }
        if (!res.ok) {
          const body = await res.json().catch(() => null)
          throw new Error(body?.error ?? "Error")
        }
        return res.json() as Promise<HistoryResponse>
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

  if (!isLoaded || (isSignedIn && !data && !error)) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="flex items-center gap-3 rounded-3xl border border-zinc-200 bg-white px-5 py-4 text-sm font-black text-zinc-700 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          {t.dashboard.history_title}...
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-xl items-center px-4">
        <div className="w-full rounded-[28px] border border-red-100 bg-white p-6 text-center shadow-sm dark:border-red-950/60 dark:bg-zinc-950">
          <p className="text-lg font-black text-zinc-950 dark:text-white">{t.dashboard.history_title}</p>
          <p className="mt-2 text-sm font-semibold text-zinc-600 dark:text-zinc-400">{error}</p>
        </div>
      </div>
    )
  }

  if (!data.isPro) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <h1 className="mb-8 text-3xl font-black text-zinc-900 dark:text-white">{t.dashboard.history_title}</h1>
        <div className="rounded-[32px] border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-10 text-center shadow-sm dark:border-blue-900/50 dark:from-blue-950/30 dark:to-indigo-950/20">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50">
            <Lock className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="mb-2 text-lg font-bold text-zinc-900 dark:text-white">{t.dashboard.history_pro_lock}</h2>
          <p className="mx-auto mb-6 max-w-xs text-sm font-medium text-zinc-600 dark:text-zinc-400">
            {t.dashboard.history_pro_sub}
          </p>
          <Link href="/pricing">
            <Button className="bg-blue-600 text-white hover:bg-blue-700">
              {t.dashboard.upgrade_pro}
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-black text-zinc-900 dark:text-white">{t.dashboard.history_title}</h1>
        <span className="text-sm font-bold text-zinc-600 dark:text-zinc-400">{data.conversions.length}</span>
      </div>

      {data.conversions.length === 0 ? (
        <div className="rounded-[32px] border border-zinc-200/80 bg-white/92 py-20 text-center text-zinc-600 shadow-sm backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-950/72 dark:text-zinc-400">
          <FileText className="mx-auto mb-3 h-10 w-10 opacity-30" />
          <p>{t.dashboard.history_empty}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {data.conversions.map(c => (
            <div
              key={c.id}
              className="flex items-center gap-3 rounded-2xl border border-zinc-100 bg-white px-4 py-3 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/72"
            >
              {fileIcon(c.fileType)}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-zinc-800 dark:text-zinc-100">{c.originalName}</p>
                <p className="mt-0.5 text-xs text-zinc-400">
                  {formatDate(c.createdAt, lang)} · {formatSize(c.fileSize)} · {c.inputMode === 'cyrillic' ? t.converter.cyrillic_mode : t.converter.old_latin_mode}
                </p>
              </div>
              {statusBadge(c.status)}
              {c.resultUrl && c.status === 'DONE' && (
                <a href={c.resultUrl} target="_blank" rel="noopener noreferrer">
                  <Button size="sm" variant="outline" className="h-7 px-2 text-xs">
                    <Download className="mr-1 h-3 w-3" />
                    {t.converter.download_btn}
                  </Button>
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
