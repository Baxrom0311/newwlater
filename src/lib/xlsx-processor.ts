import JSZip from 'jszip'
import { convertTextWithDictionary } from './async-converter'
import { type ConversionMode, type ConversionOptions } from './converter'

const XLSX_TEXT_XML = /^xl\/(sharedStrings\.xml|worksheets\/sheet\d+\.xml)$/i

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

async function convertXlsxTextNodes(xml: string, mode: ConversionMode, options: ConversionOptions): Promise<string> {
  const parts = xml.split(/(<t[^>]*>[\s\S]*?<\/t>)/g)
  const converted = await Promise.all(
    parts.map(async (part) => {
      const match = part.match(/^<t([^>]*)>([\s\S]*?)<\/t>$/)
      if (!match) return part
      const [, attrs, text] = match
      if (!text || text.trim() === '') return part
      const result = await convertTextWithDictionary(xmlUnescape(text), mode, options)
      const spaceAttr = /\bxml:space=/.test(attrs) ? attrs : `${attrs} xml:space="preserve"`
      return `<t${spaceAttr}>${xmlEscape(result)}</t>`
    })
  )
  return converted.join('')
}

export async function processXlsx(
  buffer: Buffer,
  mode: ConversionMode,
  options: ConversionOptions = {}
): Promise<Buffer> {
  const zip = await JSZip.loadAsync(buffer)
  const paths = Object.keys(zip.files).filter((path) => XLSX_TEXT_XML.test(path))

  for (const path of paths) {
    const file = zip.file(path)
    if (!file) continue
    const content = await file.async('text')
    zip.file(path, await convertXlsxTextNodes(content, mode, options))
  }

  return zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  })
}
