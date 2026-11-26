import { prisma } from './prisma'

export type SiteStats = {
  today: { requests: number; pageViews: number; qrScans: number }
  total: { requests: number; pageViews: number; qrScans: number }
  conversions: number
}

function today(): string {
  // Calendar day in Uzbekistan time, e.g. "2026-10-26".
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tashkent' }).format(new Date())
}

/** Count one request; optionally also a page view and/or a QR scan. */
export async function recordHit(opts: { pageView?: boolean; qrScan?: boolean } = {}): Promise<void> {
  const pageViews = opts.pageView ? 1 : 0
  const qrScans = opts.qrScan ? 1 : 0
  await prisma.$executeRaw`
    INSERT INTO "SiteStat" ("day", "requests", "pageViews", "qrScans")
    VALUES (${today()}, 1, ${pageViews}, ${qrScans})
    ON CONFLICT ("day") DO UPDATE SET
      "requests" = "SiteStat"."requests" + 1,
      "pageViews" = "SiteStat"."pageViews" + ${pageViews},
      "qrScans" = "SiteStat"."qrScans" + ${qrScans}
  `
}

/** Count a QR scan without adding a request (the proxy already counted it). */
export async function recordQrScan(): Promise<void> {
  await prisma.$executeRaw`
    INSERT INTO "SiteStat" ("day", "qrScans")
    VALUES (${today()}, 1)
    ON CONFLICT ("day") DO UPDATE SET "qrScans" = "SiteStat"."qrScans" + 1
  `
}

export async function getSiteStats(): Promise<SiteStats> {
  const [todayRow, totals, conversions] = await Promise.all([
    prisma.siteStat.findUnique({ where: { day: today() } }),
    prisma.siteStat.aggregate({ _sum: { requests: true, pageViews: true, qrScans: true } }),
    prisma.conversion.count({ where: { status: 'DONE' } }),
  ])
  return {
    today: {
      requests: todayRow?.requests ?? 0,
      pageViews: todayRow?.pageViews ?? 0,
      qrScans: todayRow?.qrScans ?? 0,
    },
    total: {
      requests: totals._sum.requests ?? 0,
      pageViews: totals._sum.pageViews ?? 0,
      qrScans: totals._sum.qrScans ?? 0,
    },
    conversions,
  }
}
