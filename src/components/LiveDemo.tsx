'use client'

import { useState, useEffect, useRef } from 'react'
import { convertText, detectMode } from '@/lib/converter'
import { Copy, Check, Sparkles, Languages } from 'lucide-react'

const EXAMPLES = [
  { label: 'Lotin',  text: "shirin choy va g'alla non yedi" },
  { label: 'Lotin',  text: "O'zbekiston — go'zal va obod yurt" },
  { label: 'Kirill', text: "Шарқий Ўзбекистон ғаройиб жой" },
  { label: 'Kirill', text: "Чойхона, шаҳар, кўча ва боғ" },
]

export default function LiveDemo() {
  const [input, setInput]       = useState(EXAMPLES[0].text)
  const [output, setOutput]     = useState('')
  const [detected, setDetected] = useState<'old-latin' | 'cyrillic'>('old-latin')
  const [exIdx, setExIdx]       = useState(0)
  const [copied, setCopied]     = useState(false)
  const [active, setActive]     = useState(false)
  const intervalRef             = useRef<ReturnType<typeof setInterval>>(null)

  useEffect(() => {
    if (!input.trim()) { setOutput(''); setActive(false); return }
    const mode = detectMode(input)
    setDetected(mode)
    setOutput(convertText(input, mode))
    setActive(true)
  }, [input])

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setExIdx(prev => {
        const next = (prev + 1) % EXAMPLES.length
        setInput(EXAMPLES[next].text)
        return next
      })
    }, 3800)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [])

  const handleInput = (val: string) => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setInput(val)
  }

  const copyOutput = async () => {
    if (!output) return
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  const isCyrillic = detected === 'cyrillic'

  return (
    <div className="w-full max-w-4xl mx-auto">

      {/* Example tabs */}
      <div className="-mx-4 mb-5 flex items-center justify-start gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:mb-7 sm:justify-center sm:gap-3 sm:overflow-visible sm:px-0 sm:pb-0">
        {EXAMPLES.map((ex, i) => (
          <button
            key={i}
            onClick={() => handleInput(ex.text)}
            className={`shrink-0 text-sm sm:text-base px-4 sm:px-5 py-2 sm:py-2.5 rounded-full font-semibold transition-all duration-200 border ${
              input === ex.text
                ? ex.label === 'Kirill'
                  ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                  : 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
            }`}
          >
            {ex.label} {i + 1}
          </button>
        ))}
      </div>

      {/* Main card */}
      <div className="relative overflow-hidden rounded-[24px] border border-zinc-200 shadow-[0_18px_48px_rgba(0,0,0,0.10)] dark:border-zinc-700/80 dark:shadow-[0_20px_60px_rgba(0,0,0,0.5)] sm:rounded-3xl">

        {/* Glowing border animation when active */}
        {active && (
          <div className="absolute inset-0 rounded-[24px] sm:rounded-3xl pointer-events-none z-20"
            style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.12), transparent 50%, rgba(99,102,241,0.08))', }} />
        )}

        <div className="grid md:grid-cols-2">

          {/* ── INPUT ──────────────────────────────────── */}
          <div className="bg-white dark:bg-zinc-900 p-5 sm:p-8 lg:p-10 flex flex-col min-h-[260px] sm:min-h-[320px] lg:min-h-[340px]">

            {/* Header */}
            <div className="flex items-center gap-3 mb-5 sm:gap-3.5 sm:mb-7">
              <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center ${
                isCyrillic ? 'bg-orange-100 dark:bg-orange-950' : 'bg-zinc-100 dark:bg-zinc-800'
              }`}>
                <Languages className={`w-5 h-5 ${isCyrillic ? 'text-orange-600' : 'text-zinc-500 dark:text-zinc-400'}`} />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-widest leading-none">Asl matn</p>
                {active && (
                  <p className={`text-sm mt-1.5 font-medium ${isCyrillic ? 'text-orange-500' : 'text-blue-500'}`}>
                    {isCyrillic ? 'Kirill' : 'Eski lotin'}
                  </p>
                )}
              </div>
            </div>

            {/* Textarea */}
            <textarea
              value={input}
              onChange={e => handleInput(e.target.value)}
              rows={4}
              placeholder={"Kirill yoki eski lotin\nmatnini kiriting..."}
              className="flex-1 text-lg sm:text-2xl text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-600 bg-transparent resize-none outline-none leading-relaxed font-medium"
            />

            {/* Footer */}
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <span className="text-sm sm:text-base text-zinc-500 dark:text-zinc-600 tabular-nums">{input.length} belgi</span>
            </div>
          </div>

          <div className="flex items-center justify-center border-y border-zinc-100 bg-zinc-50 py-3 dark:border-zinc-800 dark:bg-zinc-900/60 md:hidden">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-all duration-500 ${
              active
                ? 'bg-gradient-to-br from-blue-600 to-indigo-600'
                : 'bg-zinc-200 dark:bg-zinc-700'
            }`}>
              <Sparkles className={`w-5 h-5 transition-colors duration-300 ${active ? 'text-white' : 'text-zinc-400'}`} />
            </div>
          </div>

          {/* ── DIVIDER ─────────────────────────────────── */}
          <div className="absolute left-1/2 top-1/2 z-10 hidden -translate-x-1/2 -translate-y-1/2 md:block">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-500 ${
              active
                ? 'bg-gradient-to-br from-blue-600 to-indigo-600 scale-110'
                : 'bg-zinc-200 dark:bg-zinc-700 scale-100'
            }`}>
              <Sparkles className={`w-6 h-6 transition-colors duration-300 ${active ? 'text-white' : 'text-zinc-400'}`} />
            </div>
          </div>

          {/* ── OUTPUT ──────────────────────────────────── */}
          <div className={`relative p-5 sm:p-8 lg:p-10 flex flex-col min-h-[260px] sm:min-h-[320px] lg:min-h-[340px] transition-colors duration-300 ${
            active
              ? 'bg-gradient-to-br from-blue-50 to-indigo-50/50 dark:from-blue-950/40 dark:to-indigo-950/20'
              : 'bg-zinc-50/50 dark:bg-zinc-800/30'
          } md:border-l md:border-zinc-200/70 md:dark:border-zinc-800`}>

            {/* Header */}
            <div className="flex flex-col gap-3 mb-5 sm:mb-7 min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between">
              <div className="flex items-center gap-3 sm:gap-3.5">
                <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center transition-colors duration-300 ${
                  active ? 'bg-blue-100 dark:bg-blue-900' : 'bg-zinc-100 dark:bg-zinc-800'
                }`}>
                  <span className={`text-2xl font-bold leading-none transition-colors duration-300 ${active ? 'text-blue-600' : 'text-zinc-400'}`}>Ö</span>
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-bold text-blue-500 dark:text-blue-500 uppercase tracking-widest leading-none">Yangi 2026</p>
                  {active && <p className="text-sm mt-1.5 font-medium text-blue-500">O'zbek yangi alifbo</p>}
                </div>
              </div>

              {output && (
                <button
                  onClick={copyOutput}
                  className="flex w-fit items-center gap-2 text-sm sm:text-base px-3 sm:px-4 py-2 rounded-lg border transition-all duration-200 border-blue-200 dark:border-blue-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:border-zinc-300 dark:hover:border-zinc-600"
                >
                  {copied
                    ? <><Check className="w-4 h-4 text-green-500" /> Nusxalandi</>
                    : <><Copy className="w-4 h-4" /> Nusxa</>
                  }
                </button>
              )}
            </div>

            {/* Result */}
            <div className="flex-1">
              {output ? (
                <p className="text-lg sm:text-2xl font-semibold text-blue-700 dark:text-blue-300 leading-relaxed cursor-blink">
                  {output}
                </p>
              ) : (
                <p className="text-lg sm:text-2xl text-zinc-500 dark:text-zinc-600 leading-relaxed">
                  Natija bu yerda chiqadi...
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-blue-100/60 dark:border-zinc-700">
              <span className="text-sm sm:text-base text-zinc-500 dark:text-zinc-600 tabular-nums">{output.length} belgi</span>
            </div>
          </div>

        </div>
      </div>

      {/* Hint */}
      <p className="text-center text-sm sm:text-lg text-zinc-500 dark:text-zinc-500 mt-5 sm:mt-7 px-2">
        O'zingizning matnizni yozing — Kirill va lotin ikkalasini tushunadi
      </p>
    </div>
  )
}
