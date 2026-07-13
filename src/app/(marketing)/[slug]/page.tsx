import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { jsonLd, SITE_NAME, SITE_URL } from '@/lib/seo'
import { getSeoPage, SEO_PAGES, seoPageMetadata } from '@/lib/seo-pages'

type Props = {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return SEO_PAGES.map((page) => ({ slug: page.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  return seoPageMetadata(slug)
}

export default async function SeoLandingPage({ params }: Props) {
  const { slug } = await params
  const page = getSeoPage(slug)

  if (!page) notFound()

  const Icon = page.icon
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: page.faq.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: a,
      },
    })),
  }
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: SITE_NAME,
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: page.eyebrow,
        item: `${SITE_URL}/${page.slug}`,
      },
    ],
  }

  return (
    <div className="landing-surface bg-white dark:bg-zinc-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbSchema) }}
      />

      <section className="px-4 py-14 sm:py-20">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
              <Icon className="h-7 w-7" />
            </div>
            <p className="mb-4 text-sm font-bold uppercase tracking-widest text-blue-600">
              {page.eyebrow}
            </p>
            <h1 className="max-w-3xl text-4xl font-bold leading-[1.06] tracking-tight text-zinc-900 dark:text-white sm:text-6xl">
              {page.title}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-zinc-600 dark:text-zinc-400 sm:text-xl">
              {page.intro}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/dashboard"
                className="btn-primary shine inline-flex h-12 items-center justify-center gap-2.5 rounded-xl px-7 text-base font-semibold text-white sm:h-14 sm:text-lg"
              >
                Bepul sinab ko'rish
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/pricing"
                className="btn-secondary inline-flex h-12 items-center justify-center rounded-xl border border-zinc-200 bg-white px-7 text-base font-medium text-zinc-700 transition-all dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 sm:h-14 sm:text-lg"
              >
                Narxlarni ko'rish
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-xl shadow-zinc-200/60 dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-black/20 sm:p-8">
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Nima uchun kerak?
            </h2>
            <div className="mt-6 space-y-4">
              {page.bullets.map((item) => (
                <div key={item} className="flex gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
                  <p className="text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
                    {item}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-8 rounded-2xl bg-zinc-50 p-5 dark:bg-zinc-950">
              <p className="text-sm font-semibold uppercase tracking-widest text-zinc-500">
                Qidiruv so'zlari
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {page.keywords.map((keyword) => (
                  <span
                    key={keyword}
                    className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-16 sm:pb-24">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 text-center">
            <p className="mb-3 text-sm font-bold uppercase tracking-widest text-blue-600">FAQ</p>
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-5xl">
              Ko'p so'raladigan savollar
            </h2>
          </div>
          <div className="grid gap-4">
            {page.faq.map(({ q, a }) => (
              <div
                key={q}
                className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">{q}</h3>
                <p className="mt-2 leading-relaxed text-zinc-600 dark:text-zinc-400">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
