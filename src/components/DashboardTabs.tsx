'use client'

import { useState } from 'react'
import { FileText, Type } from 'lucide-react'

interface Props {
  textConverter: React.ReactNode
  fileConverter: React.ReactNode
}

export default function DashboardTabs({ textConverter, fileConverter }: Props) {
  const [tab, setTab] = useState<'text' | 'file'>('text')

  return (
    <div className="rounded-[24px] border border-zinc-200/80 bg-white/92 p-2 shadow-[0_18px_48px_rgba(15,23,42,0.09)] backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-950/72 dark:shadow-[0_24px_70px_rgba(0,0,0,0.36)] sm:rounded-[32px] sm:p-4">
      {/* Tab buttons */}
      <div className="mb-3 grid grid-cols-2 gap-1.5 rounded-[20px] bg-zinc-200/70 p-1.5 dark:bg-zinc-900/80 sm:mb-4 sm:w-fit sm:min-w-[360px] sm:gap-2 sm:rounded-[24px]">
        <button
          onClick={() => setTab('text')}
          className={`flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-black transition-all duration-200 sm:rounded-[18px] sm:px-5 sm:py-3 ${
            tab === 'text'
              ? 'bg-white text-zinc-950 shadow-sm dark:bg-zinc-800 dark:text-white'
              : 'text-zinc-600 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
          }`}
        >
          <Type className="h-4 w-4" />
          Matn
        </button>
        <button
          onClick={() => setTab('file')}
          className={`flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-black transition-all duration-200 sm:rounded-[18px] sm:px-5 sm:py-3 ${
            tab === 'file'
              ? 'bg-white text-zinc-950 shadow-sm dark:bg-zinc-800 dark:text-white'
              : 'text-zinc-600 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
          }`}
        >
          <FileText className="h-4 w-4" />
          Fayl
        </button>
      </div>

      {/* Panel */}
      <div className="overflow-hidden rounded-[20px] border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 sm:rounded-[26px]">
        {tab === 'text' ? textConverter : fileConverter}
      </div>
    </div>
  )
}
