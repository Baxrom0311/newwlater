import { prisma } from './prisma'
import type { ConversionMode } from './converter'
import type { WordRule } from './conversion-rules'

type DbRules = {
  exceptions: WordRule[]
  protectedTerms: string[]
}

const CACHE_TTL_MS = 5 * 60 * 1000
let cachedRules: { expiresAt: number; value: DbRules } | null = null

function directionForMode(mode: ConversionMode) {
  return mode === 'old-latin' ? 'OLD_LATIN_TO_NEW' : 'CYRILLIC_TO_NEW'
}

export async function getDbConversionRules(mode: ConversionMode): Promise<DbRules> {
  if (cachedRules && cachedRules.expiresAt > Date.now()) return cachedRules.value

  const direction = directionForMode(mode)
  const [exceptions, protectedTerms] = await Promise.all([
    prisma.conversionException.findMany({
      where: {
        active: true,
        OR: [{ direction }, { direction: 'ANY' }],
      },
      select: { from: true, to: true },
    }),
    prisma.protectedTerm.findMany({
      where: { active: true },
      select: { term: true },
    }),
  ])

  const value = {
    exceptions: exceptions.map((rule) => ({ from: rule.from, to: rule.to })),
    protectedTerms: protectedTerms.map((term) => term.term),
  }
  cachedRules = { value, expiresAt: Date.now() + CACHE_TTL_MS }
  return value
}
