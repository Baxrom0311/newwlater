'use client'

import { useState } from 'react'
import { FileText, Type } from 'lucide-react'
import { useI18n } from '@/lib/i18n/I18nContext'

interface Props {
  textConverter: React.ReactNode
  fileConverter: React.ReactNode
}

export default function DashboardTabs({ textConverter, fileConverter }: Props) {
  const { t } = useI18n()
  const [tab, setTab] = useState<'text' | 'file'>('text')

  return (
    <div className="rounded-2xl border border-zinc-200/80 bg-white/92 p-2 shadow-sm backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-950/72 sm:rounded-3xl sm:p-3">
      {/* Tab buttons */}
      <div className="mb-2 grid grid-cols-2 gap-1 rounded-xl bg-zinc-100 p-1 dark:bg-zinc-900/80 sm:mb-3 sm:w-fit sm:min-w-[320px] sm:gap-1.5 sm:rounded-2xl">
        <button
          onClick={() => setTab('text')}
          className={`flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-black transition-all duration-200 sm:rounded-xl sm:px-4 sm:py-2.5 sm:text-sm ${
            tab === 'text'
              ? 'bg-white text-zinc-950 shadow-sm dark:bg-zinc-800 dark:text-white'
              : 'text-zinc-600 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
          }`}
        >
          <Type className="h-3.5 w-3.5" />
          {t.converter.text_tab}
        </button>
        <button
          onClick={() => setTab('file')}
          className={`flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-black transition-all duration-200 sm:rounded-xl sm:px-4 sm:py-2.5 sm:text-sm ${
            tab === 'file'
              ? 'bg-white text-zinc-950 shadow-sm dark:bg-zinc-800 dark:text-white'
              : 'text-zinc-600 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
          }`}
        >
          <FileText className="h-3.5 w-3.5" />
          {t.converter.file_tab}
        </button>
      </div>

      {/* Panel */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 sm:rounded-2xl">
        {tab === 'text' ? textConverter : fileConverter}
      </div>
    </div>
  )
}
