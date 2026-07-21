import { convertTextWithDictionary } from './async-converter'
import { type ConversionMode, type ConversionOptions } from './converter'

export async function processImage(
  buffer: Buffer,
  mode: ConversionMode,
  options: ConversionOptions = {}
): Promise<{ text: string; docx: Buffer }> {
  const { createWorker } = await import('tesseract.js')

  const worker = await createWorker(['uzb', 'uzb_latn', 'eng'], 1, {
    logger: () => {},
  })

  try {
    const { data } = await worker.recognize(buffer)
    const sourceText = data.text.trim()
    if (!sourceText) {
      throw new Error('Rasm ichidan matn topilmadi.')
    }
    const text = await convertTextWithDictionary(sourceText, mode, options)
    const { createDocxFromText } = await import('./docx-writer')
    const docx = await createDocxFromText(text)
    return { text, docx }
  } finally {
    await worker.terminate()
  }
}
