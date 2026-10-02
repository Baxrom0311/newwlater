import JSZip from 'jszip'
import { convertTextWithDictionary, prewarmDictionary } from './async-converter'
import { assertEntrySafe } from './zip-guard'
import { type ConversionMode, type ConversionOptions } from './converter'

const VISIBLE_TEXT_XML = /^word\/(document\d*|footnotes|endnotes|comments|header\d*|footer\d*)\.xml$/i

function xmlUnescape(value: string): string {
  return value
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    // Numeric character references (e.g. &#8217; / &#x02BB;) — decode so the
    // converter sees real apostrophes instead of leaving them to be re-escaped
    // into visible &#...; text.
    .replace(/&#(\d+);/g, (_m, n: string) => codePoint(parseInt(n, 10)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_m, n: string) => codePoint(parseInt(n, 16)))
    .replace(/&amp;/g, '&')
}

function codePoint(cp: number): string {
  return cp >= 0 && cp <= 0x10ffff ? String.fromCodePoint(cp) : ''
}

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * Advanced monotonic character alignment map.
 * Maps character offsets from sourceText [0..srcLen] to convertedText [0..tgtLen].
 */
function buildOffsetMap(sourceText: string, convertedText: string): number[] {
  const srcLen = sourceText.length
  const tgtLen = convertedText.length
  const map: number[] = new Array(srcLen + 1)
  map[0] = 0
  map[srcLen] = tgtLen

  if (srcLen === 0) return map
  if (tgtLen === 0) {
    map.fill(0)
    return map
  }

  // Find exact character alignment anchors (spaces, tabs, newlines, punctuation, digits)
  const anchors: Array<[number, number]> = [[0, 0]]
  let s = 0
  let t = 0

  while (s < srcLen && t < tgtLen) {
    if (sourceText[s] === convertedText[t]) {
      if (/[\s\t\n.,!?:;()"'\-\/ʻ`ʼ‘’´′ʹʽ‛ˈ＇]/u.test(sourceText[s])) {
        anchors.push([s, t])
        anchors.push([s + 1, t + 1])
      }
      s++
      t++
    } else {
      let nextS = s
      while (nextS < srcLen && !/[\s\t\n]/u.test(sourceText[nextS])) nextS++
      let nextT = t
      while (nextT < tgtLen && !/[\s\t\n]/u.test(convertedText[nextT])) nextT++

      anchors.push([s, t])
      anchors.push([nextS, nextT])

      s = nextS
      t = nextT
    }
  }
  anchors.push([srcLen, tgtLen])

  anchors.sort((a, b) => a[0] - b[0] || a[1] - b[1])

  let lastS = 0
  let lastT = 0

  for (const [anchorS, anchorT] of anchors) {
    if (anchorS <= lastS) {
      lastT = Math.max(lastT, anchorT)
      continue
    }

    const dS = anchorS - lastS
    const dT = anchorT - lastT

    for (let i = lastS; i <= anchorS; i++) {
      const progress = (i - lastS) / dS
      map[i] = Math.min(tgtLen, Math.max(lastT, Math.round(lastT + progress * dT)))
    }

    lastS = anchorS
    lastT = anchorT
  }

  for (let i = lastS; i <= srcLen; i++) {
    map[i] = Math.min(tgtLen, Math.max(lastT, map[i] ?? tgtLen))
  }

  for (let i = 1; i <= srcLen; i++) {
    if (map[i] < map[i - 1]) {
      map[i] = map[i - 1]
    }
  }

  return map
}

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

async function convertTextNodesOutsideFieldCode(
  xml: string,
  mode: ConversionMode,
  options: ConversionOptions
): Promise<string> {
  const parts = xml.split(/(<w:r[\s\S]*?<\/w:r>)/g)
  const converted = await Promise.all(
    parts.map(async (part) => {
      if (!part.startsWith('<w:r')) return part
      if (/<w:instrText[\s>]/i.test(part) || /<m:t[\s>]/i.test(part)) return part
      return convertTextNodes(part, mode, options)
    })
  )
  return converted.join('')
}

async function convertTextNodes(xml: string, mode: ConversionMode, options: ConversionOptions): Promise<string> {
  const parts = xml.split(/(<w:t(?![a-zA-Z/])[^>]*>[\s\S]*?<\/w:t>)/g)
  const converted = await Promise.all(
    parts.map(async (part) => {
      const match = part.match(/^<w:t(?![a-zA-Z/])([^>]*)>([\s\S]*?)<\/w:t>$/)
      if (!match) return part
      const [, attrs, text] = match
      if (!text || text.trim() === '') return part
      const result = await convertTextWithDictionary(xmlUnescape(text), mode, options)
      const hasSpaces = /^\s|\s$/.test(result) || /\bxml:space=/.test(attrs)
      const spaceAttr = hasSpaces && !/\bxml:space=/.test(attrs) ? `${attrs} xml:space="preserve"` : attrs
      return `<w:t${spaceAttr}>${xmlEscape(result)}</w:t>`
    })
  )
  return converted.join('')
}

async function convertParagraph(
  xml: string,
  mode: ConversionMode,
  options: ConversionOptions
): Promise<string> {
  const isFieldOrMath = /<w:instrText[\s>]|<m:oMath/i.test(xml)
  if (isFieldOrMath) {
    return convertTextNodesOutsideFieldCode(xml, mode, options)
  }

  const textMatches = [...xml.matchAll(/<w:t(?![a-zA-Z/])([^>]*)>([\s\S]*?)<\/w:t>/g)]
  if (textMatches.length === 0) return xml
  if (textMatches.length === 1) return convertTextNodes(xml, mode, options)

  let sourceText = ''
  const nodeRanges: Array<{ index: number; attrs: string; rawText: string; start: number; end: number }> = []

  const tokenRegex = /(<w:t(?![a-zA-Z/])[^>]*>[\s\S]*?<\/w:t>|<w:tab\/>|<w:br[^>]*\/?>|<w:cr\/>)/g
  let match: RegExpExecArray | null

  while ((match = tokenRegex.exec(xml)) !== null) {
    const token = match[0]
    if (token === '<w:tab/>') {
      sourceText += '\t'
    } else if (token.startsWith('<w:br') || token === '<w:cr/>') {
      sourceText += '\n'
    } else if (token.startsWith('<w:t')) {
      const tMatch = token.match(/^<w:t(?![a-zA-Z/])([^>]*)>([\s\S]*?)<\/w:t>$/)
      if (tMatch) {
        const [, attrs, rawText] = tMatch
        const unescaped = xmlUnescape(rawText)
        const start = sourceText.length
        sourceText += unescaped
        const end = sourceText.length
        nodeRanges.push({
          index: nodeRanges.length,
          attrs,
          rawText,
          start,
          end,
        })
      }
    }
  }

  if (!sourceText.trim() || nodeRanges.length === 0) return xml

  const convertedText = await convertTextWithDictionary(sourceText, mode, options)
  const offsetMap = buildOffsetMap(sourceText, convertedText)

  let nodeIdx = 0
  return xml.replace(/<w:t(?![a-zA-Z/])([^>]*)>([\s\S]*?)<\/w:t>/g, (full, attrs) => {
    const range = nodeRanges[nodeIdx]
    nodeIdx += 1

    if (!range) return full

    const startOffset = offsetMap[range.start] ?? 0
    // Stop at this node's own end offset. Using convertedText.length for the
    // last node would pull in trailing <w:tab/>/<w:br/> text (added to
    // sourceText as \t/\n) and inject a duplicate literal tab/newline.
    const endOffset = offsetMap[range.end] ?? convertedText.length
    const chunk = convertedText.slice(startOffset, endOffset)

    const hasSpaces = /^\s|\s$/.test(chunk) || /\bxml:space=/.test(attrs)
    const spaceAttr = hasSpaces && !/\bxml:space=/.test(attrs) ? `${attrs} xml:space="preserve"` : attrs

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

  const running = { total: 0 }
  for (const path of paths) {
    const file = zip.file(path)
    if (!file) continue
    assertEntrySafe(file, running)
    const content = await file.async('text')
    // Warm the dictionary cache for this whole part up front, so the per-node
    // conversions below hit the cache instead of each firing a DB query.
    await prewarmDictionary(content.replace(/<[^>]+>/g, ' '))
    zip.file(path, await convertXmlText(content, mode, options))
  }

  return zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  })
}
