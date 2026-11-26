import { NextRequest, NextResponse } from 'next/server'
import { recordQrScan } from '@/lib/site-stats'

export const dynamic = 'force-dynamic'

// Target of the printed QR code: count the scan, then send the visitor home.
export async function GET(req: NextRequest) {
  await recordQrScan().catch((err) => console.error('[qr] stat', err))
  const res = NextResponse.redirect(new URL('/?ref=qr', appOrigin(req)), 302)
  res.headers.set('Cache-Control', 'no-store')
  return res
}

function appOrigin(req: NextRequest): string {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL
  const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host')
  return host ? `https://${host}` : req.nextUrl.origin
}
