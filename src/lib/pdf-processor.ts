import { convertTextWithDictionary } from './async-converter'
import { type ConversionMode, type ConversionOptions } from './converter'
import { createDocxFromText } from './docx-writer'
import { processScannedPdf } from './scanned-pdf-processor'

export async function processPdf(
  buffer: Buffer,
  mode: ConversionMode,
  options: ConversionOptions = {}
): Promise<{ body: Buffer; ext: 'docx' | 'pdf'; contentType: string }> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfParse = require('pdf-parse') as (buf: Buffer) => Promise<{ text: string }>
  const data = await pdfParse(buffer)
  const sourceText = data.text.trim()
  if (!sourceText) {
    const result = await processScannedPdf(buffer, mode, options)
    return {
      body: result,
      ext: 'pdf',
      contentType: 'application/pdf',
    }
  }
  return {
    body: await createDocxFromText(await convertTextWithDictionary(sourceText, mode, options)),
    ext: 'docx',
    contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  }
}
