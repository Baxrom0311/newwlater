const fs = require('node:fs')
const ts = require('typescript')

require.extensions['.ts'] = function compileTs(module, filename) {
  const source = fs.readFileSync(filename, 'utf8')
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
      resolveJsonModule: true,
    },
  }).outputText
  module._compile(output, filename)
}

const { convertText, extractLatinConversionCandidates } = require('../src/lib/converter.ts')

const cases = [
  {
    name: 'old latin mechanical conversion',
    input: "shirin choy va g'alla",
    mode: 'old-latin',
    expected: 'şirin çoy va ğalla',
  },
  {
    name: 'protected english terms stay unchanged',
    input: 'shopping check ChatGPT https://example.com/sh',
    mode: 'old-latin',
    expected: 'shopping check ChatGPT https://example.com/sh',
  },
  {
    name: 'seed exception applies',
    input: "mo'jiza va O'zbekiston",
    mode: 'old-latin',
    expected: 'mojiza va Özbekiston',
  },
  {
    name: 'cyrillic conversion',
    input: 'Ширин чой ва ғалла',
    mode: 'cyrillic',
    expected: 'Şirin çoy va ğalla',
  },
]

let failed = 0
for (const test of cases) {
  const actual = convertText(test.input, test.mode)
  if (actual !== test.expected) {
    failed += 1
    console.error(`FAIL ${test.name}`)
    console.error(`  expected: ${test.expected}`)
    console.error(`  actual:   ${actual}`)
  }
}

const candidates = extractLatinConversionCandidates('shirin choy shopping check https://site.uz/sh')
const expectedCandidates = ['shirin', 'choy', 'shopping', 'check']
if (JSON.stringify(candidates) !== JSON.stringify(expectedCandidates)) {
  failed += 1
  console.error('FAIL candidate extraction')
  console.error(`  expected: ${expectedCandidates.join(', ')}`)
  console.error(`  actual:   ${candidates.join(', ')}`)
}

if (failed > 0) process.exit(1)
console.log(`Converter checks passed (${cases.length + 1})`)
