'use client'

import { useState } from 'react'
import { BookOpen, X } from 'lucide-react'
import { useI18n } from '@/lib/i18n/I18nContext'

const ALPHABET_MAP = [
  { old: "sh / SH", cyr: "ш / Ш", new: "ş / Ş", ex: "şirin, Şarqli" },
  { old: "ch / CH", cyr: "ч / Ч", new: "ç / Ç", ex: "çoy, Çiroq" },
  { old: "o' / O'", cyr: "ў / Ў", new: "ö / Ö", ex: "öroz, Ösish" },
  { old: "g' / G'", cyr: "ғ / Ғ", new: "ğ / Ğ", ex: "ğalla, Ğoz" },
  { old: "e / E", cyr: "э / Э", new: "e / E", ex: "el, E'tibor" },
  { old: "ts / TS", cyr: "ц / Ц", new: "ts / TS", ex: "tsirk, TSex" },
  { old: "yo / YO", cyr: "ё / Ё", new: "yo / YO", ex: "yosh, YOSH" },
  { old: "yu / YU", cyr: "ю / Ю", new: "yu / YU", ex: "yutuq, YUTUQ" },
  { old: "ya / YA", cyr: "я / Я", new: "ya / YA", ex: "yaxshi, YAXSHI" },
]

export default function AlphabetMapModal() {
  const [open, setOpen] = useState(false)
  const { t } = useI18n()

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50/80 px-3 py-1 text-xs font-bold text-blue-700 transition-colors hover:bg-blue-100 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300"
      >
        <BookOpen className="h-3.5 w-3.5" />
        2026 Alifbo Qoidasi
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white font-bold">
                  2026
                </div>
                <h3 className="text-lg font-black text-zinc-950 dark:text-white">
                  Yangi O'zbek Alifbosi Harflari
                </h3>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-full p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto space-y-2 pr-1">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 uppercase font-black">
                    <th className="py-2 px-3">Eski Lotin</th>
                    <th className="py-2 px-3">Kirill</th>
                    <th className="py-2 px-3 text-blue-600 dark:text-blue-400">Yangi 2026</th>
                    <th className="py-2 px-3">Masalan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900 font-medium text-zinc-800 dark:text-zinc-200">
                  {ALPHABET_MAP.map((item, i) => (
                    <tr key={i} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                      <td className="py-2 px-3 font-mono">{item.old}</td>
                      <td className="py-2 px-3 font-mono">{item.cyr}</td>
                      <td className="py-2 px-3 font-black text-blue-600 dark:text-blue-400 font-mono">{item.new}</td>
                      <td className="py-2 px-3 text-zinc-600 dark:text-zinc-400">{item.ex}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
              <button
                onClick={() => setOpen(false)}
                className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-700"
              >
                Tushunarli
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
