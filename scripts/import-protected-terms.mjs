import fs from 'node:fs/promises'
import path from 'node:path'
import { createScriptPrismaClient } from './prisma-client.mjs'

const prisma = createScriptPrismaClient()

function normalize(value) {
  return value
    .trim()
    .toLocaleLowerCase('uz-UZ')
    .replace(/[ʻ‘’`ʼ]/g, "'")
}

function parseArgs() {
  const file = process.argv[2]
  if (!file) {
    throw new Error('Usage: npm run protected:import -- path/to/protected-terms.txt')
  }
  return path.resolve(file)
}

async function readTerms(filePath) {
  const text = await fs.readFile(filePath, 'utf8')
  return [
    ...new Set(
      text
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith('#'))
    ),
  ]
}

async function main() {
  const filePath = parseArgs()
  const terms = await readTerms(filePath)
  const source = path.relative(process.cwd(), filePath)

  let imported = 0
  for (const term of terms) {
    await prisma.protectedTerm.upsert({
      where: { normalized: normalize(term) },
      update: {
        term,
        active: true,
        reason: 'Imported protected term',
        source,
      },
      create: {
        term,
        normalized: normalize(term),
        reason: 'Imported protected term',
        source,
      },
    })
    imported += 1
  }

  console.log(`Imported ${imported} protected terms from ${source}`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
