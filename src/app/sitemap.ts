import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/seo'
import { SEO_PAGES } from '@/lib/seo-pages'

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()

  return [
    {
      url: SITE_URL,
      lastModified,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${SITE_URL}/pricing`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    ...SEO_PAGES.map((page) => ({
      url: `${SITE_URL}/${page.slug}`,
      lastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.75,
    })),
  ]
}
