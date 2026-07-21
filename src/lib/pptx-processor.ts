import JSZip from 'jszip'
import { convertTextWithDictionary } from './async-converter'
import { type ConversionMode, type ConversionOptions } from './converter'

const PPTX_TEXT_XML = /^ppt\/(slides|notesSlides|slideLayouts|slideMasters)\/.*\.xml$/i

function xmlUnescape(value: string): string {
  return value
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
}

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

async function convertPptxTextNodes(xml: string, mode: ConversionMode, options: ConversionOptions): Promise<string> {
  const parts = xml.split(/(<a:t[^>]*>[\s\S]*?<\/a:t>)/g)
  const converted = await Promise.all(
    parts.map(async (part) => {
      const match = part.match(/^<a:t([^>]*)>([\s\S]*?)<\/a:t>$/)
      if (!match) return part
      const [, attrs, text] = match
      if (!text || text.trim() === '') return part
      const result = await convertTextWithDictionary(xmlUnescape(text), mode, options)
      return `<a:t${attrs}>${xmlEscape(result)}</a:t>`
    })
  )
  return converted.join('')
}

export async function processPptx(
  buffer: Buffer,
  mode: ConversionMode,
  options: ConversionOptions = {}
): Promise<Buffer> {
  const zip = await JSZip.loadAsync(buffer)
  const paths = Object.keys(zip.files).filter((path) => PPTX_TEXT_XML.test(path))

  for (const path of paths) {
    const file = zip.file(path)
    if (!file) continue
    const content = await file.async('text')
    zip.file(path, await convertPptxTextNodes(content, mode, options))
  }

  return zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  })
}
