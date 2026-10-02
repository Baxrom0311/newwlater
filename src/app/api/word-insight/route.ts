import { NextRequest, NextResponse } from 'next/server'
import { lookupWordInsight } from '@/lib/lexicon'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const word = searchParams.get('word')

    if (!word || !word.trim()) {
      return NextResponse.json({ error: 'So‘z kiritilmadi' }, { status: 400 })
    }

    const insight = lookupWordInsight(word)
    return NextResponse.json(insight)
  } catch (error) {
    console.error('[API word-insight GET error]:', error)
    return NextResponse.json({ error: 'Server xatosi yuz berdi' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const word = body.word

    if (!word || typeof word !== 'string' || !word.trim()) {
      return NextResponse.json({ error: 'So‘z kiritilmadi' }, { status: 400 })
    }

    const insight = lookupWordInsight(word)
    return NextResponse.json(insight)
  } catch (error) {
    console.error('[API word-insight POST error]:', error)
    return NextResponse.json({ error: 'Server xatosi yuz berdi' }, { status: 500 })
  }
}
