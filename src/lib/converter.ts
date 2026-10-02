import {
  OLD_LATIN_WORD_RULES,
  PROTECTED_PATTERNS,
  PROTECTED_TERMS,
  type WordRule,
} from './conversion-rules'
import { autocorrectWord } from './autocorrect'

export type ConversionMode = 'old-latin' | 'cyrillic' | 'new-latin'
export type ConversionOptions = {
  exceptions?: WordRule[]
  protectedTerms?: string[]
  autocorrect?: boolean
}

/**
 * Auto-detect whether text is Uzbek Cyrillic, New Latin (2026), or Old Latin.
 * Note: conversion itself is per-word script-aware (see convertText), so a
 * mixed-script document still converts properly.
 */
export function detectMode(text: string): ConversionMode {
  const cyrillicCount = (text.match(/[А-ЯЁа-яёЎўҚқҒғҲҳ]/g) ?? []).length
  const newLatinCount = (text.match(/[ŞşÇçÖöĞğ]/g) ?? []).length
  const latinCount = (text.match(/[a-zA-Z]/g) ?? []).length

  if (cyrillicCount > latinCount && cyrillicCount > newLatinCount) return 'cyrillic'
  if (newLatinCount > 0 && newLatinCount >= (text.match(/sh|ch|[og]['ʻ`ʼ‘’´′ʹʽ‛ˈ＇]/gi) ?? []).length) {
    return 'new-latin'
  }
  return 'old-latin'
}

// All apostrophe variants used in Uzbek Latin writing:
//   U+02BB ʻ (modifier turned comma — official standard for oʻ/gʻ),
//   U+0027 ' (straight ASCII single quote),
//   U+0060 ` (grave accent / backtick),
//   U+02BC ʼ (modifier apostrophe — official standard for tutuq belgisi),
//   U+2018 ‘ and U+2019 ’ (curly quotes produced by Word / iOS / Android / news sites),
//   U+00B4 ´ (acute accent),
//   U+2032 ′ (prime),
//   U+02B9 ʹ (modifier letter prime),
//   U+02BD ʽ (modifier letter reversed comma),
//   U+201B ‛ (single high-reversed-9 quotation mark),
//   U+02C8 ˈ (modifier letter vertical line),
//   U+FF07 ＇ (fullwidth apostrophe).
const AP = "[\\u02BB'\\u0060\\u02BC\\u2018\\u2019\\u00B4\\u2032\\u02B9\\u02BD\\u201B\\u02C8\\uFF07]"
const LATIN_WORD = /[\p{L}\p{M}\u00B4\u2032\u02B9\u02BD\u201B\u02C8\uFF07ʻ'`ʼ‘’-]+/gu
// Matches any run of letters/marks/apostrophes/hyphens — Latin OR Cyrillic —
// so mixed-script text can be dispatched per word.
const ANY_WORD = /[\p{L}\p{M}\u00B4\u2032\u02B9\u02BD\u201B\u02C8\uFF07ʻ'`ʼ‘’-]+/gu
const HAS_CYRILLIC = /[Ѐ-ӿ]/u
const LATIN_CONVERSION_MARKER = /sh|ch|[og][ʻ'`ʼ‘’´′ʹʽ‛ˈ＇"”«»]|o''|g''|[óòõơǒŏōǵģġǧ]/iu

// Common Uzbek suffixes (agglutination), longest first — used so a protected
// term or spelling rule still applies when a suffix is attached (e.g.
// "ChatGPTdan", "mo'jizaga").
const UZ_SUFFIXES = [
  'larning', 'lardan', 'larga', 'larda', 'larni', 'larimiz', 'laringiz',
  'gacha', 'qacha', 'kacha', 'gina', 'qina', 'kina', 'lari', 'ngiz', 'miz',
  'ning', 'niki', 'dagi', 'lik', 'siz', 'roq', 'lar', 'dan', 'day', 'dek',
  'cha', 'dir', 'xon', 'bek', 'ga', 'ka', 'qa', 'da', 'ni', 'si', 'im', 'ing', 'mi',
].sort((a, b) => b.length - a.length)

function normalizeKey(value: string): string {
  return value
    .normalize('NFC')
    .toLocaleLowerCase('uz-UZ')
    .replace(/[ʻ`ʼ‘’´′ʹʽ‛ˈ＇"”«»]/g, "'")
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

/**
 * Handle words enclosed in paired quotation marks (e.g. 'marketing', 'pro', 'bog'')
 * so the opening and closing delimiters are not mistaken for apostrophes belonging to the word.
 */
function splitPairedQuotes(word: string): { prefix: string; core: string; suffix: string } {
  let prefix = ''
  let suffix = ''
  let core = word

  if (core.length >= 3) {
    const first = core[0]
    const last = core[core.length - 1]
    if (
      (first === "'" && last === "'") ||
      (first === '‘' && last === '’') ||
      (first === '’' && last === '’') ||
      (first === '`' && last === '`') ||
      (first === '“' && last === '”') ||
      (first === '"' && last === '"')
    ) {
      prefix = first
      suffix = last
      core = core.slice(1, -1)
    }
  }
  return { prefix, core, suffix }
}

export function convertText(
  text: string,
  mode: ConversionMode = 'old-latin',
  options: ConversionOptions = {}
): string {
  if (!text) return ''

  // Normalize Unicode decomposed characters (NFD -> NFC)
  let normalized = text.normalize('NFC')

  // Clean up OCR and typing space artifacts before apostrophes (e.g. "o 'zbek", "g 'alla")
  normalized = normalized.replace(
    new RegExp(`([oOgG])\\s+(${AP}|["”«»])(?=[\\p{L}-])`, 'gu'),
    '$1$2'
  )

  // Normalize double quotes inside words (typed via Russian Shift+2 instead of apostrophe)
  normalized = normalized.replace(/([oOgGуУгГкКхХ])["”«»](?=[\p{L}-])/gu, "$1'")

  const rules = [...OLD_LATIN_WORD_RULES, ...(options.exceptions ?? [])]
  const ruleMap = createRuleMap(rules)
  const protectedTermSet = new Set(
    [...PROTECTED_TERMS, ...(options.protectedTerms ?? [])].map(normalizeKey)
  )

  const autocorrect = options.autocorrect ?? true

  return splitProtected(normalized)
    .map((part) => {
      if (part.protected) return part.value
      // Per-word dispatch: each word converts according to its own script / mode
      return part.value.replace(ANY_WORD, (word) =>
        convertWord(word, ruleMap, protectedTermSet, mode, autocorrect)
      )
    })
    .join('')
}

function convertWord(
  word: string,
  ruleMap: Map<string, string>,
  protectedTermSet: Set<string>,
  mode?: ConversionMode,
  autocorrect = true
): string {
  const { prefix, core, suffix } = splitPairedQuotes(word)
  if (prefix || suffix) {
    return (
      prefix +
      convertWord(core, ruleMap, protectedTermSet, mode, autocorrect) +
      suffix
    )
  }

  if (mode === 'new-latin') {
    return convertNewLatinToOldWord(word)
  }

  const override = resolveOverride(word, ruleMap, protectedTermSet)
  if (override !== null) return override

  // If autocorrect is active, repair known misspellings (xarakat -> harakat, etibor -> e'tibor, etc.)
  if (autocorrect) {
    const fixed = autocorrectWord(word)
    if (fixed && fixed !== word) {
      if (HAS_CYRILLIC.test(fixed)) return convertCyrillicWord(fixed)
      return mechanicalLatinToNew(fixed)
    }
  }

  if (HAS_CYRILLIC.test(word)) return convertCyrillicWord(word)
  return mechanicalLatinToNew(word)
}

function convertNewLatinToOldWord(word: string): string {
  return word
    .replace(/Ş/g, 'Sh')
    .replace(/ş/g, 'sh')
    .replace(/Ç/g, 'Ch')
    .replace(/ç/g, 'ch')
    .replace(/Ö/g, "O'")
    .replace(/ö/g, "o'")
    .replace(/Ğ/g, "G'")
    .replace(/ğ/g, "g'")
}

/**
 * Apply an admin/seed spelling rule or a protected-term skip, both suffix-aware.
 * Returns the resolved string, or null if no rule/protection applies.
 */
function resolveOverride(
  word: string,
  ruleMap: Map<string, string>,
  protectedTermSet: Set<string>
): string | null {
  const key = normalizeKey(word)
  const exact = ruleMap.get(key)
  if (exact) return matchWordCase(word, exact)
  if (protectedTermSet.has(key)) return word

  // Suffix-aware fallback. Only when normalization preserved length, so the
  // source word can be sliced at the same offset as the normalized key.
  if (word.length !== key.length) return null
  for (const suffix of UZ_SUFFIXES) {
    if (key.length <= suffix.length + 2 || !key.endsWith(suffix)) continue
    const stemKey = key.slice(0, key.length - suffix.length)
    const stemLen = word.length - suffix.length
    const srcStem = word.slice(0, stemLen)
    const srcSuffix = word.slice(stemLen)

    const stemRule = ruleMap.get(stemKey)
    if (stemRule) return matchWordCase(srcStem, stemRule) + mechanicalLatinToNew(srcSuffix)
    if (protectedTermSet.has(stemKey)) return srcStem + mechanicalLatinToNew(srcSuffix)
  }
  return null
}

function mechanicalLatinToNew(word: string): string {
  let res = word
    // Combining accent cleanup on o and g
    .replace(/O[\u0300-\u0315\u0306\u0308\u030B\u030C]/g, 'Ö')
    .replace(/o[\u0300-\u0315\u0306\u0308\u030B\u030C]/g, 'ö')
    .replace(/G[\u0300-\u0315\u0306\u0308\u030B\u030C]/g, 'Ğ')
    .replace(/g[\u0300-\u0315\u0306\u0308\u030B\u030C]/g, 'ğ')
    // Precomposed accented variants (from old fonts / keyboards)
    .replace(/[ÓÒÕƠǑŎŌ]/g, 'Ö')
    .replace(/[óòõơǒŏō]/g, 'ö')
    .replace(/[ǴĢĠǦ]/g, 'Ğ')
    .replace(/[ǵģġǧ]/g, 'ğ')
    // Digraphs — must process before individual letters
    .replace(/SH/g, 'Ş')
    .replace(/Sh/g, 'Ş')
    .replace(/sH/g, 'Ş')
    .replace(/sh/g, 'ş')
    .replace(/CH/g, 'Ç')
    .replace(/Ch/g, 'Ç')
    .replace(/cH/g, 'Ç')
    .replace(/ch/g, 'ç')

  // O' variants: standalone or followed by a letter/hyphen
  const reOStand = new RegExp(`^O(?:${AP}|["”«»]){1,2}$`, 'g')
  const reOStandLow = new RegExp(`^o(?:${AP}|["”«»]){1,2}$`, 'g')
  const reOUpper = new RegExp(`O(?:${AP}|["”«»]){1,2}(?=[\\p{L}-])`, 'gu')
  const reOLower = new RegExp(`o(?:${AP}|["”«»]){1,2}(?=[\\p{L}-])`, 'gu')

  res = res
    .replace(reOStand, 'Ö')
    .replace(reOStandLow, 'ö')
    .replace(reOUpper, 'Ö')
    .replace(reOLower, 'ö')

  // G' variants: can appear anywhere, including word endings (bog', tog', dog')
  const reGStand = new RegExp(`^G(?:${AP}|["”«»]){1,2}$`, 'g')
  const reGStandLow = new RegExp(`^g(?:${AP}|["”«»]){1,2}$`, 'g')
  const reGUpper = new RegExp(`G(?:${AP}|["”«»]){1,2}`, 'gu')
  const reGLower = new RegExp(`g(?:${AP}|["”«»]){1,2}`, 'gu')

  res = res
    .replace(reGStand, 'Ğ')
    .replace(reGStandLow, 'ğ')
    .replace(reGUpper, 'Ğ')
    .replace(reGLower, 'ğ')

  return res
}

// Uzbek Cyrillic vowels (for context-aware е/Е conversion)
const CYR_VOWELS = 'АаЕеЁёИиОоУуЎўЭэЮюЯя'

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

  let res = word
    // Russian layout keyboard equivalents for Uzbek Cyrillic letters
    .replace(new RegExp(`У(?:${AP}|[ъЪ"”«»]){1,2}`, 'g'), 'Ö')
    .replace(new RegExp(`у(?:${AP}|[ъЪ"”«»]){1,2}`, 'g'), 'ö')
    .replace(/[Ӯ]/g, 'Ö')
    .replace(/[ӯ]/g, 'ö')
    .replace(new RegExp(`Г(?:${AP}|[ъЪ"”«»]){1,2}`, 'g'), 'Ğ')
    .replace(new RegExp(`г(?:${AP}|[ъЪ"”«»]){1,2}`, 'g'), 'ğ')
    .replace(new RegExp(`К(?:${AP}|[ъЪ"”«»]){1,2}`, 'g'), 'Q')
    .replace(new RegExp(`к(?:${AP}|[ъЪ"”«»]){1,2}`, 'g'), 'q')
    .replace(new RegExp(`Х(?:${AP}|[ъЪ"”«»]){1,2}`, 'g'), 'H')
    .replace(new RegExp(`х(?:${AP}|[ъЪ"”«»]){1,2}`, 'g'), 'h')

  // Context-aware Cyrillic Ц / ц transliteration according to Uzbek orthography:
  // 1) Word start before vowels: цирк -> sirk, цемент -> sement, цех -> sex, циркуль -> sirkul
  // 2) After Cyrillic consonants: акция -> aksiya, станция -> stansiya, концерт -> konsert, функция -> funksiya
  // 3) Elsewhere (primarily after vowels): конституция -> konstitutsiya, доцент -> dotsent
  const CYR_CONSONANTS = '[БВГДЖЗЙКЛМНПРСТФХЧШЩЪЬЎҚҒҲбвгджзйклмнпрстфхчшщъьўқғҳ]'
  res = res.replace(/^Ц/g, 'S').replace(/^ц/g, 's')
  res = res.replace(new RegExp(`(${CYR_CONSONANTS})[цЦ]`, 'g'), '$1s')

  // Hard/soft sign before е iotates it and is absorbed: объект→obyekt, премьера→premyera.
  res = res.replace(/[ъьЪЬ]([еЕ])/g, (_m, e: string) => (e === 'Е' ? 'Ye' : 'ye'))

  res = res.replace(/[Ее]/g, (match, offset, str) => {
    const prev = offset > 0 ? str[offset - 1] : null
    return cyrillicEConvert(match, prev)
  })

  for (const [pattern, replacement] of CYRILLIC_PAIRS) {
    res = res.replace(pattern, replacement)
  }

  return isAllCaps ? res.toLocaleUpperCase('uz-UZ') : res
}
