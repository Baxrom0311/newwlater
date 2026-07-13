import { NextRequest, NextResponse } from 'next/server'
import { Webhook } from 'svix'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const secret = process.env.CLERK_WEBHOOK_SECRET
  if (!secret) return NextResponse.json({ error: 'No secret' }, { status: 500 })

  const payload = await req.text()
  const headers = {
    'svix-id': req.headers.get('svix-id') ?? '',
    'svix-timestamp': req.headers.get('svix-timestamp') ?? '',
    'svix-signature': req.headers.get('svix-signature') ?? '',
  }

  let event: { type: string; data: Record<string, unknown> }
  try {
    const wh = new Webhook(secret)
    event = wh.verify(payload, headers) as typeof event
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'user.created' || event.type === 'user.updated') {
    const data = event.data as {
      id: string
      email_addresses: { email_address: string }[]
      first_name?: string
      last_name?: string
      image_url?: string
    }
    const email = data.email_addresses[0]?.email_address ?? ''
    const name = [data.first_name, data.last_name].filter(Boolean).join(' ') || null

    await prisma.user.upsert({
      where: { id: data.id },
      update: { email, name, imageUrl: data.image_url },
      create: { id: data.id, email, name, imageUrl: data.image_url },
    })
  }

  if (event.type === 'user.deleted') {
    const data = event.data as { id?: string }
    if (data.id) await prisma.user.delete({ where: { id: data.id } }).catch(() => null)
  }

  return NextResponse.json({ received: true })
}
