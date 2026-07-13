import Navbar from '@/components/Navbar'
import AppLogo from '@/components/AppLogo'
import MobileBottomNav from '@/components/MobileBottomNav'
import { SEO_PAGES } from '@/lib/seo-pages'

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pb-24 md:pb-0">{children}</main>
      <MobileBottomNav />

      <footer className="border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <div className="max-w-5xl mx-auto px-5 py-10">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-8">

            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <AppLogo size="sm" showWordmark />
              </div>
              <p className="text-sm text-zinc-400 dark:text-zinc-500 max-w-xs leading-relaxed">
                O'zbek hujjatlarini 2026-yil yangi alifbosiga o'tkazish platformasi.
              </p>
            </div>

            <div className="grid gap-8 sm:grid-cols-3 sm:gap-10">
              <div>
                <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-3">Mahsulot</p>
                <ul className="space-y-2.5">
                  {[
                    { href: '/dashboard', label: 'Dashboard' },
                    { href: '/pricing', label: 'Narxlar' },
                    { href: '/history', label: 'Tarix' },
                  ].map(({ href, label }) => (
                    <li key={href}>
                      <a href={href} className="text-sm text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors">
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-3">Yo'nalishlar</p>
                <ul className="space-y-2.5">
                  {SEO_PAGES.map(({ slug, eyebrow }) => (
                    <li key={slug}>
                      <a href={`/${slug}`} className="text-sm text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors">
                        {eyebrow}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-3">Huquqiy</p>
                <ul className="space-y-2.5">
                  {['Maxfiylik', 'Shartlar'].map(label => (
                    <li key={label}>
                      <a href="#" className="text-sm text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors">
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-8 border-t border-zinc-100 pt-5 text-sm text-zinc-400 dark:border-zinc-800 dark:text-zinc-500">
            created by{' '}
            <a
              href="https://t.me/bakhromdev"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-zinc-700 transition-colors hover:text-blue-600 dark:text-zinc-300 dark:hover:text-blue-400"
            >
              Bakhromdev
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
