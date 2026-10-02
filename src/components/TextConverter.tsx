'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { convertText, detectMode, type ConversionMode } from '@/lib/converter'
import { Copy, Check, Download, Trash2, ArrowRight, ArrowLeftRight, FileText, Eye, History, Clock, CaseUpper, CaseLower, Volume2, Wand2, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { useI18n } from '@/lib/i18n/I18nContext'
import AlphabetMapModal from '@/components/AlphabetMapModal'
import WordInsightModal from '@/components/WordInsightModal'
import { lookupWordInsight } from '@/lib/lexicon'
import { findAutocorrectionsInText } from '@/lib/autocorrect'

type SelectedMode = 'auto' | 'old-latin' | 'cyrillic' | 'new-latin'

interface HistoryItem {
  id: string
  text: string
  timestamp: string
}

export default function TextConverter() {
  const { t } = useI18n()
  const [input, setInput] = useState('')
  const [modeSetting, setModeSetting] = useState<SelectedMode>('auto')
  const [copiedInput, setCopiedInput] = useState(false)
  const [copiedOutput, setCopiedOutput] = useState(false)
  const [diffMode, setDiffMode] = useState(false)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [speaking, setSpeaking] = useState(false)
  const [insightWord, setInsightWord] = useState<string | null>(null)
  const [isInsightOpen, setIsInsightOpen] = useState(false)

  const openInsight = useCallback((w: string) => {
    if (!w || !w.trim()) return
    setInsightWord(w.trim())
    setIsInsightOpen(true)
  }, [])

  // Load history from localStorage on mount (localStorage is unavailable during
  // SSR, so this must run in an effect rather than lazy initial state).
  useEffect(() => {
    try {
      const saved = localStorage.getItem('alifbo_recent_texts')
      if (saved) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setHistory(JSON.parse(saved))
      }
    } catch {
      // Ignore
    }
  }, [])

  // Save to history helper
  const saveToHistory = useCallback((text: string) => {
    if (!text.trim() || text.length < 3) return
    setHistory(prev => {
      const filtered = prev.filter(item => item.text !== text)
      const updated = [{ id: String(Date.now()), text, timestamp: new Date().toLocaleTimeString() }, ...filtered].slice(0, 5)
      try {
        localStorage.setItem('alifbo_recent_texts', JSON.stringify(updated))
      } catch {
        // Ignore
      }
      return updated
    })
  }, [])

  const [autocorrect, setAutocorrect] = useState(true)

  // Derived state — compute during render instead of writing state in an effect.
  const activeMode: ConversionMode = useMemo(
    () => (modeSetting === 'auto' ? detectMode(input) : modeSetting),
    [input, modeSetting]
  )
  const output = useMemo(
    () => (input.trim() ? convertText(input, activeMode, { autocorrect }) : ''),
    [input, activeMode, autocorrect]
  )

  const detectedCorrections = useMemo(() => {
    if (!autocorrect || !input.trim()) return []
    return findAutocorrectionsInText(input)
  }, [input, autocorrect])

  // Debounced save-to-history is a genuine side effect.
  useEffect(() => {
    if (!input.trim()) return
    const timer = setTimeout(() => saveToHistory(input), 1200)
    return () => clearTimeout(timer)
  }, [input, saveToHistory])

  // Stop any speech synthesis when this component unmounts.
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  const copy = useCallback(async (text: string, side: 'in' | 'out') => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      toast.error(t.converter.copy)
      return
    }
    if (side === 'in') {
      setCopiedInput(true)
      setTimeout(() => setCopiedInput(false), 1800)
    } else {
      setCopiedOutput(true)
      setTimeout(() => setCopiedOutput(false), 1800)
    }
    toast.success(t.converter.copied)
  }, [t.converter.copied, t.converter.copy])

  const downloadTxt = useCallback(() => {
    if (!output) return
    const blob = new Blob([output], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
	    a.href = url
	    a.download = 'alifbo_matn.txt'
	    a.click()
	    setTimeout(() => URL.revokeObjectURL(url), 1000)
	    toast.success(t.converter.download_txt)
  }, [output, t.converter.download_txt])

  const downloadDocx = useCallback(async () => {
    if (!output) return
    try {
      // Dynamic import keeps jszip out of the main dashboard bundle.
      const { createDocxFromText } = await import('@/lib/docx-writer')
      const docxBuffer = await createDocxFromText(output)
      const blob = new Blob([new Uint8Array(docxBuffer)], {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
	      a.href = url
	      a.download = 'alifbo_hujjat.docx'
	      a.click()
	      setTimeout(() => URL.revokeObjectURL(url), 1000)
	      toast.success(t.converter.download_docx)
    } catch {
      toast.error('DOCX Error')
    }
  }, [output, t.converter.download_docx])

  const swapText = useCallback(() => {
    if (!output) return
    setInput(output)
    if (modeSetting === 'old-latin') {
      setModeSetting('new-latin')
    } else if (modeSetting === 'new-latin') {
      setModeSetting('old-latin')
    }
    toast.success(t.converter.swap)
  }, [output, modeSetting, t.converter.swap])

  const changeCase = (upper: boolean) => {
    if (!input) return
    setInput(upper ? input.toUpperCase() : input.toLowerCase())
  }

  const cleanExtraSpaces = () => {
    if (!input) return
    const cleaned = input.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim()
    setInput(cleaned)
    toast.success('Tozalandi')
  }

  const speakText = () => {
    if (!output || typeof window === 'undefined' || !('speechSynthesis' in window)) return
    if (speaking) {
      window.speechSynthesis.cancel()
      setSpeaking(false)
      return
    }
    const utterance = new SpeechSynthesisUtterance(output)
    utterance.lang = 'uz-UZ'
    utterance.onend = () => setSpeaking(false)
    utterance.onerror = () => setSpeaking(false)
    setSpeaking(true)
    window.speechSynthesis.speak(utterance)
  }

  const wordCount = (text: string) =>
    text.trim() ? text.trim().split(/\s+/).length : 0

  const readingTimeSec = useMemo(() => {
    const words = wordCount(output)
    return Math.max(1, Math.ceil(words / 3.5))
  }, [output])

  const detectedLabel =
    activeMode === 'cyrillic'
      ? t.converter.cyrillic_mode
      : activeMode === 'new-latin'
      ? (t.converter.new_latin_mode ?? 'Yangi → Eski')
      : t.converter.old_latin_mode

  const renderedInteractiveOutput = useMemo(() => {
    if (!output) return null

    // Split preserving whitespace and punctuation
    const tokens = output.split(/([ \t\n\r]+|[.,!?:;"'«»()[\]{}]+)/)

    return tokens.map((token, idx) => {
      // Whitespace / punctuation
      if (/^[ \t\n\r]+$/.test(token) || /^[.,!?:;"'«»()[\]{}]+$/.test(token)) {
        return <span key={idx}>{token}</span>
      }

      const clean = token.replace(/^[^\p{L}\d'ʻ`ʼ´]+|[^\p{L}\d'ʻ`ʼ´]+$/gu, '')
      if (!clean) return <span key={idx}>{token}</span>

      const insight = lookupWordInsight(clean)
      const isClassical = insight.entry?.type === 'classical'
      const isHomonym = insight.entry?.type === 'homonym_tutuq'

      let tokenContent: React.ReactNode = token
      if (diffMode && /[şçöğŞÇÖĞ]/.test(token)) {
        const parts = token.split(/([şçöğŞÇÖĞ])/)
        tokenContent = parts.map((part, pIdx) => {
          if (/^[şçöğŞÇÖĞ]$/.test(part)) {
            return (
              <mark
                key={pIdx}
                className="rounded bg-amber-200/80 px-0.5 font-black text-amber-900 dark:bg-amber-500/35 dark:text-amber-200"
              >
                {part}
              </mark>
            )
          }
          return part
        })
      }

      return (
        <span
          key={idx}
          onClick={() => openInsight(clean)}
          title={`${clean} — AI ma'no va leksik tahlilni ko'rish uchun bosing`}
          className={`group/word relative inline cursor-pointer rounded px-0.5 transition-colors hover:bg-blue-100 hover:text-blue-900 dark:hover:bg-blue-900/40 dark:hover:text-blue-200 ${
            isClassical
              ? 'decoration-purple-500 decoration-wavy underline underline-offset-4 font-bold text-purple-950 dark:text-purple-200'
              : isHomonym
              ? 'decoration-amber-500 decoration-dashed underline underline-offset-4 font-bold text-amber-950 dark:text-amber-200'
              : ''
          }`}
        >
          {tokenContent}
          {isClassical && (
            <span className="ml-0.5 inline-block text-[11px] select-none opacity-80" title="Mumtoz so‘z">
              📜
            </span>
          )}
          {isHomonym && (
            <span className="ml-0.5 inline-block text-[11px] select-none opacity-80" title="Tutuq belgisi / Gomonim farqi">
              ⚡
            </span>
          )}
        </span>
      )
    })
  }, [output, diffMode, openInsight])

  return (
    <div className="flex flex-col overflow-hidden bg-white dark:bg-zinc-950">

      {/* Top bar with mode switcher & Alphabet rule modal */}
      <div className="flex flex-col gap-2.5 border-b border-zinc-100 bg-zinc-50/72 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/70 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 mr-1">{t.converter.auto_mode}:</span>
          <button
            type="button"
            onClick={() => setModeSetting('auto')}
            className={`text-xs font-bold px-3 py-1 rounded-full transition-all ${
              modeSetting === 'auto'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-zinc-600 border border-zinc-200 hover:border-zinc-300 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700'
            }`}
          >
            {t.converter.auto_mode} ({detectedLabel})
          </button>
          <button
            type="button"
            onClick={() => setModeSetting('old-latin')}
            className={`text-xs font-bold px-3 py-1 rounded-full transition-all ${
              modeSetting === 'old-latin'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-zinc-600 border border-zinc-200 hover:border-zinc-300 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700'
            }`}
          >
            {t.converter.old_latin_mode}
          </button>
          <button
            type="button"
            onClick={() => setModeSetting('cyrillic')}
            className={`text-xs font-bold px-3 py-1 rounded-full transition-all ${
              modeSetting === 'cyrillic'
                ? 'bg-orange-600 text-white shadow-sm'
                : 'bg-white text-zinc-600 border border-zinc-200 hover:border-zinc-300 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700'
            }`}
          >
            {t.converter.cyrillic_mode}
          </button>
          <button
            type="button"
            onClick={() => setModeSetting('new-latin')}
            className={`text-xs font-bold px-3 py-1 rounded-full transition-all ${
              modeSetting === 'new-latin'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white text-zinc-600 border border-zinc-200 hover:border-zinc-300 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700'
            }`}
          >
            {t.converter.new_latin_mode ?? 'Yangi → Eski Lotin'}
          </button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <AlphabetMapModal />

          <button
            type="button"
            onClick={() => {
              const firstWord = output.trim() ? output.trim().split(/\s+/)[0] : "she'r"
              openInsight(firstWord)
            }}
            className="inline-flex items-center gap-1.5 rounded-full border border-purple-200 bg-purple-50/80 px-3 py-1 text-xs font-bold text-purple-700 transition-all hover:bg-purple-100 hover:shadow-xs dark:border-purple-900/60 dark:bg-purple-950/40 dark:text-purple-300"
          >
            <Sparkles className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
            {t.converter.word_insight ?? "AI So‘z Tahlili"}
          </button>

          <button
            type="button"
            onClick={() => {
              setAutocorrect(!autocorrect)
              toast.info(autocorrect ? "Imlo avto-tuzatish o'chirildi" : "Imlo avto-tuzatish yoqildi")
            }}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition-all ${
              autocorrect
                ? 'border border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 shadow-xs'
                : 'border border-zinc-200 bg-white text-zinc-500 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400'
            }`}
            title="Foydalanuvchi yo‘l qo‘ygan xatolarni avtomatik to‘g‘rilash (xarakat → harakat, etibor → e'tibor)"
          >
            <Wand2 className={`h-3.5 w-3.5 ${autocorrect ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400'}`} />
            Imlo avto-tuzatish: {autocorrect ? 'Faol' : "O'chiq"}
          </button>

          {output && (
            <button
              onClick={() => setDiffMode(!diffMode)}
              className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold transition-all ${
                diffMode
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-white text-zinc-600 border border-zinc-200 hover:border-zinc-300 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              {t.converter.diff_mode}
            </button>
          )}

          {input && (
            <>
              <button
                onClick={swapText}
                disabled={!output}
                className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold text-zinc-600 transition-colors hover:bg-zinc-200 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 disabled:opacity-40"
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
                {t.converter.swap}
              </button>
              <button
                onClick={() => setInput('')}
                className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold text-zinc-600 transition-colors hover:bg-red-50 hover:text-red-500 dark:text-zinc-400 dark:hover:bg-red-950/30"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {t.converter.clear}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Two-panel editor fluid height fitting */}
      <div className="grid min-h-[440px] md:min-h-[500px] lg:min-h-[calc(100vh-320px)] lg:grid-cols-[1fr_56px_1fr]">

        {/* INPUT */}
        <div className="flex h-full flex-col min-h-[220px]">
          <div className="flex items-center justify-between px-4 pb-2 pt-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-zinc-600 dark:text-zinc-400">{t.converter.asl_matn}</span>
              {input && (
                <div className="flex items-center gap-1 border-l border-zinc-200 pl-2 dark:border-zinc-800">
                  <button onClick={() => changeCase(true)} title={t.converter.uppercase} className="rounded px-1 text-[10px] font-extrabold text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800">
                    <CaseUpper className="w-3 h-3 inline mr-0.5" />
                  </button>
                  <button onClick={() => changeCase(false)} title={t.converter.lowercase} className="rounded px-1 text-[10px] font-extrabold text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800">
                    <CaseLower className="w-3 h-3 inline mr-0.5" />
                  </button>
                  <button onClick={cleanExtraSpaces} title="Bo'sh joylarni tozalash" className="rounded px-1 text-[10px] font-extrabold text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800">
                    <Wand2 className="w-3 h-3 inline mr-0.5 text-blue-500" />
                  </button>
                </div>
              )}
            </div>
            {input && (
              <button
                onClick={() => copy(input, 'in')}
                className="flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
              >
                {copiedInput ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                {copiedInput ? t.converter.copied : t.converter.copy}
              </button>
            )}
          </div>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={t.converter.input_placeholder}
            className="flex-1 resize-none bg-transparent px-4 pb-4 text-base leading-relaxed text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-100 dark:placeholder:text-zinc-600 sm:text-lg overflow-y-auto"
          />
          <div className="flex items-center justify-between border-t border-zinc-100 px-4 py-2.5 text-xs font-bold text-zinc-500 dark:border-zinc-800 dark:text-zinc-600">
            <div className="flex items-center gap-3">
              <span>{input.length} {t.converter.char_count}</span>
              <span>{wordCount(input)} {t.converter.word_count}</span>
            </div>
            {history.length > 0 && !input && (
              <div className="flex items-center gap-1 text-[11px] text-zinc-600 dark:text-zinc-400">
                <History className="w-3 h-3" />
                <span>{t.converter.recent_history}:</span>
                <button
                  onClick={() => setInput(history[0].text)}
                  className="truncate max-w-[120px] font-semibold text-blue-600 hover:underline dark:text-blue-400"
                >
                  "{history[0].text.slice(0, 15)}..."
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Arrow divider */}
        <div className="flex items-center justify-center border-y border-zinc-100 bg-zinc-50/54 py-2.5 dark:border-zinc-800 dark:bg-zinc-900/54 lg:border-x lg:border-y-0">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
            output ? 'bg-blue-600 shadow-sm' : 'bg-zinc-100 dark:bg-zinc-800'
          }`}>
            <ArrowRight className={`h-4 w-4 ${output ? 'text-white' : 'text-zinc-300'}`} />
          </div>
        </div>

        {/* OUTPUT */}
        <div className="flex h-full flex-col bg-blue-50/24 dark:bg-blue-950/12 min-h-[220px]">
          <div className="flex items-center justify-between px-4 pb-2 pt-4">
            <span className="text-xs font-black uppercase tracking-wider text-blue-700 dark:text-blue-400">{t.converter.yangi_matn}</span>
            {output && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={speakText}
                  title="O'qib berish"
                  className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold transition-colors ${
                    speaking ? 'bg-blue-600 text-white animate-pulse' : 'text-zinc-600 hover:bg-white dark:text-zinc-400 dark:hover:bg-zinc-800'
                  }`}
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => copy(output, 'out')}
                  className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold text-zinc-600 transition-colors hover:bg-white hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                >
                  {copiedOutput ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                  {copiedOutput ? t.converter.copied : t.converter.copy}
                </button>
                <button
                  onClick={downloadTxt}
                  className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold text-zinc-600 transition-colors hover:bg-white hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                >
                  <Download className="w-3 h-3" />
                  TXT
                </button>
                <button
                  onClick={downloadDocx}
                  className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold text-blue-600 transition-colors hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900/40"
                >
                  <FileText className="w-3 h-3" />
                  DOCX
                </button>
              </div>
            )}
          </div>
          <div className="flex-1 px-4 pb-4 overflow-y-auto">
            {output ? (
              <div>
                {detectedCorrections.length > 0 && autocorrect && (
                  <div className="mb-3 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/80 px-3 py-2 text-xs font-medium text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200 shadow-xs">
                    <Sparkles className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <span className="font-bold">
                        {detectedCorrections.length} ta imlo xatosi to‘g‘rilandi:{' '}
                      </span>
                      <span className="opacity-90 font-mono text-[11px]">
                        {detectedCorrections.slice(0, 4).map(c => `${c.original} → ${c.corrected}`).join(', ')}
                        {detectedCorrections.length > 4 ? '...' : ''}
                      </span>
                    </div>
                  </div>
                )}
                <p className="cursor-blink whitespace-pre-wrap text-base font-bold leading-relaxed text-blue-800 dark:text-blue-300 sm:text-lg">
                  {renderedInteractiveOutput}
                </p>
                <div className="mt-3 flex items-center gap-2 text-[11px] text-zinc-600 dark:text-zinc-400 font-medium">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                  <span>Har qanday so‘z ustiga bosib, uning ma’nosi va mumtoz/tutuq tahlilini ko‘rishingiz mumkin</span>
                </div>
              </div>
            ) : (
              <p className="text-base font-medium leading-relaxed text-zinc-500 dark:text-zinc-600 sm:text-lg">
                {t.converter.output_placeholder}
              </p>
            )}
          </div>
          <div className="flex items-center justify-between border-t border-zinc-100 px-4 py-2.5 text-xs font-bold text-zinc-500 dark:border-zinc-800 dark:text-zinc-600">
            <div className="flex items-center gap-3">
              <span>{output.length} {t.converter.char_count}</span>
              <span>{wordCount(output)} {t.converter.word_count}</span>
            </div>
            {output && (
              <div className="flex items-center gap-1 text-[11px] text-zinc-500">
                <Clock className="w-3 h-3" />
                <span>~{readingTimeSec} {t.converter.sec} {t.converter.reading_time}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Word Insight Modal */}
      <WordInsightModal
        word={insightWord}
        isOpen={isInsightOpen}
        onClose={() => setIsInsightOpen(false)}
      />
    </div>
  )
}
