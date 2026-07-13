import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createScriptPrismaClient } from './prisma-client.mjs'

const prisma = createScriptPrismaClient()
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const seedPath = path.join(__dirname, '..', 'data', 'conversion-rules.seed.json')

function normalize(value) {
  return value
    .trim()
    .toLocaleLowerCase('uz-UZ')
    .replace(/[ʻ‘’`ʼ]/g, "'")
}

async function main() {
  const seed = JSON.parse(await fs.readFile(seedPath, 'utf8'))

  const exceptionResults = await Promise.all(
    seed.oldLatinWordRules.map((rule) =>
      prisma.conversionException.upsert({
        where: {
          normalized_direction: {
            normalized: normalize(rule.from),
            direction: 'OLD_LATIN_TO_NEW',
          },
        },
        update: {
          from: rule.from,
          to: rule.to,
          active: true,
          reason: 'Seeded old Latin spelling exception',
          source: 'data/conversion-rules.seed.json',
        },
        create: {
          from: rule.from,
          to: rule.to,
          normalized: normalize(rule.from),
          direction: 'OLD_LATIN_TO_NEW',
          reason: 'Seeded old Latin spelling exception',
          source: 'data/conversion-rules.seed.json',
        },
      })
    )
  )

  const protectedResults = await Promise.all(
    seed.protectedTerms.map((term) =>
      prisma.protectedTerm.upsert({
        where: { normalized: normalize(term) },
        update: {
          term,
          active: true,
          reason: 'Seeded protected term',
          source: 'data/conversion-rules.seed.json',
        },
        create: {
          term,
          normalized: normalize(term),
          reason: 'Seeded protected term',
          source: 'data/conversion-rules.seed.json',
        },
      })
    )
  )

  console.log(
    `Seeded ${exceptionResults.length} conversion exceptions and ${protectedResults.length} protected terms`
  )
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
