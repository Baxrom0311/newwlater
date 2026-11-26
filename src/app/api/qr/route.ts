import { NextRequest, NextResponse } from 'next/server'
import QRCode from 'qrcode'

// SVG QR code pointing at /qr (which counts the scan). ?download=1 saves it.
export async function GET(req: NextRequest) {
  const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host')
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? (host ? `https://${host}` : req.nextUrl.origin)
  const svg = await QRCode.toString(new URL('/qr', origin).toString(), {
    type: 'svg',
    errorCorrectionLevel: 'M',
    margin: 1,
    color: { dark: '#09090b', light: '#ffffff' },
  })

  const headers: Record<string, string> = {
    'Content-Type': 'image/svg+xml',
    'Cache-Control': 'public, max-age=86400',
  }
  if (req.nextUrl.searchParams.has('download')) {
    headers['Content-Disposition'] = 'attachment; filename="alifboai-qr.svg"'
  }
  return new NextResponse(svg, { headers })
}
