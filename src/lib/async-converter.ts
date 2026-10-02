import {
  convertText,
  extractLatinConversionCandidates,
  type ConversionMode,
  type ConversionOptions,
} from './converter'
import { filterKnownUzbekWords } from './dictionary-lookup'

// Suffixes that occur in English/international words but never in native Uzbek
// word endings. Note: -ing was deliberately removed — it collides with common
// Uzbek imperatives (oching, iching, ko'rsating) that must stay convertible.
const FOREIGN_SUFFIX = /(tion|ment|ness|ology|ware|script|ship)$/i

function isLikelyForeignCandidate(word: string): boolean {
  // Uzbek-specific markers (oʻ/gʻ apostrophes, ö, ğ, ş, ç) => definitely not foreign.
  if (/['ʻ`ʼ‘’´′ʹʽ‛ˈ＇"”«»şçöğŞÇÖĞ]/.test(word)) return false
  const asciiOnly = /^[a-z-]+$/i.test(word)
  if (!asciiOnly) return false
  return FOREIGN_SUFFIX.test(word)
}

/**
 * Pre-load the dictionary cache for an entire document before per-node
 * conversion, so the many per-text-node calls hit the cache instead of each
 * firing its own DB query.
 */
export async function prewarmDictionary(text: string): Promise<void> {
  const candidates = extractLatinConversionCandidates(text)
  if (candidates.length > 0) {
    await filterKnownUzbekWords(candidates).catch(() => undefined)
  }
}

export async function convertTextWithDictionary(
  text: string,
  mode: ConversionMode,
  options: ConversionOptions = {}
): Promise<string> {
  if (mode !== 'old-latin') return convertText(text, mode, options)

  const candidates = extractLatinConversionCandidates(text)
  if (candidates.length === 0) return convertText(text, mode, options)

  let knownWords: Set<string> | null
  try {
    knownWords = await filterKnownUzbekWords(candidates)
  } catch {
    // Dictionary unavailable: do NOT treat every -tion/-ship word as foreign —
    // that would silently leave real content unconverted. Skip filtering.
    knownWords = null
  }

  const protectedTerms =
    knownWords === null
      ? []
      : candidates.filter((word) => !knownWords!.has(word) && isLikelyForeignCandidate(word))

  return convertText(text, mode, {
    ...options,
    protectedTerms: [...(options.protectedTerms ?? []), ...protectedTerms],
  })
}
