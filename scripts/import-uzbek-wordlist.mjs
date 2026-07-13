import { createScriptPrismaClient } from './prisma-client.mjs'

const prisma = createScriptPrismaClient()

const SOURCE = 'kmashrab/uzbek-wordlist'
const LICENSE = 'GPL-2.0'
const WORDLIST_URLS = [
  'https://raw.githubusercontent.com/kmashrab/uzbek-wordlist/master/uzbek.wordlist',
  'https://raw.githubusercontent.com/kmashrab/uzbek-wordlist/master/unsorted.wordlist',
]
const BLACKLIST_URL =
  'https://raw.githubusercontent.com/kmashrab/uzbek-wordlist/master/blacklist.wordlist'

function normalizeWord(value) {
  return value
    .trim()
    .toLocaleLowerCase('uz-UZ')
    .replace(/[ʻ‘’`ʼ]/g, "'")
}

function detectScript(word) {
  if (/[А-ЯЁа-яёЎўҚқҒғҲҳ]/.test(word)) return 'CYRILLIC'
  if (/[ŞşÇçÖöĞğ]/.test(word)) return 'NEW_LATIN'
  if (/[A-Za-z]/.test(word)) return 'OLD_LATIN'
  return 'MIXED'
}

function convertCyrillicToOldLatin(word) {
  return word
    .replace(/Ё/g, 'Yo').replace(/ё/g, 'yo')
    .replace(/Ю/g, 'Yu').replace(/ю/g, 'yu')
    .replace(/Я/g, 'Ya').replace(/я/g, 'ya')
    .replace(/Ч/g, 'Ch').replace(/ч/g, 'ch')
    .replace(/Ш/g, 'Sh').replace(/ш/g, 'sh')
    .replace(/Ў/g, "O'").replace(/ў/g, "o'")
    .replace(/Ғ/g, "G'").replace(/ғ/g, "g'")
    .replace(/Қ/g, 'Q').replace(/қ/g, 'q')
    .replace(/Ҳ/g, 'H').replace(/ҳ/g, 'h')
    .replace(/А/g, 'A').replace(/а/g, 'a')
    .replace(/Б/g, 'B').replace(/б/g, 'b')
    .replace(/В/g, 'V').replace(/в/g, 'v')
    .replace(/Г/g, 'G').replace(/г/g, 'g')
    .replace(/Д/g, 'D').replace(/д/g, 'd')
    .replace(/Е/g, 'E').replace(/е/g, 'e')
    .replace(/Ж/g, 'J').replace(/ж/g, 'j')
    .replace(/З/g, 'Z').replace(/з/g, 'z')
    .replace(/И/g, 'I').replace(/и/g, 'i')
    .replace(/Й/g, 'Y').replace(/й/g, 'y')
    .replace(/К/g, 'K').replace(/к/g, 'k')
    .replace(/Л/g, 'L').replace(/л/g, 'l')
    .replace(/М/g, 'M').replace(/м/g, 'm')
    .replace(/Н/g, 'N').replace(/н/g, 'n')
    .replace(/О/g, 'O').replace(/о/g, 'o')
    .replace(/П/g, 'P').replace(/п/g, 'p')
    .replace(/Р/g, 'R').replace(/р/g, 'r')
    .replace(/С/g, 'S').replace(/с/g, 's')
    .replace(/Т/g, 'T').replace(/т/g, 't')
    .replace(/У/g, 'U').replace(/у/g, 'u')
    .replace(/Ф/g, 'F').replace(/ф/g, 'f')
    .replace(/Х/g, 'X').replace(/х/g, 'x')
    .replace(/Э/g, 'E').replace(/э/g, 'e')
    .replace(/Ц/g, 'Ts').replace(/ц/g, 'ts')
    .replace(/[Ъъ]/g, "'")
    .replace(/[Ьь]/g, '')
}

function convertOldLatinToNewLatin(word) {
  return word
    .replace(/SH/g, 'Ş').replace(/Sh/g, 'Ş').replace(/sh/g, 'ş')
    .replace(/CH/g, 'Ç').replace(/Ch/g, 'Ç').replace(/ch/g, 'ç')
    .replace(/O['ʻ‘’`ʼ]/g, 'Ö').replace(/o['ʻ‘’`ʼ]/g, 'ö')
    .replace(/G['ʻ‘’`ʼ]/g, 'Ğ').replace(/g['ʻ‘’`ʼ]/g, 'ğ')
}

function addUnique(unique, word, script) {
  const normalized = normalizeWord(word)
  if (!normalized) return
  unique.set(`${normalized}:${script}`, {
    word,
    normalized,
    script,
    source: SOURCE,
    license: LICENSE,
  })
}

async function readRemoteLines(url) {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.status}`)
  const text = await response.text()
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
}

async function readFirstAvailableRemoteLines(urls) {
  const errors = []
  for (const url of urls) {
    try {
      return await readRemoteLines(url)
    } catch (error) {
      errors.push(error)
    }
  }
  throw errors[errors.length - 1]
}

async function main() {
  const [words, blacklist] = await Promise.all([
    readFirstAvailableRemoteLines(WORDLIST_URLS),
    readRemoteLines(BLACKLIST_URL).catch(() => []),
  ])
  const blocked = new Set(blacklist.map(normalizeWord))
  const unique = new Map()

  for (const word of words) {
    const normalized = normalizeWord(word)
    if (!normalized || blocked.has(normalized)) continue
    const script = detectScript(word)
    addUnique(unique, word, script)

    if (script === 'CYRILLIC') {
      const oldLatin = convertCyrillicToOldLatin(word)
      addUnique(unique, oldLatin, 'OLD_LATIN')
      addUnique(unique, convertOldLatinToNewLatin(oldLatin), 'NEW_LATIN')
    } else if (script === 'OLD_LATIN') {
      addUnique(unique, convertOldLatinToNewLatin(word), 'NEW_LATIN')
    }
  }

  const rows = [...unique.values()]
  const batchSize = 1000
  let imported = 0
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize)
    const result = await prisma.uzbekDictionaryWord.createMany({
      data: batch,
      skipDuplicates: true,
    })
    imported += result.count
  }

  console.log(`Imported ${imported} Uzbek dictionary words from ${SOURCE}`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
