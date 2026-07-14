import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Check, FileText, Zap, ShieldCheck, Globe2, Clock3, Lock } from 'lucide-react'
import LiveDemo from '@/components/LiveDemo'
import AppLogo from '@/components/AppLogo'
import CursorSpotlight from '@/components/CursorSpotlight'
import { SITE_NAME, SITE_URL, jsonLd } from '@/lib/seo'

const FEATURES = [
  { icon: FileText,    accent: 'feature-accent-blue',    title: "DOCX — to'liq formatlash", desc: "Shrift, jadval, rang, sarlavha — hech narsa o'zgarmaydi. Faqat harflar yangilanadi." },
  { icon: Zap,         accent: 'feature-accent-violet',  title: "Ikki yo'nalish",            desc: "Kirill → Yangi lotin va Eski lotin → Yangi lotin. Ikkalasini ham bir tugmada." },
  { icon: ShieldCheck, accent: 'feature-accent-emerald', title: 'PDF va OCR',                 desc: "Skan qilingan hujjatlar va fotosuratlardan ham matnni tanib, o'giradi." },
  { icon: Globe2,      accent: 'feature-accent-amber',   title: "Ko'p format",                desc: 'DOCX · PDF · TXT · MD · CSV · JPG · PNG — barchasi qo\'llab-quvvatlanadi.' },
  { icon: Clock3,      accent: 'feature-accent-sky',     title: 'Soniyalarda tayyor',         desc: "Fayl hajmi qanday bo'lmasin — konversiya tezkor va uzluksiz ishlaydi." },
  { icon: Lock,        accent: 'feature-accent-rose',    title: 'Xavfsiz',                    desc: "Fayllaringiz serverda saqlanmaydi. Konversiyadan so'ng darhol o'chiriladi." },
]

