import { NextResponse } from 'next/server'
import { getSiteStats } from '@/lib/site-stats'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const stats = await getSiteStats()
    return NextResponse.json(stats, { headers: { 'Cache-Control': 'no-store' } })
  } catch (err) {
    console.error('[stats]', err)
    return NextResponse.json({ error: 'Statistika mavjud emas' }, { status: 503 })
  }
}
