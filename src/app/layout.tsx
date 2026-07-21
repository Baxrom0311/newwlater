import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from '@/components/ThemeProvider'
import { I18nProvider } from '@/lib/i18n/I18nContext'
import { SEO_KEYWORDS, SITE_NAME, SITE_URL } from '@/lib/seo'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  title: {
    default: "AlifboAI — O'zbek hujjatlarini yangi alifboga o'tkaz",
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "2026-yil yangi o'zbek alifbosi: sh→ş, ch→ç, oʻ→ö, gʻ→ğ. DOCX, PDF, TXT va rasm fayllarini bir zumda konvertatsiya qiling.",
  keywords: SEO_KEYWORDS,
  authors: [{ name: 'Bakhromdev', url: 'https://t.me/bakhromdev' }],
  creator: 'Bakhromdev',
  publisher: SITE_NAME,
  alternates: {
    canonical: '/',
    languages: {
      uz: '/',
      'x-default': '/',
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'uz_UZ',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "AlifboAI — O'zbek alifbo konvertori",
    description: "DOCX, PDF, TXT va rasmlarni yangi 2026 o'zbek alifbosiga o'tkazish xizmati.",
  },
  twitter: {
    card: 'summary',
    title: "AlifboAI — O'zbek alifbo konvertori",
    description: "Kirill va eski lotindagi hujjatlarni yangi o'zbek alifbosiga o'tkazing.",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/dashboard"
      signInForceRedirectUrl="/dashboard"
      signUpForceRedirectUrl="/dashboard"
    >
      <html lang="uz" suppressHydrationWarning>
        <body className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 antialiased transition-colors duration-300" suppressHydrationWarning>
          <ThemeProvider>
            <I18nProvider>
              {children}
              <Toaster position="bottom-right" richColors />
            </I18nProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