export default function LandingPage() {
  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: SITE_NAME,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    url: SITE_URL,
    description:
      "DOCX, PDF, TXT va rasm fayllarini yangi o'zbek alifbosiga formatni saqlagan holda o'tkazish xizmati.",
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      description: 'Oyiga 10 ta bepul konversiya',
    },
    featureList: [
      "Kirilldan yangi o'zbek lotin alifbosiga o'tkazish",
      "Eski lotindan yangi 2026 alifbosiga o'tkazish",
      'DOCX formatlashni saqlash',
      'PDF va rasm OCR',
      'TXT, MD, CSV fayllarini konvertatsiya qilish',
    ],
  }

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    sameAs: ['https://t.me/bakhromdev'],
  }

  return (
    <div className="landing-surface bg-white dark:bg-zinc-950">
      <CursorSpotlight />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(softwareSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(organizationSchema) }}
      />

      {/* ══ HERO ══════════════════════════════════════════════ */}
      <section className="relative overflow-hidden px-4 pb-16 pt-14 sm:pt-20 sm:pb-20 lg:pt-24 lg:pb-24">
        <div className="hero-doc-cloud" aria-hidden="true">
          <div className="hero-doc-orbit hero-doc-orbit-1">
            <Image className="hero-doc-img" src="/file-icons/word.svg" alt="" width={112} height={112} priority />
          </div>
          <div className="hero-doc-orbit hero-doc-orbit-2">
            <Image className="hero-doc-img" src="/file-icons/pdf-v2.png" alt="" width={112} height={112} priority />
          </div>
          <div className="hero-doc-orbit hero-doc-orbit-3">
            <Image className="hero-doc-img" src="/file-icons/txt-v2.png" alt="" width={112} height={112} priority />
          </div>
        </div>
        <div className="hero-letter-cloud" aria-hidden="true">
          <div className="hero-letter-orbit hero-letter-orbit-1">
            <div className="hero-letter-card"><span>sh</span><strong>ş</strong></div>
          </div>
          <div className="hero-letter-orbit hero-letter-orbit-2">
            <div className="hero-letter-card"><span>ch</span><strong>ç</strong></div>
          </div>
          <div className="hero-letter-orbit hero-letter-orbit-3">
            <div className="hero-letter-card"><span>o'</span><strong>ö</strong></div>
          </div>
          <div className="hero-letter-orbit hero-letter-orbit-4">
            <div className="hero-letter-card"><span>g'</span><strong>ğ</strong></div>
          </div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center">

          {/* Badge */}
          <div className="fade-up inline-flex max-w-full items-center gap-3 rounded-full border border-zinc-200 bg-white px-4 py-2 text-left shadow-sm dark:border-zinc-700 dark:bg-zinc-900 sm:px-6 sm:py-2.5 mb-8 sm:mb-12">
            <span className="relative flex h-3 w-3">
              <span className="ping-slow absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-70" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-blue-600" />
            </span>
            <span className="text-sm sm:text-base font-medium text-zinc-600 dark:text-zinc-300">
              2026-yil yangi O'zbek alifbo qonuni rasmiy kuchga kirdi
            </span>
          </div>

          {/* H1 */}
          <h1 className="fade-up fade-up-1 text-4xl min-[390px]:text-5xl sm:text-7xl lg:text-8xl font-bold text-zinc-900 dark:text-white tracking-tight leading-[1.05] sm:leading-[1.03] mb-6 sm:mb-8">
            Hujjatlarni yangi<br />
            <span className="text-gradient">alifboga o'tkaz</span>
          </h1>

          {/* Sub */}
          <p className="fade-up fade-up-2 text-base min-[390px]:text-lg sm:text-2xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto mb-8 sm:mb-12 leading-relaxed">
            DOCX, PDF, TXT va rasmlar — bir zumda, avtomatik, formatlash saqlanib.
            Kirill va eski latin ikkalasini tushunadi.
          </p>

          {/* CTAs */}
          <div className="fade-up fade-up-3 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-10 sm:mb-16">
            <Link href="/dashboard" className="btn-primary shine inline-flex w-full sm:w-auto items-center justify-center gap-2.5 text-white text-base sm:text-lg font-semibold h-12 sm:h-14 px-6 sm:px-10 rounded-xl">
              Bepul boshlash <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/pricing" className="btn-secondary inline-flex w-full sm:w-auto items-center justify-center gap-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-base sm:text-lg font-medium h-12 sm:h-14 px-6 sm:px-10 rounded-xl">
              Narxlarni ko'rish
            </Link>
          </div>

          {/* Demo */}
          <div className="fade-up fade-up-4">
            <LiveDemo />
          </div>
        </div>
      </section>

      {/* ══ FEATURES ══════════════════════════════════════════ */}
      <section className="relative px-4 py-14 sm:py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-4">Imkoniyatlar</p>
            <h2 className="text-3xl sm:text-5xl font-bold text-zinc-900 dark:text-white tracking-tight">Hamma narsa bir joyda</h2>
            <p className="text-zinc-600 dark:text-zinc-400 mt-4 sm:mt-5 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
              Faqat harflarni almashtirish emas — to'liq professional konversiya xizmati.
            </p>
          </div>
          <div className="feature-grid feature-grid-balanced">
            {FEATURES.map(({ icon: Icon, accent, title, desc }) => (
              <div key={title} className={`feature-tile ${accent}`}>
                <div className="feature-icon">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-3 tracking-tight">{title}</h3>
                <p className="text-base text-zinc-500 dark:text-zinc-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ PRICING TEASER ════════════════════════════════════ */}
      <section className="px-4 py-14 sm:py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-4">Narxlar</p>
            <h2 className="text-3xl sm:text-5xl font-bold text-zinc-900 dark:text-white tracking-tight">Bepul boshlang</h2>
            <p className="text-zinc-600 dark:text-zinc-400 mt-4 sm:mt-5 text-base sm:text-lg">Kredit karta shart emas. Kerak bo'lganda kuchliroq rejaga o'tasiz.</p>
          </div>
          <div className="pricing-grid">
            {[
              { name: 'Bepul',    price: '$0',  period: '',    note: 'Sinab ko‘rish uchun',       items: ['Oyiga 10 ta konversiya', '5 MB gacha fayl', 'DOCX · TXT'],             cta: 'Boshlash',     href: '/sign-up',  primary: false },
              { name: 'Pro',      price: '$9',  period: '/oy',  note: 'Eng yaxshi tanlov',         items: ['Oyiga 500 ta konversiya', '50 MB gacha fayl', 'Barcha format · OCR'],   cta: "Pro boshlash", href: '/pricing',  primary: true  },
              { name: 'Business', price: '$29', period: '/oy',  note: 'Jamoalar va tashkilotlar',  items: ['Cheksiz konversiya', '500 MB gacha fayl', 'API · 1 yillik tarix'],      cta: "Ko'proq",      href: '/pricing',  primary: false },
            ].map(plan => (
              <div key={plan.name} className={`pricing-card ${plan.primary ? 'pricing-card-primary' : ''}`}>
                {plan.primary && (
                  <div className="pricing-ribbon">
                    Mashhur
                  </div>
                )}
                <div className="mb-8">
                  <p className="pricing-note">{plan.note}</p>
                  <h3 className="pricing-name">{plan.name}</h3>
                  <div className="pricing-price">
                    <span>{plan.price}</span>
                    {plan.period && <em>{plan.period}</em>}
                  </div>
                </div>
                <ul className="pricing-list">
                  {plan.items.map(item => (
                    <li key={item}>
                      <span><Check className="w-3.5 h-3.5" /></span>
                      {item}
                    </li>
                  ))}
                </ul>
                <Link href={plan.href} className={`pricing-button ${plan.primary ? 'pricing-button-primary' : ''}`}>
                  {plan.cta}
                  {plan.primary && <ArrowRight className="w-5 h-5" />}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FINAL CTA ═════════════════════════════════════════ */}
      <section className="px-4 py-14 sm:py-[72px]">
        <div className="max-w-5xl mx-auto">
          <div className="final-cta">
            <div className="relative z-10">
              <AppLogo size="xl" className="mx-auto mb-7" />
              <h2 className="text-3xl sm:text-5xl font-bold text-white mb-5 tracking-tight">Hoziroq sinab ko'ring</h2>
              <p className="text-blue-100/90 mb-8 sm:mb-10 text-base sm:text-xl leading-relaxed">
                Ro'yxatdan o'tish 30 soniya.<br />Birinchi 10 ta konversiya mutlaqo bepul.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <Link href="/sign-up" className="btn-primary shine inline-flex w-full sm:w-auto items-center justify-center gap-2.5 text-white text-base sm:text-lg font-semibold h-12 sm:h-14 px-6 sm:px-10 rounded-xl">
                  Bepul boshlash <ArrowRight className="w-5 h-5" />
                </Link>
                <Link href="/pricing" className="inline-flex w-full sm:w-auto items-center justify-center h-12 sm:h-14 px-6 sm:px-10 rounded-xl border border-white/25 text-white/90 hover:text-white hover:border-white/50 text-base sm:text-lg font-medium transition-all bg-white/5">
                  Narxlar
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
