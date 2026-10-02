/**
 * Intelligent Uzbek Autocorrect & Orthographic Repair Engine
 * Automatically detects and fixes frequent spelling errors (h/x confusion, missing apostrophe,
 * false gemination/double consonants, common colloquialisms).
 */

export interface CorrectionFix {
  original: string
  corrected: string
}

// Map of canonical stem corrections (key: lowercase normalized error -> value: correct stem in Old Latin)
export const UZBEK_AUTOCORRECT_MAP: Record<string, string> = {
  // 1. H vs X confusion (Eng ko'p uchraydigan xatoliklar)
  xarakat: 'harakat',
  xayot: 'hayot',
  xatto: 'hatto',
  xurmat: 'hurmat',
  xurmatli: 'hurmatli',
  xavo: 'havo',
  xayvon: 'hayvon',
  xolva: 'holva',
  xaloyiq: 'haloyiq',
  xujjat: 'hujjat',
  xissiyot: 'hissiyot',
  xozir: 'hozir',
  xech: 'hech',
  xayron: 'hayron',
  muxim: 'muhim',
  raxmat: 'rahmat',
  shaxar: 'shahar',
  baxor: 'bahor',
  naxor: 'nahor',
  mashxur: 'mashhur',
  mexmon: 'mehmon',
  mexnat: 'mehnat',
  nasixat: 'nasihat',
  hursand: 'xursand',
  hursandchilik: 'xursandchilik',
  hizmat: 'xizmat',
  hizmatchi: 'xizmatchi',
  hafa: 'xafa',
  hamir: 'xamir',
  hushxabar: 'xushxabar',
  hushnud: 'xushnud',
  hushfel: "xushfe'l",
  "hushfe'l": "xushfe'l",
  sahiy: 'saxiy',
  sahiylik: 'saxiylik',
  baht: 'baxt',
  bahtli: 'baxtli',
  vaxt: 'vaqt',
  vaxti: 'vaqti',
  taht: 'taxt',
  pahta: 'paxta',

  // 2. Tutuq belgisi tushirib qoldirilgan xatolar (Missing apostrophe)
  etibor: "e'tibor",
  etiborli: "e'tiborli",
  malumot: "ma'lumot",
  malumotnoma: "ma'lumotnoma",
  talim: "ta'lim",
  mano: "ma'no",
  manoli: "ma'noli",
  taminot: "ta'minot",
  taminlash: "ta'minlash",
  tasir: "ta'sir",
  tasirli: "ta'sirli",
  elon: "e'lon",
  ezoz: "e'zoz",
  ezozlash: "e'zozlash",
  mojiza: "mo'jiza",
  mojaz: "mo'jaz",
  etirof: "e'tirof",
  sanat: "san'at",
  sanatkor: "san'atkor",
  sheriyat: "she'riyat",
  jurat: "jur'at",
  jurati: "jur'ati",
  marifat: "ma'rifat",
  maruza: "ma'ruza",
  masul: "mas'ul",
  masuliyat: "mas'uliyat",
  mutabar: "mo'tabar",
  taalluqli: "taalluqli",

  // 3. Qo'sh undosh / qisqartma imlo xatoliklari (Gemination)
  tashshakur: 'tashakkur',
  tashakur: 'tashakkur',
  muvafaqiyat: 'muvaffaqiyat',
  muvaffaqyat: 'muvaffaqiyat',
  muvafaqqiyat: 'muvaffaqiyat',
  tassurot: 'taassurot',
  taasurot: 'taassurot',
  tashabus: 'tashabbus',
  taraqiyot: 'taraqqiyot',
  gramatika: 'grammatika',
  milyon: 'million',
  milyard: 'milliard',
  inshalloh: 'inshaalloh',

  // 4. Ruscha so'zlashuv kalkalari (hujjat tiliga to'g'rilash)
  kamandirofka: 'komandirovka',
  zakas: 'buyurtma',
  spravka: "ma'lumotnoma",
  zayavka: 'ariza',
  vabshe: 'umuman',

  // 5. Kirillcha xato yozilgan shakllar
  харакат: 'harakat',
  хаёт: 'hayot',
  хатто: 'hatto',
  хурмат: 'hurmat',
  хурматли: 'hurmatli',
  хаво: 'havo',
  хайвон: 'hayvon',
  холва: 'holva',
  хужжат: 'hujjat',
  хозир: 'hozir',
  хеч: 'hech',
  хайрон: 'hayron',
  мухим: 'muhim',
  рахмат: 'rahmat',
  шахар: 'shahar',
  бахор: 'bahor',
  нахор: 'nahor',
  машхур: 'mashhur',
  мехмон: 'mehmon',
  мехнат: 'mehnat',
  насихат: 'nasihat',
  ҳурсанд: 'xursand',
  ҳизмат: 'xizmat',
  ҳафа: 'xafa',
  баҳт: 'baxt',
  вахт: 'vaqt',
  тахт: 'taxt',
  паҳта: 'paxta',
  этибор: "e'tibor",
  малумот: "ma'lumot",
  талим: "ta'lim",
  мано: "ma'no",
  таминот: "ta'minot",
  тасир: "ta'sir",
  элон: "e'lon",
  эъзоз: "e'zoz",
  можиза: "mo'jiza",
  этироф: "e'tirof",
  санат: "san'at",
  шерият: "she'riyat",
  ташшакур: 'tashakkur',
  ташаккур: 'tashakkur',
  мувафақият: 'muvaffaqiyat',
  тассурот: 'taassurot',
  ташабус: 'tashabbus',
  тарақиёт: 'taraqqiyot',
  мильон: 'million',
  милйон: 'million',
  милярд: 'milliard',
  справка: "ma'lumotnoma",
  заказ: 'buyurtma',
}

