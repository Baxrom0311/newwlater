import {
  OLD_LATIN_WORD_RULES,
  PROTECTED_PATTERNS,
  PROTECTED_TERMS,
  type WordRule,
} from './conversion-rules'

export type ConversionMode = 'old-latin' | 'cyrillic'
export type ConversionOptions = {
  exceptions?: WordRule[]
  protectedTerms?: string[]
}

/**
 * Auto-detect whether text is Uzbek Cyrillic or old Latin.
 * Compares count of Cyrillic chars vs Latin chars — whichever dominates wins.
 */
export function detectMode(text: string): ConversionMode {
  const cyrillicCount = (text.match(/[А-ЯЁа-яёЎўҚқҒғҲҳ]/g) ?? []).length
  const latinCount = (text.match(/[a-zA-Z]/g) ?? []).length
  return cyrillicCount > latinCount ? 'cyrillic' : 'old-latin'
}

// All apostrophe variants used in Uzbek Latin writing (including backtick \u0060).
const AP = "[ʻ'\\u0060ʼ]"
const LATIN_WORD = /[\p{L}ʻ'\u0060ʼ-]+/gu
const CYRILLIC_WORD = /[\p{L}\p{M}-]+/gu
const LATIN_CONVERSION_MARKER = /sh|ch|[og][ʻ'\u0060ʼ]/iu

function normalizeKey(value: string): string {
  return value
    .toLocaleLowerCase('uz-UZ')
    .replace(/[ʻ`ʼ]/g, "'")
}

function matchWordCase(source: string, replacement: string): string {
  if (source.toLocaleUpperCase('uz-UZ') === source) {
    return replacement.toLocaleUpperCase('uz-UZ')
  }
  const first = source[0]
  if (first && first.toLocaleUpperCase('uz-UZ') === first && first.toLocaleLowerCase('uz-UZ') !== first) {
    return replacement[0].toLocaleUpperCase('uz-UZ') + replacement.slice(1)
  }
  return replacement
}

function createRuleMap(rules: WordRule[]): Map<string, string> {
  return new Map(rules.map((rule) => [normalizeKey(rule.from), rule.to]))
}

export function extractLatinConversionCandidates(text: string): string[] {
  const candidates = new Set<string>()
  for (const part of splitProtected(text)) {
    if (part.protected) continue
    for (const match of part.value.matchAll(LATIN_WORD)) {
      const word = match[0]
      if (LATIN_CONVERSION_MARKER.test(word)) candidates.add(normalizeKey(word))
    }
  }
  return [...candidates]
}

function splitProtected(text: string): Array<{ value: string; protected: boolean }> {
  const ranges: Array<[number, number]> = []
  for (const pattern of PROTECTED_PATTERNS) {
    pattern.lastIndex = 0
    for (const match of text.matchAll(pattern)) {
      if (match.index === undefined) continue
      ranges.push([match.index, match.index + match[0].length])
    }
  }

  if (ranges.length === 0) return [{ value: text, protected: false }]
  ranges.sort((a, b) => a[0] - b[0])

  const merged: Array<[number, number]> = []
  for (const range of ranges) {
    const last = merged[merged.length - 1]
    if (!last || range[0] > last[1]) merged.push(range)
    else last[1] = Math.max(last[1], range[1])
  }

  const parts: Array<{ value: string; protected: boolean }> = []
  let cursor = 0
  for (const [start, end] of merged) {
    if (start > cursor) parts.push({ value: text.slice(cursor, start), protected: false })
    parts.push({ value: text.slice(start, end), protected: true })
    cursor = end
  }
  if (cursor < text.length) parts.push({ value: text.slice(cursor), protected: false })
  return parts
}

export function convertText(text: string, mode: ConversionMode, options: ConversionOptions = {}): string {
  const oldLatinRules = [...OLD_LATIN_WORD_RULES, ...(options.exceptions ?? [])]
  const protectedTerms = [...PROTECTED_TERMS, ...(options.protectedTerms ?? [])]
  const oldLatinRuleMap = createRuleMap(oldLatinRules)
  const protectedTermSet = new Set(protectedTerms.map(normalizeKey))

  return splitProtected(text)
  .map((part) => {
    if (part.protected) return part.value
    if (mode === 'old-latin') return convertOldLatinToNew(part.value, oldLatinRuleMap, protectedTermSet)
    return convertCyrillicToNew(part.value)
  })
  .join('')
}

function convertOldLatinToNew(
  text: string,
  oldLatinRuleMap: Map<string, string>,
  protectedTermSet: Set<string>
): string {
  return text.replace(LATIN_WORD, (word) => {
    const key = normalizeKey(word)
    const override = oldLatinRuleMap.get(key)
    if (override) return matchWordCase(word, override)
    if (protectedTermSet.has(key)) return word

    return word
      // Digraphs — must process before individual letters
      .replace(/SH/g, 'Ş')
      .replace(/Sh/g, 'Ş')
      .replace(/sh/g, 'ş')
      .replace(/CH/g, 'Ç')
      .replace(/Ch/g, 'Ç')
      .replace(/ch/g, 'ç')
      // O' → Ö (all apostrophe variants)
      .replace(new RegExp(`O${AP}`, 'g'), 'Ö')
      .replace(new RegExp(`o${AP}`, 'g'), 'ö')
      // G' → Ğ
      .replace(new RegExp(`G${AP}`, 'g'), 'Ğ')
      .replace(new RegExp(`g${AP}`, 'g'), 'ğ')
  })
}

// Uzbek Cyrillic vowels (for context-aware е/Е conversion)
const CYR_VOWELS = 'АаЕеЁёИиОоУуЎўЭэ'

function cyrillicEConvert(char: string, prevChar: string | null): string {
  const isWordStart =
    prevChar === null || /\s/.test(prevChar) || /[^\wА-яЁёҚқҒғҲҳЎў]/u.test(prevChar)
  const isAfterVowel = prevChar !== null && CYR_VOWELS.includes(prevChar)
  const useYe = isWordStart || isAfterVowel
  if (char === 'Е') return useYe ? 'Ye' : 'E'
  return useYe ? 'ye' : 'e'
}

// Ordered Cyrillic → New Latin 2026 substitutions (longer matches first)
const CYRILLIC_PAIRS: [RegExp, string][] = [
  [/Ё/g, 'Yo'], [/ё/g, 'yo'],
  [/Ю/g, 'Yu'], [/ю/g, 'yu'],
  [/Я/g, 'Ya'], [/я/g, 'ya'],
  [/А/g, 'A'],  [/а/g, 'a'],
  [/Б/g, 'B'],  [/б/g, 'b'],
  [/В/g, 'V'],  [/в/g, 'v'],
  [/Г/g, 'G'],  [/г/g, 'g'],
  [/Д/g, 'D'],  [/д/g, 'd'],
  [/Ж/g, 'J'],  [/ж/g, 'j'],
  [/З/g, 'Z'],  [/з/g, 'z'],
  [/И/g, 'I'],  [/и/g, 'i'],
  [/Й/g, 'Y'],  [/й/g, 'y'],
  [/К/g, 'K'],  [/к/g, 'k'],
  [/Л/g, 'L'],  [/л/g, 'l'],
  [/М/g, 'M'],  [/м/g, 'm'],
  [/Н/g, 'N'],  [/н/g, 'n'],
  [/О/g, 'O'],  [/о/g, 'o'],
  [/П/g, 'P'],  [/п/g, 'p'],
  [/Р/g, 'R'],  [/р/g, 'r'],
  [/С/g, 'S'],  [/с/g, 's'],
  [/Т/g, 'T'],  [/т/g, 't'],
  [/У/g, 'U'],  [/у/g, 'u'],
  [/Ф/g, 'F'],  [/ф/g, 'f'],
  [/Х/g, 'X'],  [/х/g, 'x'],
  [/Ч/g, 'Ç'],  [/ч/g, 'ç'],
  [/Ш/g, 'Ş'],  [/ш/g, 'ş'],
  [/Щ/g, 'Ş'],  [/щ/g, 'ş'],
  [/Э/g, 'E'],  [/э/g, 'e'],
  [/Ъ/g, "'"],  [/ъ/g, "'"],
  [/Ь/g, ''],   [/ь/g, ''],
  [/Ў/g, 'Ö'],  [/ў/g, 'ö'],
  [/Қ/g, 'Q'],  [/қ/g, 'q'],
  [/Ғ/g, 'Ğ'],  [/ғ/g, 'ğ'],
  [/Ҳ/g, 'H'],  [/ҳ/g, 'h'],
  [/Ц/g, 'Ts'], [/ц/g, 'ts'],
  [/Ң/g, 'Ng'], [/ң/g, 'ng'],
]

function convertCyrillicWord(word: string): string {
  const isAllCaps = word.toLocaleUpperCase('uz-UZ') === word && /[А-ЯЁЎҚҒҲ]/u.test(word)

  let res = word.replace(/[Ее]/g, (match, offset, str) => {
    const prev = offset > 0 ? str[offset - 1] : null
    return cyrillicEConvert(match, prev)
  })

  for (const [pattern, replacement] of CYRILLIC_PAIRS) {
    res = res.replace(pattern, replacement)
  }

  return isAllCaps ? res.toLocaleUpperCase('uz-UZ') : res
}

function convertCyrillicToNew(text: string): string {
  return text.replace(CYRILLIC_WORD, (word) => convertCyrillicWord(word))
}
