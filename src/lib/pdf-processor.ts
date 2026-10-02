import { convertTextWithDictionary } from './async-converter'
import { type ConversionMode, type ConversionOptions } from './converter'
import { createDocxFromText } from './docx-writer'
import { processScannedPdf } from './scanned-pdf-processor'

export async function processPdf(
  buffer: Buffer,
  mode: ConversionMode,
  options: ConversionOptions = {}
): Promise<{ body: Buffer; ext: 'docx' | 'pdf'; contentType: string }> {
  // pdf-parse v2 exports a PDFParse class (it is no longer a callable module).
  const { PDFParse } = await import('pdf-parse')
  const parser = new PDFParse({ data: new Uint8Array(buffer) })
  const result = await parser.getText()
  const sourceText = (result.text ?? '').trim()
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
