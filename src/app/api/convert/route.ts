import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { detectMode, type ConversionMode } from '@/lib/converter'
import { convertTextWithDictionary } from '@/lib/async-converter'
import { checkLimit, incrementUsage, getUserPlan } from '@/lib/usage'
import { prisma } from '@/lib/prisma'
import { getDbConversionRules } from '@/lib/conversion-db-rules'

const MAX_ABSOLUTE = 500 * 1024 * 1024 // 500 MB hard cap

function outputFilename(name: string, ext: string): string {
  return `${name.replace(/\.[^.]+$/, '')}_yangi.${ext}`
}

async function getSampleText(buffer: Buffer, ext: string): Promise<string> {
  if (['txt', 'md', 'csv', 'json', 'html', 'xml', 'rtf'].includes(ext))
    return buffer.toString('utf-8').slice(0, 3000)
  if (ext === 'docx') {
    const JSZip = (await import('jszip')).default
    const zip = await JSZip.loadAsync(buffer)
    const xml = (await zip.file('word/document.xml')?.async('text')) ?? ''
    return xml.replace(/<[^>]+>/g, ' ').slice(0, 3000)
  }
  if (ext === 'pptx') {
    const JSZip = (await import('jszip')).default
    const zip = await JSZip.loadAsync(buffer)
    const slide1 = (await zip.file('ppt/slides/slide1.xml')?.async('text')) ?? ''
    return slide1.replace(/<[^>]+>/g, ' ').slice(0, 3000)
  }
  if (ext === 'xlsx') {
    const JSZip = (await import('jszip')).default
    const zip = await JSZip.loadAsync(buffer)
    const sharedStrings = (await zip.file('xl/sharedStrings.xml')?.async('text')) ?? ''
    return sharedStrings.replace(/<[^>]+>/g, ' ').slice(0, 3000)
  }
  if (ext === 'pdf') {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require('pdf-parse') as (b: Buffer) => Promise<{ text: string }>
    const data = await pdfParse(buffer).catch(() => ({ text: '' }))
    return data.text.slice(0, 3000)
  }
  return ''
}

export async function POST(req: NextRequest) {
  // Auth
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Tizimga kiring' }, { status: 401 })
  }

  // Parse form
  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: "Fayl o'qilmadi" }, { status: 400 })
  }

  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'Fayl topilmadi' }, { status: 400 })
  if (file.size > MAX_ABSOLUTE)
    return NextResponse.json({ error: 'Fayl 500 MB dan katta' }, { status: 413 })

  const originalName = file.name
  const ext = originalName.split('.').pop()?.toLowerCase() ?? ''

  // Plan & limit check
  const plan = await getUserPlan(userId)
  const limitCheck = await checkLimit(userId, plan, file.size, ext)
  if (!limitCheck.allowed) {
    return NextResponse.json({ error: limitCheck.reason }, { status: 403 })
  }

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  // Auto-detect mode
  const rawMode = (formData.get('mode') as string | null) ?? 'auto'
  let mode: ConversionMode
  if (rawMode === 'auto') {
    const sample = await getSampleText(buffer, ext).catch(() => '')
    mode = sample ? detectMode(sample) : 'old-latin'
  } else {
    mode = rawMode as ConversionMode
  }
  const conversionRules = await getDbConversionRules(mode).catch(() => ({
    exceptions: [],
    protectedTerms: [],
  }))

  // Create DB record
  const conversion = await prisma.conversion.create({
    data: {
      userId,
      originalName,
      fileSize: file.size,
      fileType: ext,
      inputMode: mode,
      status: 'PROCESSING',
    },
  })

  try {
    let body: Uint8Array<ArrayBufferLike> | string
    let contentType: string
    let outExt: string

    if (ext === 'docx') {
      const { processDocx } = await import('@/lib/docx-processor')
      const result = await processDocx(buffer, mode, conversionRules)
      body = new Uint8Array(result)
      contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      outExt = 'docx'
    } else if (ext === 'pptx') {
      const { processPptx } = await import('@/lib/pptx-processor')
      const result = await processPptx(buffer, mode, conversionRules)
      body = new Uint8Array(result)
      contentType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
      outExt = 'pptx'
    } else if (ext === 'xlsx') {
      const { processXlsx } = await import('@/lib/xlsx-processor')
      const result = await processXlsx(buffer, mode, conversionRules)
      body = new Uint8Array(result)
      contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      outExt = 'xlsx'
    } else if (ext === 'pdf') {
      const { processPdf } = await import('@/lib/pdf-processor')
      const result = await processPdf(buffer, mode, conversionRules)
      body = new Uint8Array(result.body)
      contentType = result.contentType
      outExt = result.ext
    } else if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'tiff', 'tif'].includes(ext)) {
      const { processImage } = await import('@/lib/image-processor')
      const imgRes = await processImage(buffer, mode, conversionRules)
      const targetOut = (formData.get('targetOut') as string | null) ?? 'txt'
      if (targetOut === 'docx') {
        body = new Uint8Array(imgRes.docx)
        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        outExt = 'docx'
      } else {
        body = imgRes.text
        contentType = 'text/plain; charset=utf-8'
        outExt = 'txt'
      }
    } else if (['txt', 'md', 'csv', 'json', 'html', 'xml', 'rtf'].includes(ext)) {
      body = await convertTextWithDictionary(buffer.toString('utf-8'), mode, conversionRules)
      contentType = 'text/plain; charset=utf-8'
      outExt = ext
    } else {
      await prisma.conversion.update({ where: { id: conversion.id }, data: { status: 'FAILED' } })
      return NextResponse.json({ error: `Format qo'llab-quvvatlanmaydi: .${ext}` }, { status: 415 })
    }

    // Increment usage & mark done
    await Promise.all([
      incrementUsage(userId),
      prisma.conversion.update({ where: { id: conversion.id }, data: { status: 'DONE' } }),
    ])

    return new NextResponse(body as BodyInit, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${outputFilename(originalName, outExt)}"`,
        'X-Detected-Mode': mode,
        'X-Conversion-Id': conversion.id,
      },
    })
  } catch (err) {
    console.error('[convert]', err)
    await prisma.conversion.update({
      where: { id: conversion.id },
      data: { status: 'FAILED', error: err instanceof Error ? err.message : 'Unknown' },
    })
    const msg = err instanceof Error ? err.message : "Noma'lum xato"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
