import Link from 'next/link'
import type { Metadata } from 'next'
import { Check, Minus, ArrowRight, HelpCircle } from 'lucide-react'
import { SITE_URL, jsonLd } from '@/lib/seo'

export const metadata: Metadata = {
  title: "Narxlar — O'zbek alifbo konvertori",
  description:
    "AlifboAI narxlari: bepul, Pro va Business rejalar. DOCX, PDF, TXT, rasm OCR va yangi o'zbek alifbosiga konvertatsiya.",
  alternates: {
    canonical: '/pricing',
  },
  openGraph: {
    title: "AlifboAI narxlari",
    description: "Bepul boshlang, kerak bo'lganda Pro yoki Business rejaga o'ting.",
    url: `${SITE_URL}/pricing`,
  },
}

const PLANS = [
  {
    name: 'Bepul',
    price: '0',
    period: null,
    desc: "Sinab ko'rish uchun",
    href: '/sign-up',
    cta: 'Bepul boshlash',
    primary: false,
    features: [
      { label: 'Oyiga 10 konversiya', ok: true },
      { label: 'Max fayl hajmi 5 MB', ok: true },
      { label: 'DOCX va TXT', ok: true },
      { label: 'PDF va Rasm (OCR)', ok: false },
      { label: 'Konversiya tarixi', ok: false },
      { label: 'API kirish', ok: false },
    ],
  },
  {
    name: 'Pro',
    price: '9',
    period: '/oy',
    desc: 'Jiddiy foydalanish uchun',
    href: '/sign-up?plan=pro',
    cta: "Pro boshlash",
    primary: true,
    features: [
      { label: 'Oyiga 500 konversiya', ok: true },
      { label: 'Max fayl hajmi 50 MB', ok: true },
      { label: 'Barcha formatlar', ok: true },
      { label: 'PDF va Rasm (OCR)', ok: true },
      { label: '30 kunlik tarix', ok: true },
      { label: 'API kirish', ok: false },
    ],
  },
  {
    name: 'Business',
    price: '29',
    period: '/oy',
    desc: 'Tashkilotlar uchun',
    href: '/sign-up?plan=business',
    cta: 'Business boshlash',
    primary: false,
    features: [
      { label: 'Cheksiz konversiya', ok: true },
      { label: 'Max fayl hajmi 500 MB', ok: true },
      { label: 'Barcha formatlar', ok: true },
      { label: 'PDF va Rasm (OCR)', ok: true },
      { label: '1 yillik tarix', ok: true },
      { label: 'API kirish', ok: true },
    ],
  },
]

const FAQ = [
  {
    q: "Kredit karta kerakmi?",
    a: "Yo'q. Bepul plan uchun hech qanday to'lov ma'lumoti shart emas.",
  },
  {
    q: "Limit qachon yangilanadi?",
    a: "Har oyning 1-sanasida avtomatik tiklanadi.",
  },
  {
    q: "To'lov usuli qanday?",
    a: "Stripe orqali xalqaro kredit va debet kartalar qabul qilinadi.",
  },
  {
    q: "Bekor qilsam nima bo'ladi?",
    a: "Davr tugaguncha Pro ishlayveradi. So'ng avtomatik Bepulga o'tiladi.",
  },
  {
    q: "Fayllarim saqlanadimi?",
    a: "Yo'q. Konversiyadan so'ng fayllar darhol o'chiriladi. Faqat metadata saqlanadi.",
  },
]

export default function PricingPage() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: a,
      },
    })),
  }

  return (
    <div className="landing-surface bg-white dark:bg-zinc-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(faqSchema) }}
      />

      {/* Header */}
      <section className="relative overflow-hidden px-4 pb-10 pt-14 text-center sm:pt-20 sm:pb-12 lg:pt-24">
        <div className="relative z-10 max-w-3xl mx-auto">
          <p className="mb-4 text-sm font-bold uppercase tracking-widest text-blue-600">Narxlar</p>
          <h1 className="mb-5 text-4xl font-bold leading-[1.06] tracking-tight text-zinc-900 dark:text-white min-[390px]:text-5xl sm:mb-6 sm:text-7xl">
            Bepul boshlang,<br />
            <span className="text-gradient">kerak bo'lganda o'sing</span>
          </h1>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-zinc-600 dark:text-zinc-400 sm:text-2xl">
            Kredit karta kerak emas. Avval sinab ko'ring, keyin ko'proq hujjatlar uchun Pro yoki Business tanlang.
          </p>
        </div>
      </section>

      {/* Plans */}
      <section className="px-4 pb-14 sm:pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="pricing-grid">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`pricing-card ${plan.primary ? 'pricing-card-primary' : ''}`}
              >
                {plan.primary && (
                  <div className="pricing-ribbon">Mashhur tanlov</div>
                )}

                <div className="mb-8">
                  <p className="pricing-note">{plan.desc}</p>
                  <h2 className="pricing-name">{plan.name}</h2>
                  <div className="pricing-price">
                    <span>${plan.price}</span>
                    {plan.period && <em>{plan.period}</em>}
                  </div>
                </div>

                <ul className="pricing-list">
                  {plan.features.map(({ label, ok }) => (
                    <li key={label} className={!ok ? 'pricing-muted' : undefined}>
                      {ok
                        ? <span><Check className="w-3.5 h-3.5" /></span>
                        : <span><Minus className="w-3.5 h-3.5" /></span>
                      }
                      {label}
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.href}
                  className={`pricing-button ${plan.primary ? 'pricing-button-primary' : ''}`}
                >
                  {plan.cta}
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 py-14 sm:py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="mb-4 text-sm font-bold uppercase tracking-widest text-blue-600">FAQ</p>
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-5xl">Ko'p so'raladigan savollar</h2>
          </div>

          <div className="pricing-faq">
            {FAQ.map(({ q, a }) => (
              <div key={q} className="pricing-faq-item">
                <div className="pricing-faq-icon">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <p>{q}</p>
                  <span>{a}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="pricing-faq-cta">
            <div>
              <p>Hali ham savol bormi?</p>
              <span>Avval bepul boshlang. 10 ta konversiyani sinab ko'ring, keyin kerak bo'lsa Pro rejaga o'tasiz.</span>
              <div className="pricing-faq-points">
                <small>Karta shart emas</small>
                <small>30 soniyada tayyor</small>
                <small>Istalgan payt upgrade</small>
              </div>
            </div>
            <Link
              href="/sign-up"
              className="btn-primary shine inline-flex h-12 w-full items-center justify-center gap-2.5 rounded-xl px-6 text-base font-semibold text-white sm:h-14 sm:w-auto sm:px-10 sm:text-lg"
            >
              Bepul boshlash
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
