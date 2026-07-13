import {
  convertText,
  extractLatinConversionCandidates,
  type ConversionMode,
  type ConversionOptions,
} from './converter'
import { filterKnownUzbekWords } from './dictionary-lookup'

function isLikelyForeignCandidate(word: string): boolean {
  const asciiOnly = /^[a-z' -]+$/i.test(word)
  if (!asciiOnly) return false
  return /(tion|ing|ment|ship|shop|check|chat|channel|show|share|short)$/i.test(word)
}

export async function convertTextWithDictionary(
  text: string,
  mode: ConversionMode,
  options: ConversionOptions = {}
): Promise<string> {
  if (mode !== 'old-latin') return convertText(text, mode, options)

  const candidates = extractLatinConversionCandidates(text)
  if (candidates.length === 0) return convertText(text, mode, options)

  const knownWords = await filterKnownUzbekWords(candidates).catch(() => new Set<string>())
  const protectedTerms = candidates.filter((word) => {
    if (knownWords.has(word)) return false
    return isLikelyForeignCandidate(word)
  })

  return convertText(text, mode, {
    ...options,
    protectedTerms: [...(options.protectedTerms ?? []), ...protectedTerms],
  })
}
