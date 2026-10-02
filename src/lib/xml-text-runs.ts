import { convertTextWithDictionary } from './async-converter'
import type { ConversionMode, ConversionOptions } from './converter'

/**
 * Shared machinery for converting text that is split across multiple runs
 * inside a container element (a paragraph `<a:p>` in pptx, a shared-string
 * `<si>`/inline `<is>` in xlsx). Text is joined across runs, converted once,
 * then redistributed back to each run via a monotonic offset map — so digraphs
 * (sh/ch) split across two runs are still converted correctly.
 *
 * The offset-map logic mirrors the proven docx paragraph converter.
 */

export function xmlUnescape(value: string): string {
  return value
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_m, n: string) => codePoint(parseInt(n, 10)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_m, n: string) => codePoint(parseInt(n, 16)))
    .replace(/&amp;/g, '&')
}

export function xmlEscape(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function codePoint(cp: number): string {
  return cp >= 0 && cp <= 0x10ffff ? String.fromCodePoint(cp) : ''
}

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

  const anchors: Array<[number, number]> = [[0, 0]]
  let s = 0
  let t = 0
  while (s < srcLen && t < tgtLen) {
    if (sourceText[s] === convertedText[t]) {
      if (/[\s\t\n.,!?:;()"'\-/ʻ`ʼ‘’´′ʹʽ‛ˈ＇]/u.test(sourceText[s])) {
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
    if (map[i] < map[i - 1]) map[i] = map[i - 1]
  }
  return map
}

type RunConfig = {
  textTag: string // e.g. 'a:t' or 't'
  breakTag?: string // e.g. 'a:br' -> newline anchor
  preserveSpace?: boolean
}

/**
 * Convert every container run-group in `xml`. `containerTag` is the element that
 * wraps a set of runs (e.g. 'a:p', 'si', 'is'). Text outside any container is
 * still converted node-by-node so nothing is missed.
 */
export async function convertContainers(
  xml: string,
  containerTag: string,
  cfg: RunConfig,
  mode: ConversionMode,
  options: ConversionOptions
): Promise<string> {
  const containerSplit = new RegExp(`(<${containerTag}(?![a-zA-Z])[\\s\\S]*?</${containerTag}>)`, 'g')
  const parts = xml.split(containerSplit)
  const converted = await Promise.all(
    parts.map(async (part) => {
      if (part.startsWith(`<${containerTag}`)) return convertOneContainer(part, cfg, mode, options)
      return convertLooseNodes(part, cfg, mode, options)
    })
  )
  return converted.join('')
}

function textNodeRegex(textTag: string, flags: string): RegExp {
  return new RegExp(`<${textTag}(?![a-zA-Z/])([^>]*)>([\\s\\S]*?)</${textTag}>`, flags)
}

async function convertLooseNodes(
  xml: string,
  cfg: RunConfig,
  mode: ConversionMode,
  options: ConversionOptions
): Promise<string> {
  const tag = cfg.textTag
  const re = textNodeRegex(tag, 'g')
  const matches = [...xml.matchAll(re)]
  if (matches.length === 0) return xml

  const converted = await Promise.all(
    matches.map(async (m) => {
      const text = m[2]
      if (!text || text.trim() === '') return null
      return convertTextWithDictionary(xmlUnescape(text), mode, options)
    })
  )

  let idx = 0
  return xml.replace(textNodeRegex(tag, 'g'), (full, attrs: string) => {
    const result = converted[idx++]
    if (result === null || result === undefined) return full
    return `<${tag}${spaceAttr(attrs, result, cfg.preserveSpace)}>${xmlEscape(result)}</${tag}>`
  })
}

async function convertOneContainer(
  xml: string,
  cfg: RunConfig,
  mode: ConversionMode,
  options: ConversionOptions
): Promise<string> {
  const tag = cfg.textTag
  const matches = [...xml.matchAll(textNodeRegex(tag, 'g'))]
  if (matches.length === 0) return xml
  if (matches.length === 1) return convertLooseNodes(xml, cfg, mode, options)

  // Join text across all runs (and break tags) in document order.
  const tokenAlternatives = [`<${tag}(?![a-zA-Z/])[^>]*>[\\s\\S]*?</${tag}>`]
  if (cfg.breakTag) tokenAlternatives.push(`<${cfg.breakTag}(?![a-zA-Z])[^>]*/?>`)
  const tokenRegex = new RegExp(`(${tokenAlternatives.join('|')})`, 'g')
  const oneText = textNodeRegex(tag, '')

  let sourceText = ''
  const nodeRanges: Array<{ start: number; end: number }> = []
  let match: RegExpExecArray | null
  while ((match = tokenRegex.exec(xml)) !== null) {
    const token = match[0]
    const tMatch = token.match(oneText)
    if (tMatch) {
      const unescaped = xmlUnescape(tMatch[2])
      const start = sourceText.length
      sourceText += unescaped
      nodeRanges.push({ start, end: sourceText.length })
    } else {
      sourceText += '\n'
    }
  }

  if (!sourceText.trim() || nodeRanges.length === 0) return xml

  const convertedText = await convertTextWithDictionary(sourceText, mode, options)
  const offsetMap = buildOffsetMap(sourceText, convertedText)

  let nodeIdx = 0
  return xml.replace(textNodeRegex(tag, 'g'), (full, attrs: string) => {
    const range = nodeRanges[nodeIdx]
    nodeIdx += 1
    if (!range) return full
    const startOffset = offsetMap[range.start] ?? 0
    const endOffset = offsetMap[range.end] ?? convertedText.length
    const chunk = convertedText.slice(startOffset, endOffset)
    return `<${tag}${spaceAttr(attrs, chunk, cfg.preserveSpace)}>${xmlEscape(chunk)}</${tag}>`
  })
}

function spaceAttr(attrs: string, text: string, forcePreserve?: boolean): string {
  const hasSpaceAttr = /\bxml:space=/.test(attrs)
  if (hasSpaceAttr) return attrs
  const needs = forcePreserve || /^\s|\s$/.test(text)
  return needs ? `${attrs} xml:space="preserve"` : attrs
}
