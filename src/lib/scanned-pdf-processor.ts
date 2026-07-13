import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { createWorker } from 'tesseract.js'
import { convertTextWithDictionary } from './async-converter'
import { renderPdfPages } from './pdf-renderer'
import type { ConversionMode, ConversionOptions } from './converter'

type OcrWord = {
  text: string
  bbox: {
    x0: number
    y0: number
    x1: number
    y1: number
  }
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
  const pages = await renderPdfPages(buffer, 2)
  if (pages.length === 0) throw new Error('PDF sahifalari topilmadi.')

  const pdf = await PDFDocument.create()
  const font = await pdf.embedFont(StandardFonts.Helvetica)
  const worker = await createWorker(['uzb', 'uzb_latn', 'eng'], 1, { logger: () => {} })
  let totalWords = 0

  try {
    for (const rendered of pages) {
      const image = await pdf.embedPng(rendered.png)
      const page = pdf.addPage([rendered.width, rendered.height])
      page.drawImage(image, {
        x: 0,
        y: 0,
        width: rendered.width,
        height: rendered.height,
      })

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
  } finally {
    await worker.terminate()
  }

  if (totalWords === 0) {
    throw new Error('Skan PDF ichidan matn topilmadi.')
  }

  return Buffer.from(await pdf.save())
}
