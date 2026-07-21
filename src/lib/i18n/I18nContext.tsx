'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { dictionaries, type Language, type Translations } from './dictionaries'
import { Globe } from 'lucide-react'

interface I18nContextType {
  lang: Language
  setLang: (lang: Language) => void
  t: Translations
  mounted: boolean
}

const I18nContext = createContext<I18nContextType | null>(null)

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>('uz')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('app_lang') as Language | null
    if (saved && ['uz', 'ru', 'en'].includes(saved)) {
      setLangState(saved)
    }
  }, [])

  const setLang = (newLang: Language) => {
    setLangState(newLang)
    localStorage.setItem('app_lang', newLang)
    document.cookie = `app_lang=${newLang}; path=/; max-age=31536000`
  }

  const t = dictionaries[lang]

  return (
    <I18nContext.Provider value={{ lang, setLang, t, mounted }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return ctx
}

export function LanguageSwitcher() {
  const { lang, setLang } = useI18n()

  return (
    <div className="relative inline-flex items-center gap-1 rounded-xl border border-zinc-200 bg-zinc-50/80 p-1 dark:border-zinc-800 dark:bg-zinc-900/80">
      <Globe className="ml-1.5 h-3.5 w-3.5 text-zinc-600 dark:text-zinc-400" />
      <button
        type="button"
        onClick={() => setLang('uz')}
        className={`rounded-lg px-2 py-1 text-xs font-bold transition-all ${
          lang === 'uz'
            ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-white'
            : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
        }`}
      >
        O'zb
      </button>
      <button
        type="button"
        onClick={() => setLang('ru')}
        className={`rounded-lg px-2 py-1 text-xs font-bold transition-all ${
          lang === 'ru'
            ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-white'
            : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
        }`}
      >
        Рус
      </button>
      <button
        type="button"
        onClick={() => setLang('en')}
        className={`rounded-lg px-2 py-1 text-xs font-bold transition-all ${
          lang === 'en'
            ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-white'
            : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
        }`}
      >
        Eng
      </button>
    </div>
  )
}
