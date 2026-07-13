'use client'

import { useState, useEffect, useCallback } from 'react'
import { convertText, detectMode } from '@/lib/converter'
import { Copy, Check, Download, Trash2, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'

type Mode = 'old-latin' | 'cyrillic'

export default function TextConverter() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [detected, setDetected] = useState<Mode | null>(null)
  const [copiedInput, setCopiedInput] = useState(false)
  const [copiedOutput, setCopiedOutput] = useState(false)

  useEffect(() => {
    if (!input.trim()) {
      setOutput('')
      setDetected(null)
      return
    }
    const mode = detectMode(input)
    setDetected(mode)
    setOutput(convertText(input, mode))
  }, [input])

  const copy = useCallback(async (text: string, side: 'in' | 'out') => {
    await navigator.clipboard.writeText(text)
    if (side === 'in') {
      setCopiedInput(true)
      setTimeout(() => setCopiedInput(false), 1800)
    } else {
      setCopiedOutput(true)
      setTimeout(() => setCopiedOutput(false), 1800)
    }
    toast.success('Nusxalandi')
  }, [])

  const download = useCallback(() => {
    if (!output) return
    const blob = new Blob([output], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'yangi-alifbo.txt'
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Yuklab olindi')
  }, [output])

  const wordCount = (text: string) =>
    text.trim() ? text.trim().split(/\s+/).length : 0

  const detectedLabel =
    detected === 'cyrillic' ? 'Kirill' : detected === 'old-latin' ? 'Eski lotin' : null

  return (
    <div className="overflow-hidden bg-white dark:bg-zinc-950">

      {/* Top bar */}
      <div className="flex flex-col gap-3 border-b border-zinc-100 bg-zinc-50/72 px-5 py-4 dark:border-zinc-800 dark:bg-zinc-900/70 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          {detectedLabel ? (
            <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
              detected === 'cyrillic'
                ? 'bg-orange-50 text-orange-600 border border-orange-100 dark:border-orange-900/60 dark:bg-orange-950/36 dark:text-orange-300'
                : 'bg-blue-50 text-blue-600 border border-blue-100 dark:border-blue-900/60 dark:bg-blue-950/36 dark:text-blue-300'
            }`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              {detectedLabel} aniqlandi
            </span>
          ) : (
            <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Matn kiriting — til avtomatik aniqlanadi</span>
          )}
        </div>
        {input && (
          <button
            onClick={() => setInput('')}
            className="flex w-fit items-center gap-1 rounded-full px-2 py-1 text-xs font-bold text-zinc-600 transition-colors hover:bg-red-50 hover:text-red-500 dark:text-zinc-400 dark:hover:bg-red-950/30"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Tozalash
          </button>
        )}
      </div>

      {/* Two-panel editor */}
      <div className="grid min-h-[360px] lg:min-h-[430px] lg:grid-cols-[1fr_64px_1fr]">

        {/* INPUT */}
        <div className="flex min-h-[220px] flex-col sm:min-h-[260px] lg:min-h-[280px]">
          <div className="flex items-center justify-between px-5 pb-3 pt-5">
            <span className="text-xs font-black uppercase tracking-wider text-zinc-600 dark:text-zinc-400">Asl matn</span>
            {input && (
              <button
                onClick={() => copy(input, 'in')}
                className="flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
              >
                {copiedInput ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                {copiedInput ? 'Nusxalandi' : 'Nusxa'}
              </button>
            )}
          </div>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={"Kirill yoki eski lotin matnini kiriting...\n\nMasalan: shirin choy\nYoki: Шарин чой"}
            className="flex-1 resize-none bg-transparent px-5 pb-5 text-base leading-relaxed text-zinc-900 outline-none placeholder:text-zinc-500 dark:text-zinc-100 dark:placeholder:text-zinc-600 sm:text-lg"
          />
          <div className="flex items-center gap-3 border-t border-zinc-100 px-5 py-3 text-xs font-bold text-zinc-500 dark:border-zinc-800 dark:text-zinc-600">
            <span>{input.length} belgi</span>
            <span>{wordCount(input)} so'z</span>
          </div>
        </div>

        {/* Arrow divider */}
        <div className="flex items-center justify-center border-y border-zinc-100 bg-zinc-50/54 py-3 dark:border-zinc-800 dark:bg-zinc-900/54 lg:border-x lg:border-y-0">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${
            output ? 'bg-blue-600 shadow-sm' : 'bg-zinc-100 dark:bg-zinc-800'
          }`}>
            <ArrowRight className={`h-4 w-4 ${output ? 'text-white' : 'text-zinc-300'}`} />
          </div>
        </div>

        {/* OUTPUT */}
        <div className="flex min-h-[220px] flex-col bg-blue-50/24 dark:bg-blue-950/12 sm:min-h-[260px] lg:min-h-[280px]">
          <div className="flex items-center justify-between px-5 pb-3 pt-5">
            <span className="text-xs font-black uppercase tracking-wider text-blue-700 dark:text-blue-400">Yangi 2026</span>
            {output && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => copy(output, 'out')}
                  className="flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold text-zinc-600 transition-colors hover:bg-white hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                >
                  {copiedOutput ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                  {copiedOutput ? 'Nusxalandi' : 'Nusxa'}
                </button>
                <button
                  onClick={download}
                  className="flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold text-zinc-600 transition-colors hover:bg-white hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                >
                  <Download className="w-3 h-3" />
                  TXT
                </button>
              </div>
            )}
          </div>
          <div className="flex-1 px-5 pb-5">
            {output ? (
              <p className="cursor-blink whitespace-pre-wrap text-base font-bold leading-relaxed text-blue-800 dark:text-blue-300 sm:text-lg">
                {output}
              </p>
            ) : (
              <p className="text-base font-medium leading-relaxed text-zinc-500 dark:text-zinc-600 sm:text-lg">
                Chap tarafga matn kiriting — natija bu yerda chiqadi...
              </p>
            )}
          </div>
          <div className="flex items-center gap-3 border-t border-zinc-100 px-5 py-3 text-xs font-bold text-zinc-500 dark:border-zinc-800 dark:text-zinc-600">
            <span>{output.length} belgi</span>
            <span>{wordCount(output)} so'z</span>
          </div>
        </div>
      </div>
    </div>
  )
}
