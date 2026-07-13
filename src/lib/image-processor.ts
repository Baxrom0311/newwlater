import { convertTextWithDictionary } from './async-converter'
import { type ConversionMode, type ConversionOptions } from './converter'

export async function processImage(
  buffer: Buffer,
  mode: ConversionMode,
  options: ConversionOptions = {}
): Promise<string> {
  const { createWorker } = await import('tesseract.js')

  // Try Uzbek (Cyrillic), Uzbek Latin, and English data — download automatically
  const worker = await createWorker(['uzb', 'uzb_latn', 'eng'], 1, {
    logger: () => {}, // silence progress logs
  })

  try {
    const { data } = await worker.recognize(buffer)
    const sourceText = data.text.trim()
    if (!sourceText) {
      throw new Error('Rasm ichidan matn topilmadi.')
    }
    return convertTextWithDictionary(sourceText, mode, options)
  } finally {
    await worker.terminate()
  }
}
