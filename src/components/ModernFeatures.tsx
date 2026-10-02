'use client'

import {
  FileText,
  ScanText,
  ArrowLeftRight,
  Layers,
  Sparkles,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Lock,
  Wand2,
} from 'lucide-react'
import { useI18n } from '@/lib/i18n/I18nContext'

export default function ModernFeatures() {
  const { t } = useI18n()

  return (
    <section className="relative px-4 py-16 sm:py-24 overflow-hidden">
      {/* Background ambient decorative blurs */}
      <div className="pointer-events-none absolute -left-20 top-1/4 h-96 w-96 rounded-full bg-blue-400/10 blur-3xl dark:bg-blue-600/10" />
      <div className="pointer-events-none absolute -right-20 bottom-1/4 h-96 w-96 rounded-full bg-purple-400/10 blur-3xl dark:bg-purple-600/10" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-14 sm:mb-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/80 px-4 py-1.5 text-xs sm:text-sm font-bold text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300 mb-4 shadow-xs">
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-pulse" />
            <span>{t.features.title_tag ?? 'Imkoniyatlar'}</span>
          </div>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-zinc-900 dark:text-white tracking-tight leading-tight">
            {t.features.title ?? 'Hamma narsa bir joyda'}
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 mt-4 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
            {t.features.sub ?? "Faqat harflarni almashtirish emas — to'liq professional konversiya va sun'iy intellekt xizmati."}
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">

          {/* ═══ CARD 1: DOCX FORMATLASH (Span 2 on lg) ═══ */}
          <div className="lg:col-span-2 group relative overflow-hidden rounded-3xl border border-zinc-200/90 bg-gradient-to-br from-white via-blue-50/20 to-indigo-50/30 p-7 sm:p-9 shadow-lg shadow-zinc-200/50 transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-2xl hover:shadow-blue-500/10 dark:border-zinc-800 dark:bg-gradient-to-br dark:from-zinc-900 dark:via-zinc-900/90 dark:to-blue-950/20 dark:shadow-none dark:hover:border-blue-700/60">
            {/* Ambient inner glow */}
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-500/10 blur-2xl transition-all group-hover:scale-125" />

            <div className="flex flex-col h-full justify-between gap-6">
              <div>
                <div className="flex items-center justify-between gap-4 mb-5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/30 transition-transform group-hover:scale-110">
                    <FileText className="h-6 w-6" />
                  </div>
                  <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/50 dark:text-blue-300">
                    100% Format Saqlanadi
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight mb-3">
                  {t.features.docx_title ?? "DOCX — to'liq formatlash"}
                </h3>
                <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-xl">
                  {t.features.docx_desc ?? "Shrift, jadval, rang, sarlavha — hech narsa o'zgarmaydi. Faqat harflar yangilanadi."}
                </p>
              </div>

              {/* Interactive Mock Word Document Card */}
              <div className="relative overflow-hidden rounded-2xl border border-blue-200/80 bg-white/90 p-4 sm:p-5 shadow-sm backdrop-blur-md dark:border-zinc-700/80 dark:bg-zinc-950/80">
                {/* Word header bar */}
                <div className="flex items-center justify-between border-b border-zinc-100 pb-3 mb-3 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                    <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
                    <span className="ml-2 font-mono text-[11px] font-bold text-zinc-400">
                      Hujjat_2026.docx
                    </span>
                  </div>
                  <span className="flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Jadvallar va ranglar toza
                  </span>
                </div>

                {/* Mock lines */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                    <span>«O‘zbekiston Respublikasi</span>
                    <mark className="rounded bg-blue-100 px-1 font-bold text-blue-900 dark:bg-blue-950 dark:text-blue-200">
                      Özbekiston
                    </mark>
                    <span>— yangi davr qonuni»</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <span>Keng ko‘lamli</span>
                    <mark className="rounded bg-amber-100 px-1 font-bold text-amber-900 dark:bg-amber-950 dark:text-amber-200">
                      islohotlar
                    </mark>
                    <span>shiddatli</span>
                    <mark className="rounded bg-emerald-100 px-1 font-bold text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
                      sur'atda
                    </mark>
                    <span>amalga oshirilmoqda.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ═══ CARD 2: PDF VA OCR (Sun'iy intellekt skaneri) ═══ */}
          <div className="group relative overflow-hidden rounded-3xl border border-zinc-200/90 bg-gradient-to-br from-white via-emerald-50/20 to-teal-50/30 p-7 sm:p-9 shadow-lg shadow-zinc-200/50 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-2xl hover:shadow-emerald-500/10 dark:border-zinc-800 dark:bg-gradient-to-br dark:from-zinc-900 dark:via-zinc-900/90 dark:to-emerald-950/20 dark:shadow-none dark:hover:border-emerald-700/60">
            <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-emerald-500/10 blur-2xl transition-all group-hover:scale-125" />

            <div className="flex flex-col h-full justify-between gap-6">
              <div>
                <div className="flex items-center justify-between gap-4 mb-5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-500/30 transition-transform group-hover:scale-110">
                    <ScanText className="h-6 w-6" />
                  </div>
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/50 dark:text-emerald-300">
                    AI OCR Vision
                  </span>
                </div>

                <h3 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight mb-3">
                  {t.features.ocr_title ?? "PDF va OCR"}
                </h3>
                <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {t.features.ocr_desc ?? "Skan qilingan hujjatlar va fotosuratlardan ham matnni tanib, o'giradi."}
                </p>
              </div>

              {/* Animated Scanner Visual */}
              <div className="relative overflow-hidden rounded-2xl border border-emerald-200/80 bg-zinc-900 p-4 text-white shadow-inner">
                {/* Laser scan line */}
                <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#34d399] animate-pulse" />
                <div className="flex items-center justify-between text-xs font-mono text-emerald-400 pb-2 border-b border-zinc-800">
                  <span>[SKANERLASH: AKTIV]</span>
                  <span className="animate-pulse">99.8%</span>
                </div>
                <div className="pt-2 text-xs font-mono text-zinc-300 space-y-1">
                  <p className="truncate">» Tasvir aniqlandi (300 DPI)</p>
                  <p className="text-emerald-400 truncate">» Yangi alifboga o'tkazildi: 100%</p>
                </div>
              </div>
            </div>
          </div>

          {/* ═══ CARD 3: IKKI TOMONLAMA KONVERSIYA ═══ */}
          <div className="group relative overflow-hidden rounded-3xl border border-zinc-200/90 bg-gradient-to-br from-white via-purple-50/20 to-pink-50/30 p-7 sm:p-9 shadow-lg shadow-zinc-200/50 transition-all duration-300 hover:-translate-y-1 hover:border-purple-300 hover:shadow-2xl hover:shadow-purple-500/10 dark:border-zinc-800 dark:bg-gradient-to-br dark:from-zinc-900 dark:via-zinc-900/90 dark:to-purple-950/20 dark:shadow-none dark:hover:border-purple-700/60">
            <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-purple-500/10 blur-2xl transition-all group-hover:scale-125" />

            <div className="flex flex-col h-full justify-between gap-6">
              <div>
                <div className="flex items-center justify-between gap-4 mb-5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-600 text-white shadow-md shadow-purple-500/30 transition-transform group-hover:scale-110">
                    <ArrowLeftRight className="h-6 w-6" />
                  </div>
                  <span className="rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-xs font-bold text-purple-700 dark:border-purple-900/50 dark:bg-purple-950/50 dark:text-purple-300">
                    Swap / Teskari
                  </span>
                </div>

                <h3 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight mb-3">
                  {t.features.dirs_title ?? "Ikki yo'nalish"}
                </h3>
                <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {t.features.dirs_desc ?? "Kirill → Yangi lotin va Eski lotin → Yangi lotin. Ikkalasini ham bir tugmada."}
                </p>
              </div>

              {/* Interactive Bidirectional Pill Switcher */}
              <div className="rounded-2xl border border-purple-200/80 bg-white/80 p-3 shadow-xs dark:border-zinc-700 dark:bg-zinc-950/80">
                <div className="grid grid-cols-2 gap-2 text-center text-xs font-bold">
                  <div className="rounded-xl bg-purple-100 p-2 text-purple-900 dark:bg-purple-950 dark:text-purple-200">
                    <span>Кирилл / Eski</span>
                    <p className="text-[11px] font-mono text-purple-600 dark:text-purple-400">Шаҳар, чой</p>
                  </div>
                  <div className="rounded-xl bg-purple-600 p-2 text-white shadow-sm">
                    <span>2026 Yangi</span>
                    <p className="text-[11px] font-mono text-purple-100">Şahar, çoy</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ═══ CARD 4: BARCHA FORMATLAR (9+ FORMAT) ═══ */}
          <div className="group relative overflow-hidden rounded-3xl border border-zinc-200/90 bg-gradient-to-br from-white via-amber-50/20 to-orange-50/30 p-7 sm:p-9 shadow-lg shadow-zinc-200/50 transition-all duration-300 hover:-translate-y-1 hover:border-amber-300 hover:shadow-2xl hover:shadow-amber-500/10 dark:border-zinc-800 dark:bg-gradient-to-br dark:from-zinc-900 dark:via-zinc-900/90 dark:to-amber-950/20 dark:shadow-none dark:hover:border-amber-700/60">
            <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-amber-500/10 blur-2xl transition-all group-hover:scale-125" />

            <div className="flex flex-col h-full justify-between gap-6">
              <div>
                <div className="flex items-center justify-between gap-4 mb-5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-600 text-white shadow-md shadow-amber-500/30 transition-transform group-hover:scale-110">
                    <Layers className="h-6 w-6" />
                  </div>
                  <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/50 dark:text-amber-300">
                    9+ Format
                  </span>
                </div>

                <h3 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight mb-3">
                  {t.features.formats_title ?? "Ko'p format"}
                </h3>
                <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {t.features.formats_desc ?? "DOCX · PPTX · XLSX · PDF · TXT · MD · CSV · JPG · PNG — barchasi qo'llab-quvvatlanadi."}
                </p>
              </div>

              {/* Grid of File Pills */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs font-extrabold">
                <div className="rounded-xl border border-blue-200 bg-blue-50/80 p-2 text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300">
                  DOCX
                </div>
                <div className="rounded-xl border border-orange-200 bg-orange-50/80 p-2 text-orange-700 dark:border-orange-900 dark:bg-orange-950/40 dark:text-orange-300">
                  PPTX
                </div>
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-2 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
                  XLSX
                </div>
                <div className="rounded-xl border border-red-200 bg-red-50/80 p-2 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
                  PDF
                </div>
                <div className="rounded-xl border border-zinc-200 bg-zinc-100 p-2 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                  TXT / MD
                </div>
                <div className="rounded-xl border border-purple-200 bg-purple-50/80 p-2 text-purple-700 dark:border-purple-900 dark:bg-purple-950/40 dark:text-purple-300">
                  OCR / JPG
                </div>
              </div>
            </div>
          </div>

          {/* ═══ CARD 5: AI IMLO & MUMTOZ LUG'AT ═══ */}
          <div className="group relative overflow-hidden rounded-3xl border border-zinc-200/90 bg-gradient-to-br from-white via-violet-50/20 to-indigo-50/30 p-7 sm:p-9 shadow-lg shadow-zinc-200/50 transition-all duration-300 hover:-translate-y-1 hover:border-violet-300 hover:shadow-2xl hover:shadow-violet-500/10 dark:border-zinc-800 dark:bg-gradient-to-br dark:from-zinc-900 dark:via-zinc-900/90 dark:to-violet-950/20 dark:shadow-none dark:hover:border-violet-700/60">
            <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-violet-500/10 blur-2xl transition-all group-hover:scale-125" />

            <div className="flex flex-col h-full justify-between gap-6">
              <div>
                <div className="flex items-center justify-between gap-4 mb-5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-md shadow-violet-500/30 transition-transform group-hover:scale-110">
                    <Wand2 className="h-6 w-6" />
                  </div>
                  <span className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-bold text-violet-700 dark:border-violet-900/50 dark:bg-violet-950/50 dark:text-violet-300">
                    AI Izohli Lug‘at
                  </span>
                </div>

                <h3 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight mb-3">
                  AI Imlo & Mumtoz So‘zlar
                </h3>
                <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Xato yozilgan so‘zlarni avtomatik to‘g‘rilaydi, tutuq belgilarini tekshiradi va Navoiy davri so‘zlarini sharhlaydi.
                </p>
              </div>

              {/* Interactive Chips Showcase */}
              <div className="space-y-2 rounded-2xl border border-violet-200/80 bg-white/90 p-3 shadow-xs dark:border-zinc-700 dark:bg-zinc-950/80">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-500">Imlo to‘g‘rilash:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">xarakat ➔ harakat</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-500">Tutuq belgisi:</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">she'r ⚡ sher</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-500">Mumtoz tahlil:</span>
                  <span className="font-bold text-purple-600 dark:text-purple-400">istig'no 📜</span>
                </div>
              </div>
            </div>
          </div>

          {/* ═══ CARD 6: CHAOMOQ TEZLIGI & 100% XAVFSIZ (Span 2 on lg if desired or 1) ═══ */}
          <div className="group relative overflow-hidden rounded-3xl border border-zinc-200/90 bg-gradient-to-br from-white via-rose-50/20 to-sky-50/30 p-7 sm:p-9 shadow-lg shadow-zinc-200/50 transition-all duration-300 hover:-translate-y-1 hover:border-rose-300 hover:shadow-2xl hover:shadow-rose-500/10 dark:border-zinc-800 dark:bg-gradient-to-br dark:from-zinc-900 dark:via-zinc-900/90 dark:to-rose-950/20 dark:shadow-none dark:hover:border-rose-700/60">
            <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-rose-500/10 blur-2xl transition-all group-hover:scale-125" />

            <div className="flex flex-col h-full justify-between gap-6">
              <div>
                <div className="flex items-center justify-between gap-4 mb-5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-600 text-white shadow-md shadow-rose-500/30 transition-transform group-hover:scale-110">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <span className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/50 dark:text-rose-300">
                    256-bit SSL · Maxfiy
                  </span>
                </div>

                <h3 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight mb-3">
                  {t.features.speed_title ?? "Soniyalarda tayyor"} & {t.features.sec_title ?? "Xavfsiz"}
                </h3>
                <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {t.features.sec_desc ?? "Fayllaringiz serverda saqlanmaydi. Konversiyadan so'ng darhol o'chiriladi."}
                </p>
              </div>

              {/* Speed + Security status bar */}
              <div className="flex items-center justify-between rounded-2xl border border-rose-200/80 bg-white/90 p-3 text-xs shadow-xs dark:border-zinc-700 dark:bg-zinc-950/80">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-500 animate-bounce" />
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">~0.2 soniyada</span>
                </div>
                <div className="flex items-center gap-1 text-emerald-600 font-bold dark:text-emerald-400">
                  <Lock className="h-3.5 w-3.5" />
                  <span>Avto-o'chirish faol</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
