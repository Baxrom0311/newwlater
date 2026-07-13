import seedRules from '../../data/conversion-rules.seed.json'

export type WordRule = {
  from: string
  to: string
}

// Words that should be normalized by dictionary before mechanical conversion.
// This list is intentionally small; it is the seed for a reviewed spelling DB.
export const OLD_LATIN_WORD_RULES = seedRules.oldLatinWordRules satisfies WordRule[]

// Tokens that must not be transliterated even when they contain sh/ch/o'/g'.
// Add brand names, foreign words, profanity/slur lists, product names, and user terms here.
export const PROTECTED_TERMS = seedRules.protectedTerms satisfies string[]

export const PROTECTED_PATTERNS: RegExp[] = [
  /https?:\/\/[^\s<>"']+/giu,
  /www\.[^\s<>"']+/giu,
  /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/giu,
  /#[\p{L}\p{N}_-]+/gu,
  /@[\p{L}\p{N}_-]+/gu,
  /`[^`]*`/gu,
]
