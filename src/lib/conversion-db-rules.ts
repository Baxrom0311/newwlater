import { prisma } from './prisma'
import type { ConversionDirection } from '@prisma/client'
import type { ConversionMode } from './converter'
import type { WordRule } from './conversion-rules'

type DbRules = {
  exceptions: WordRule[]
  protectedTerms: string[]
}

const CACHE_TTL_MS = 5 * 60 * 1000
// Keyed by direction — a Cyrillic conversion must not serve its exceptions to an
// old-Latin conversion (or vice versa).
const cachedRules = new Map<string, { expiresAt: number; value: DbRules }>()

function directionsForMode(mode: ConversionMode): ConversionDirection[] {
  if (mode === 'old-latin') return ['OLD_LATIN_TO_NEW', 'ANY']
  if (mode === 'cyrillic') return ['CYRILLIC_TO_NEW', 'ANY']
  return ['ANY']
}

export async function getDbConversionRules(mode: ConversionMode): Promise<DbRules> {
  const directions = directionsForMode(mode)
  const cacheKey = directions.join('|')
  const cached = cachedRules.get(cacheKey)
  if (cached && cached.expiresAt > Date.now()) return cached.value

  const [exceptions, protectedTerms] = await Promise.all([
    prisma.conversionException.findMany({
      where: {
        active: true,
        direction: { in: directions },
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
  cachedRules.set(cacheKey, { value, expiresAt: Date.now() + CACHE_TTL_MS })
  return value
}
