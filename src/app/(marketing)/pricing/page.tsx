'use client'

import Link from 'next/link'
import { Check, Minus, ArrowRight, HelpCircle } from 'lucide-react'
import { useI18n } from '@/lib/i18n/I18nContext'

export default function PricingPage() {
  const { t } = useI18n()

  const plans = [
    {
      name: t.pricing.free_plan,
      price: '0',
      period: null,
      desc: t.pricing.note_free,
      href: '/sign-up',
      cta: t.pricing.start_btn,
      primary: false,
      features: [
        { label: '10 / mo', ok: true },
        { label: 'Max 5 MB', ok: true },
        { label: 'DOCX · TXT', ok: true },
        { label: 'PDF & OCR', ok: false },
        { label: 'History', ok: false },
        { label: 'API Access', ok: false },
      ],
    },
    {
      name: t.pricing.pro_plan,
      price: '9',
      period: t.pricing.per_month,
      desc: t.pricing.note_pro,
      href: '/sign-up?plan=pro',
      cta: t.pricing.start_pro,
      primary: true,
      features: [
        { label: '500 / mo', ok: true },
        { label: 'Max 50 MB', ok: true },
        { label: 'All formats', ok: true },
        { label: 'PDF & OCR', ok: true },
        { label: '30-day History', ok: true },
        { label: 'API Access', ok: false },
      ],
    },
    {
      name: t.pricing.business_plan,
      price: '29',
      period: t.pricing.per_month,
      desc: t.pricing.note_biz,
      href: '/sign-up?plan=business',
      cta: t.pricing.more,
      primary: false,
      features: [
        { label: 'Unlimited', ok: true },
        { label: 'Max 500 MB', ok: true },
        { label: 'All formats', ok: true },
        { label: 'PDF & OCR', ok: true },
        { label: '1-year History', ok: true },
        { label: 'API Access', ok: true },
      ],
    },
  ]

  const faqList = [
    { q: t.pricing.no_card, a: t.pricing.question_sub },
    { q: t.pricing.faq_title, a: t.pricing.sub },
  ]

  return (
    <div className="landing-surface bg-white dark:bg-zinc-950">

      {/* Header */}
      <section className="relative overflow-hidden px-4 pb-10 pt-14 text-center sm:pt-20 sm:pb-12 lg:pt-24">
        <div className="relative z-10 max-w-3xl mx-auto">
          <p className="mb-4 text-sm font-bold uppercase tracking-widest text-blue-600">{t.pricing.title_tag}</p>
          <h1 className="mb-5 text-4xl font-bold leading-[1.06] tracking-tight text-zinc-900 dark:text-white min-[390px]:text-5xl sm:mb-6 sm:text-7xl">
            {t.pricing.title}
          </h1>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-zinc-600 dark:text-zinc-400 sm:text-2xl">
            {t.pricing.sub}
          </p>
        </div>
      </section>

      {/* Plans */}
      <section className="px-4 pb-14 sm:pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="pricing-grid">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`pricing-card ${plan.primary ? 'pricing-card-primary' : ''}`}
              >
                {plan.primary && (
                  <div className="pricing-ribbon">{t.pricing.popular}</div>
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
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-5xl">{t.pricing.faq_title}</h2>
          </div>

          <div className="pricing-faq">
            {faqList.map(({ q, a }) => (
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
              <p>{t.pricing.still_questions}</p>
              <span>{t.pricing.question_sub}</span>
              <div className="pricing-faq-points">
                <small>{t.pricing.no_card}</small>
                <small>{t.pricing.seconds_30}</small>
                <small>{t.pricing.anytime_upgrade}</small>
              </div>
            </div>
            <Link
              href="/sign-up"
              className="btn-primary shine inline-flex h-12 w-full items-center justify-center gap-2.5 rounded-xl px-6 text-base font-semibold text-white sm:h-14 sm:w-auto sm:px-10 sm:text-lg"
            >
              {t.pricing.start_btn}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
