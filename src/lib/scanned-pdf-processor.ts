import { PDFDocument, rgb } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'
import { createWorker } from 'tesseract.js'
import { convertTextWithDictionary } from './async-converter'
import { loadUnicodeFont } from './pdf-font'
import type { ConversionMode, ConversionOptions } from './converter'

type OcrWord = {
  text: string
  bbox: { x0: number; y0: number; x1: number; y1: number }
  confidence?: number
}

function getWords(data: unknown): OcrWord[] {
  const maybe = data as { words?: OcrWord[] }
  return Array.isArray(maybe.words) ? maybe.words : []
}

function cleanWord(text: string): string {
  return text.replace(/\s+/g, ' ').trim()
}

export async function processScannedPdf(
  buffer: Buffer,
  mode: ConversionMode,
  options: ConversionOptions = {}
): Promise<Buffer> {
  // Tesseract has 'uzb' and 'uzb_cyrl' (there is no 'uzb_latn'); '/tmp' is the
  // only writable cache dir on serverless.
  const worker = await createWorker(['uzb', 'eng'], 1, {
    cachePath: '/tmp',
    logger: () => {},
  })

  try {
    const pdf = await PDFDocument.create()
    pdf.registerFontkit(fontkit)
    // A Unicode font — the standard Helvetica cannot encode ş/ğ.
    const font = await pdf.embedFont(await loadUnicodeFont(), { subset: true })
    let totalWords = 0
    let renderedAny = false

    try {
      const { renderPdfPages } = await import('./pdf-renderer')
      // Render one page at a time and drop each bitmap after embedding/OCR.
      for await (const rendered of renderPdfPages(buffer, 2)) {
        renderedAny = true
        const image = await pdf.embedPng(rendered.png)
        const page = pdf.addPage([rendered.width, rendered.height])
        page.drawImage(image, { x: 0, y: 0, width: rendered.width, height: rendered.height })

        const { data } = await worker.recognize(rendered.png)
        const words = getWords(data)
          .map((word) => ({ ...word, text: cleanWord(word.text) }))
          .filter((word) => word.text && (word.confidence ?? 100) >= 35)
        totalWords += words.length

        for (const word of words) {
          const converted = await convertTextWithDictionary(word.text, mode, options)
          if (converted === word.text) continue

          const x = word.bbox.x0
          const y = rendered.height - word.bbox.y1
          const width = Math.max(1, word.bbox.x1 - word.bbox.x0)
          const height = Math.max(1, word.bbox.y1 - word.bbox.y0)
          const fontSize = Math.max(5, height * 0.72)

          page.drawRectangle({
            x: Math.max(0, x - 1),
            y: Math.max(0, y - 1),
            width: width + 2,
            height: height + 2,
            color: rgb(1, 1, 1),
            opacity: 0.92,
          })
          page.drawText(converted, {
            x,
            y: y + Math.max(1, height * 0.12),
            size: fontSize,
            font,
            color: rgb(0.05, 0.1, 0.2),
            maxWidth: width * 1.35,
          })
        }
      }
    } catch (err) {
      console.warn('[processScannedPdf] Canvas rendering fallback:', err)
    }

    if (renderedAny && totalWords > 0) {
      return Buffer.from(await pdf.save())
    }

    // Fallback: OCR the whole file and emit a plain docx.
    const { data } = await worker.recognize(buffer)
    const text = data.text.trim()
    if (!text) {
      throw new Error('Skan PDF ichidan matn topilmadi.')
    }
    const convertedText = await convertTextWithDictionary(text, mode, options)
    const { createDocxFromText } = await import('./docx-writer')
    return await createDocxFromText(convertedText)
  } finally {
    await worker.terminate()
  }
}
