import JSZip from 'jszip'
import { convertTextWithDictionary } from './async-converter'
import { type ConversionMode, type ConversionOptions } from './converter'

const VISIBLE_TEXT_XML = /^word\/(document|footnotes|endnotes|comments|header\d+|footer\d+)\.xml$/

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

/**
 * Convert text inside paragraph <w:t> elements while preserving DOCX structure.
 * We intentionally avoid field-code and math XML nodes so formulas and generated fields stay intact.
 * Word often splits a visible word across several runs; converting per paragraph lets
 * "s" + "h" become "ş" without flattening the whole document.
 */
async function convertXmlText(xml: string, mode: ConversionMode, options: ConversionOptions): Promise<string> {
  const parts = xml.split(/(<w:p[\s\S]*?<\/w:p>)/g)
  const converted = await Promise.all(
    parts.map(async (part) => {
      if (!part.startsWith('<w:p')) return convertTextNodes(part, mode, options)
      return convertParagraph(part, mode, options)
    })
  )
  return converted.join('')
}

async function convertTextNodes(xml: string, mode: ConversionMode, options: ConversionOptions): Promise<string> {
  const parts = xml.split(/(<w:t[^>]*>[\s\S]*?<\/w:t>)/g)
  const converted = await Promise.all(
    parts.map(async (part) => {
      const match = part.match(/^<w:t([^>]*)>([\s\S]*?)<\/w:t>$/)
      if (!match) return part
      const [, attrs, text] = match
      const result = await convertTextWithDictionary(xmlUnescape(text), mode, options)
      return `<w:t${attrs}>${xmlEscape(result)}</w:t>`
    })
  )
  return converted.join('')
}

async function convertParagraph(xml: string, mode: ConversionMode, options: ConversionOptions): Promise<string> {
  const textMatches = [...xml.matchAll(/<w:t([^>]*)>([\s\S]*?)<\/w:t>/g)]
  if (textMatches.length <= 1) return convertTextNodes(xml, mode, options)

  const sourceParts = textMatches.map((match) => xmlUnescape(match[2]))
  const sourceText = sourceParts.join('')
  if (!sourceText.trim()) return xml

  const convertedText = await convertTextWithDictionary(sourceText, mode, options)
  let cursor = 0
  let index = 0

  return xml.replace(/<w:t([^>]*)>([\s\S]*?)<\/w:t>/g, (full, attrs, text) => {
    const sourceLength = xmlUnescape(text).length
    const isLast = index === textMatches.length - 1
    const nextCursor = isLast ? convertedText.length : cursor + sourceLength
    const chunk = convertedText.slice(cursor, nextCursor)
    cursor = nextCursor
    index += 1
    const spaceAttr = /\bxml:space=/.test(attrs) ? attrs : `${attrs} xml:space="preserve"`
    return `<w:t${spaceAttr}>${xmlEscape(chunk)}</w:t>`
  })
}

export async function processDocx(
  buffer: Buffer,
  mode: ConversionMode,
  options: ConversionOptions = {}
): Promise<Buffer> {
  const zip = await JSZip.loadAsync(buffer)
  const paths = Object.keys(zip.files).filter((path) => VISIBLE_TEXT_XML.test(path))

  for (const path of paths) {
    const file = zip.file(path)
    if (!file) continue
    const content = await file.async('text')
    zip.file(path, await convertXmlText(content, mode, options))
  }

  return zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  })
}