const COMMON_SUFFIXES = [
  'larimizdan',
  'laringizdan',
  'larimizga',
  'laringizga',
  'larimizda',
  'laringizda',
  'larimizni',
  'laringizni',
  'larimizning',
  'laringizning',
  'laridan',
  'lariga',
  'larida',
  'larini',
  'larining',
  'larimiz',
  'laringiz',
  'lari',
  'lar',
  'imizdan',
  'ingizdan',
  'imizga',
  'ingizga',
  'imizda',
  'ingizda',
  'imizni',
  'ingizni',
  'imizning',
  'ingizning',
  'sidan',
  'siga',
  'sida',
  'sini',
  'sining',
  'idan',
  'iga',
  'ida',
  'ini',
  'ining',
  'imdan',
  'imga',
  'imda',
  'imni',
  'imning',
  'ingdan',
  'ingga',
  'ingda',
  'ingni',
  'ingning',
  'ning',
  'dan',
  'dek',
  'day',
  'cha',
  'gacha',
  'qacha',
  'kacha',
  'ga',
  'ka',
  'qa',
  'da',
  'ni',
  'imiz',
  'ingiz',
  'si',
  'miz',
  'ngiz',
  'im',
  'ing',
  'i',
  'lik',
  'siz',
  'roq',
  'dir',
  'mi',
]

/**
 * Match source word capitalization (e.g. "Xarakat" -> "Harakat", "XARAKAT" -> "HARAKAT")
 */
export function matchCasing(source: string, target: string): string {
  if (!source || !target) return target
  const isUpper = source === source.toLocaleUpperCase('uz-UZ') && /[a-zA-Z\u0400-\u04FF]/.test(source)
  if (isUpper) return target.toLocaleUpperCase('uz-UZ')
  const isTitle = source[0] === source[0].toLocaleUpperCase('uz-UZ') && source.slice(1) === source.slice(1).toLocaleLowerCase('uz-UZ')
  if (isTitle) {
    return target[0].toLocaleUpperCase('uz-UZ') + target.slice(1)
  }
  return target
}

/**
 * Attempts to correct an individual word if it contains a known misspelling.
 * Suffix-aware: handles e.g. "xarakatlarimizda", "etiboriga", "malumotlar".
 * Returns null if no correction is needed.
 */
export function autocorrectWord(word: string): string | null {
  const clean = word.toLowerCase().replace(/[ʻ`ʼ‘’´′ʹʽ‛ˈ＇]/g, "'")

  // Exact match
  if (UZBEK_AUTOCORRECT_MAP[clean]) {
    const correctedStem = UZBEK_AUTOCORRECT_MAP[clean]
    return matchCasing(word, correctedStem)
  }

  // Suffix-aware match
  for (const suf of COMMON_SUFFIXES) {
    if (clean.endsWith(suf) && clean.length > suf.length + 2) {
      const stem = clean.slice(0, clean.length - suf.length)
      if (UZBEK_AUTOCORRECT_MAP[stem]) {
        const correctedStem = UZBEK_AUTOCORRECT_MAP[stem]
        const srcStem = word.slice(0, word.length - suf.length)
        const srcSuf = word.slice(word.length - suf.length)
        return matchCasing(srcStem, correctedStem) + srcSuf
      }
    }
  }

  return null
}

/**
 * Scans a text and returns unique corrections made by autocorrect.
 */
export function findAutocorrectionsInText(text: string): CorrectionFix[] {
  if (!text) return []
  const words = text.match(/[\p{L}\d'ʻ`ʼ‘’-]+/gu) ?? []
  const map = new Map<string, string>()

  for (const w of words) {
    const fixed = autocorrectWord(w)
    if (fixed && fixed.toLowerCase() !== w.toLowerCase()) {
      if (!map.has(w.toLowerCase())) {
        map.set(w.toLowerCase(), fixed)
      }
    }
  }

  return Array.from(map.entries()).map(([orig, corr]) => ({
    original: orig,
    corrected: corr,
  }))
}
