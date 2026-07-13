import { prisma } from './prisma'

const CACHE_TTL_MS = 10 * 60 * 1000
const MAX_CACHE_SIZE = 5000
const cache = new Map<string, { value: boolean; expiresAt: number }>()

export function normalizeDictionaryWord(value: string): string {
  return value
    .trim()
    .toLocaleLowerCase('uz-UZ')
    .replace(/[ʻ‘’`ʼ]/g, "'")
}

function getCached(key: string): boolean | null {
  const cached = cache.get(key)
  if (!cached) return null
  if (cached.expiresAt < Date.now()) {
    cache.delete(key)
    return null
  }
  return cached.value
}

function setCached(key: string, value: boolean) {
  if (cache.size >= MAX_CACHE_SIZE) {
    const firstKey = cache.keys().next().value
    if (firstKey) cache.delete(firstKey)
  }
  cache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS })
}

export async function isKnownUzbekWord(word: string): Promise<boolean> {
  const normalized = normalizeDictionaryWord(word)
  if (!normalized) return false

  const cached = getCached(normalized)
  if (cached !== null) return cached

  const found = await prisma.uzbekDictionaryWord.findFirst({
    where: { normalized },
    select: { id: true },
  })
  const value = Boolean(found)
  setCached(normalized, value)
  return value
}

export async function filterKnownUzbekWords(words: string[]): Promise<Set<string>> {
  const normalizedWords = [...new Set(words.map(normalizeDictionaryWord).filter(Boolean))]
  const known = new Set<string>()
  const missing: string[] = []

  for (const word of normalizedWords) {
    const cached = getCached(word)
    if (cached === true) known.add(word)
    else if (cached === null) missing.push(word)
  }

  if (missing.length > 0) {
    const rows = await prisma.uzbekDictionaryWord.findMany({
      where: { normalized: { in: missing } },
      select: { normalized: true },
    })
    const found = new Set(rows.map((row) => row.normalized))
    for (const word of missing) {
      const value = found.has(word)
      setCached(word, value)
      if (value) known.add(word)
    }
  }

  return known
}
