'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { convertText, detectMode, type ConversionMode } from '@/lib/converter'
import { Copy, Check, Download, Trash2, ArrowRight, ArrowLeftRight, FileText, Eye, History, Clock, CaseUpper, CaseLower, Volume2, Wand2 } from 'lucide-react'
import { toast } from 'sonner'
import { createDocxFromText } from '@/lib/docx-writer'
import { useI18n } from '@/lib/i18n/I18nContext'
import AlphabetMapModal from '@/components/AlphabetMapModal'

type SelectedMode = 'auto' | 'old-latin' | 'cyrillic'

interface HistoryItem {
  id: string
  text: string
  timestamp: string
}

export default function TextConverter() {
  const { t } = useI18n()
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [modeSetting, setModeSetting] = useState<SelectedMode>('auto')
  const [activeMode, setActiveMode] = useState<ConversionMode>('old-latin')
  const [copiedInput, setCopiedInput] = useState(false)
  const [copiedOutput, setCopiedOutput] = useState(false)
  const [diffMode, setDiffMode] = useState(false)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [speaking, setSpeaking] = useState(false)

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('alifbo_recent_texts')
      if (saved) {
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

  useEffect(() => {
    if (!input.trim()) {
      setOutput('')
      return
    }
    const mode: ConversionMode = modeSetting === 'auto' ? detectMode(input) : modeSetting
    setActiveMode(mode)
    const res = convertText(input, mode)
    setOutput(res)

    const timer = setTimeout(() => {
      saveToHistory(input)
    }, 1200)

    return () => clearTimeout(timer)
  }, [input, modeSetting, saveToHistory])

  const copy = useCallback(async (text: string, side: 'in' | 'out') => {
    await navigator.clipboard.writeText(text)
    if (side === 'in') {
      setCopiedInput(true)
      setTimeout(() => setCopiedInput(false), 1800)
    } else {
      setCopiedOutput(true)
      setTimeout(() => setCopiedOutput(false), 1800)
    }
    toast.success(t.converter.copied)
  }, [t.converter.copied])

  const downloadTxt = useCallback(() => {
    if (!output) return
    const blob = new Blob([output], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'alifbo_matn.txt'
    a.click()
    URL.revokeObjectURL(url)
    toast.success(t.converter.download_txt)
  }, [output, t.converter.download_txt])

  const downloadDocx = useCallback(async () => {
    if (!output) return
    try {
      const docxBuffer = await createDocxFromText(output)
      const blob = new Blob([docxBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'alifbo_hujjat.docx'
      a.click()
      URL.revokeObjectURL(url)
      toast.success(t.converter.download_docx)
    } catch {
      toast.error('DOCX Error')
    }
  }, [output, t.converter.download_docx])

  const swapText = useCallback(() => {
    if (!output) return
    setInput(output)
    toast.success(t.converter.swap)
  }, [output, t.converter.swap])

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
    activeMode === 'cyrillic' ? t.converter.cyrillic_mode : t.converter.old_latin_mode

  const renderedOutput = useMemo(() => {
    if (!diffMode || !output) return null
    const parts = output.split(/([şçöğŞÇÖĞ])/)
    return parts.map((part, idx) => {
      if (/^[şçöğŞÇÖĞ]$/.test(part)) {
        return (
          <mark key={idx} className="rounded bg-amber-200/80 px-1 font-black text-amber-900 dark:bg-amber-500/35 dark:text-amber-200">
            {part}
          </mark>
        )
      }
      return part
    })
  }, [diffMode, output])

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
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <AlphabetMapModal />

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
              <p className="cursor-blink whitespace-pre-wrap text-base font-bold leading-relaxed text-blue-800 dark:text-blue-300 sm:text-lg">
                {diffMode ? renderedOutput : output}
              </p>
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
    </div>
  )
}
