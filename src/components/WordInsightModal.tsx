'use client'

import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import {
  X,
  Volume2,
  Sparkles,
  BookOpen,
  ArrowRightLeft,
  Search,
  Quote,
  Check,
  Copy,
  AlertTriangle,
  Lightbulb,
} from 'lucide-react'
import { lookupWordInsight, type WordInsightResult } from '@/lib/lexicon'
import { toast } from 'sonner'

interface WordInsightModalProps {
  word: string | null
  isOpen: boolean
  onClose: () => void
}

export default function WordInsightModal(props: WordInsightModalProps) {
  return <WordInsightModalContent key={props.word ?? 'empty'} {...props} />
}

function WordInsightModalContent({ word, isOpen, onClose }: WordInsightModalProps) {
  const initialResult = useMemo(() => (word?.trim() ? lookupWordInsight(word) : null), [word])
  const [searchTerm, setSearchTerm] = useState(word ?? '')
  const [result, setResult] = useState<WordInsightResult | null>(initialResult)
  const [speaking, setSpeaking] = useState(false)
  const [copied, setCopied] = useState(false)
  const dialogRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Fetch or look up word
  const inspectWord = useCallback((w: string) => {
    if (!w || !w.trim()) return
    const insight = lookupWordInsight(w)
    setResult(insight)
    setSearchTerm(w)
  }, [])

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialogRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [isOpen, onClose])

  const speak = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    if (speaking) {
      window.speechSynthesis.cancel()
      setSpeaking(false)
      return
    }
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'uz-UZ'
    utterance.onend = () => setSpeaking(false)
    utterance.onerror = () => setSpeaking(false)
    setSpeaking(true)
    window.speechSynthesis.speak(utterance)
  }

  const copyWord = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
      toast.success('Nusxalandi')
    } catch {
      // Ignore
    }
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      inspectWord(searchTerm.trim())
    }
  }

  if (!isOpen) return null

  const entry = result?.entry
  const isClassical = entry?.type === 'classical'
  const isHomonym = entry?.type === 'homonym_tutuq'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="word-insight-title"
        tabIndex={-1}
        onClick={e => e.stopPropagation()}
        className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl outline-none dark:border-zinc-800 dark:bg-zinc-950"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 bg-zinc-50/80 px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900/80">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 id="word-insight-title" className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                AI So‘z Tahlili & Izohli Lug‘at
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Mumtoz adabiyot, tutuq belgisi va leksik ma’no tahlili
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search Bar inside modal */}
        <div className="border-b border-zinc-100 px-6 py-3 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <Search className="absolute left-3.5 h-4 w-4 text-zinc-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Boshqa so'zni tahlil qilish uchun yozing..."
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50/60 py-2 pl-10 pr-24 text-sm font-medium text-zinc-900 outline-none transition-all placeholder:text-zinc-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-100 dark:focus:border-blue-500"
            />
            <button
              type="submit"
              className="absolute right-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-blue-700 shadow-sm"
            >
              Tahlil
            </button>
          </form>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {result && (
            <>
              {/* Word Title + Badges */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-transparent p-4 dark:from-blue-950/40 dark:via-indigo-950/20 dark:to-transparent border border-blue-100 dark:border-blue-900/50">
                <div className="flex items-center gap-3">
                  <span className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-50 capitalize">
                    {result.baseWord || result.searchedWord}
                  </span>
                  <button
                    type="button"
                    onClick={() => speak(result.baseWord || result.searchedWord)}
                    title="Talaffuzni eshitish"
                    className={`flex h-8 w-8 items-center justify-center rounded-full border border-blue-200 bg-white text-blue-600 shadow-sm transition-transform hover:scale-105 dark:border-blue-800 dark:bg-zinc-900 dark:text-blue-400 ${
                      speaking ? 'animate-pulse ring-2 ring-blue-500' : ''
                    }`}
                  >
                    <Volume2 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => copyWord(result.baseWord || result.searchedWord)}
                    title="Nusxa olish"
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-500 shadow-sm transition-transform hover:scale-105 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {entry?.origin && (
                    <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
                      🏛️ {entry.origin}
                    </span>
                  )}
                  {isClassical && (
                    <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-bold text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60">
                      📜 Mumtoz so‘z
                    </span>
                  )}
                  {isHomonym && (
                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                      ⚡ Tutuq / Gomonim
                    </span>
                  )}
                </div>
              </div>

              {/* Transliterations in 3 Alphabets */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-3 dark:border-zinc-800 dark:bg-zinc-900/50">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                    Eski Lotin (1995)
                  </div>
                  <div className="mt-1 text-sm font-bold text-zinc-800 dark:text-zinc-200">
                    {result.transliterations.oldLatin}
                  </div>
                </div>
                <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-3 dark:border-blue-900/60 dark:bg-blue-950/30">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    Yangi Lotin (2026)
                  </div>
                  <div className="mt-1 text-sm font-bold text-blue-700 dark:text-blue-300">
                    {result.transliterations.newLatin}
                  </div>
                </div>
                <div className="rounded-xl border border-orange-200 bg-orange-50/40 p-3 dark:border-orange-900/60 dark:bg-orange-950/30">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                    Kirill Alifbosi
                  </div>
                  <div className="mt-1 text-sm font-bold text-orange-700 dark:text-orange-300">
                    {result.transliterations.cyrillic}
                  </div>
                </div>
              </div>

              {/* Morphological Breakdown if word had suffixes */}
              {result.suffixes.length > 0 && (
                <div className="flex items-center gap-2 rounded-xl bg-zinc-100/80 px-3.5 py-2.5 text-xs text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
                  <span className="font-bold text-zinc-500">Morfologik tahlil:</span>
                  <span className="font-extrabold text-blue-600 dark:text-blue-400">{result.baseWord}</span>
                  <span className="text-zinc-400">+</span>
                  {result.suffixes.map((s, idx) => (
                    <span
                      key={idx}
                      className="rounded bg-white px-1.5 py-0.5 font-bold shadow-xs dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200"
                    >
                      -{s}
                    </span>
                  ))}
                  <span className="text-zinc-500 ml-auto italic">
                    (asos shakli bo'yicha tahlil)
                  </span>
                </div>
              )}

              {/* Definition / Meaning */}
              {entry?.meaning ? (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                    <BookOpen className="h-3.5 w-3.5 text-blue-600" />
                    Ma’nosi va Izohi
                  </div>
                  <div className="rounded-xl border border-zinc-200 bg-white p-4 text-sm leading-relaxed text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
                    {entry.meaning}
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400">
                  Bu so‘z umumiy leksikada qo‘llanuvchi so‘z bo‘lib, yuqoridagi uch xil alifbo ko‘rinishida to‘g‘ri konvertatsiya qilinishi ta’minlangan.
                </div>
              )}

              {/* Modern Equivalent for Classical words */}
              {entry?.modernEquivalent && (
                <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50/60 p-3.5 dark:border-emerald-900/50 dark:bg-emerald-950/30">
                  <Lightbulb className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <span className="font-bold text-emerald-900 dark:text-emerald-200">
                      Zamonaviy tildagi muqobili:{' '}
                    </span>
                    <span className="font-semibold text-emerald-800 dark:text-emerald-300">
                      {entry.modernEquivalent}
                    </span>
                  </div>
                </div>
              )}

              {/* TUTUQ BELGISI / GOMONIM COMPARISON CARD */}
              {entry?.counterpart && (
                <div className="rounded-xl border border-amber-300 bg-amber-50/50 p-4 dark:border-amber-900/60 dark:bg-amber-950/20 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-900 dark:text-amber-200">
                    <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    Tutuq belgisi & Gomonim taqqoslash
                  </div>

                  {entry.distinctionTip && (
                    <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed font-medium bg-amber-100/70 dark:bg-amber-900/40 p-2.5 rounded-lg">
                      💡 {entry.distinctionTip}
                    </p>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {/* Current word */}
                    <div className="rounded-lg border border-amber-200 bg-white p-3 dark:border-amber-900 dark:bg-zinc-900">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-amber-900 dark:text-amber-200 text-sm">
                          {entry.word}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-zinc-400">
                          {entry.type === 'homonym_tutuq' ? 'Hozirgi so‘z' : ''}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400 leading-normal">
                        {entry.meaning}
                      </p>
                    </div>

                    {/* Counterpart */}
                    <div className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-blue-600 dark:text-blue-400 text-sm">
                          {entry.counterpart.word}
                        </span>
                        <button
                          type="button"
                          onClick={() => inspectWord(entry.counterpart!.word)}
                          className="text-[10px] font-bold text-blue-600 hover:underline inline-flex items-center gap-0.5"
                        >
                          <ArrowRightLeft className="w-2.5 h-2.5" /> Tahlilga o‘tish
                        </button>
                      </div>
                      <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400 leading-normal">
                        {entry.counterpart.meaning}
                      </p>
                      {entry.counterpart.example && (
                        <p className="mt-1.5 text-[11px] italic text-zinc-500 border-t border-zinc-100 pt-1 dark:border-zinc-800">
                          «{entry.counterpart.example}»
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Classical Quote (Navoiy, Bobur, etc.) */}
              {entry?.classicalExample && (
                <div className="rounded-xl border border-purple-200 bg-purple-50/50 p-4 dark:border-purple-900/60 dark:bg-purple-950/20 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-purple-900 dark:text-purple-200">
                    <Quote className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    Mumtoz adabiyotdan namuna
                  </div>
                  <blockquote className="italic text-sm font-medium text-purple-950 dark:text-purple-200 border-l-2 border-purple-400 pl-3 py-0.5">
                    «{entry.classicalExample.quote}»
                  </blockquote>
                  <div className="flex items-center justify-between text-xs text-purple-700 dark:text-purple-400 font-semibold pt-1">
                    <span>— {entry.classicalExample.author}</span>
                    {entry.classicalExample.source && (
                      <span className="text-[11px] opacity-80">({entry.classicalExample.source})</span>
                    )}
                  </div>
                </div>
              )}

              {/* Examples in modern sentences */}
              {entry?.examples && entry.examples.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                    Matnda qo‘llanilishi (Misollar)
                  </div>
                  <ul className="space-y-1.5 text-xs text-zinc-700 dark:text-zinc-300">
                    {entry.examples.map((ex, idx) => (
                      <li key={idx} className="flex items-start gap-2 bg-zinc-50 dark:bg-zinc-900 p-2.5 rounded-lg border border-zinc-100 dark:border-zinc-800/80">
                        <span className="text-blue-500 font-bold">•</span>
                        <span className="italic leading-relaxed">{ex}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Synonyms */}
              {entry?.synonyms && entry.synonyms.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                    Sinonimlari
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {entry.synonyms.map((syn, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => inspectWord(syn)}
                        className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700 transition-colors hover:bg-blue-50 hover:text-blue-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-blue-950 dark:hover:text-blue-300"
                      >
                        {syn}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-zinc-100 bg-zinc-50/80 px-6 py-3 text-xs font-medium text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/80">
          <span>ESC tugmasi bilan yopiladi</span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-zinc-200 px-4 py-1.5 font-bold text-zinc-700 transition-colors hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            Yopish
          </button>
        </div>
      </div>
    </div>
  )
}
