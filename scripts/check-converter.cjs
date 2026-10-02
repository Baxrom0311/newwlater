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
    expected: "mö'jiza va Özbekiston",
  },
  {
    name: 'cyrillic conversion',
    input: 'Ширин чой ва ғалла',
    mode: 'cyrillic',
    expected: 'Şirin çoy va ğalla',
  },
  {
    name: 'curly apostrophe U+2019 converts',
    input: 'o’zbek tili va g’alla',
    mode: 'old-latin',
    expected: 'özbek tili va ğalla',
  },
  {
    name: 'curly apostrophe U+2018 converts',
    input: 'o‘zbek va g‘alla',
    mode: 'old-latin',
    expected: 'özbek va ğalla',
  },
  {
    name: 'backtick apostrophe (letter-adjacent) converts, not treated as code',
    input: 'o`zbek tili va g`alla shirin',
    mode: 'old-latin',
    expected: 'özbek tili va ğalla şirin',
  },
  {
    name: 'acute accent apostrophe U+00B4 converts',
    input: 'o´zbek tili va g´alla',
    mode: 'old-latin',
    expected: 'özbek tili va ğalla',
  },
  {
    name: 'prime apostrophe U+2032 converts',
    input: 'o′zbek tili va g′alla',
    mode: 'old-latin',
    expected: 'özbek tili va ğalla',
  },
  {
    name: 'double apostrophe cleans up',
    input: "o''zbek va g''alla",
    mode: 'old-latin',
    expected: 'özbek va ğalla',
  },
  {
    name: 'double quote typed via Russian shift+2 converts',
    input: 'o"zbek va g"alla',
    mode: 'old-latin',
    expected: 'özbek va ğalla',
  },
  {
    name: 'precomposed accented letters ó and õ convert',
    input: 'Ózbekiston va õzbek',
    mode: 'old-latin',
    expected: 'Özbekiston va özbek',
  },
  {
    name: 'words ending in g apostrophe convert',
    input: "bog' va tog' va to'g'ri",
    mode: 'old-latin',
    expected: 'boğ va toğ va töğri',
  },
  {
    name: 'cyrillic with russian layout apostrophes converts',
    input: "у'збек ва г'алла ту'г'ри бог'",
    mode: 'cyrillic',
    expected: 'özbek va ğalla töğri boğ',
  },
  {
    name: 'single quotes around english words preserved',
    input: "U 'marketing' va 'pro' va 'o'zbek' va 'bog'' dedi",
    mode: 'old-latin',
    expected: "U 'marketing' va 'pro' va 'özbek' va 'boğ' dedi",
  },
  {
    name: 'new latin to old latin reverse conversion',
    input: 'şirin çoy va ğalla hamda özbek',
    mode: 'new-latin',
    expected: "shirin choy va g'alla hamda o'zbek",
  },
  {
    name: 'uppercase and mixed casing',
    input: 'SHIRIN Choy CHIROQ',
    mode: 'old-latin',
    expected: 'ŞIRIN Çoy ÇIROQ',
  },
  {
    name: 'mixed script document converts both',
    input: 'Ширин shirin va ғалла',
    mode: 'old-latin',
    expected: 'Şirin şirin va ğalla',
  },
  {
    name: 'protected brand keeps suffix attached (agglutination)',
    input: 'ChatGPTda ishladim',
    mode: 'old-latin',
    expected: 'ChatGPTda işladim',
  },
  {
    name: 'cyrillic hard/soft sign before е iotates (объект→obyekt)',
    input: 'объект субъект премьера',
    mode: 'cyrillic',
    expected: 'obyekt subyekt premyera',
  },
  {
    name: 's+h non-digraph exception words are not converted',
    input: 'Ishoq mushaf oldi',
    mode: 'old-latin',
    expected: 'Ishoq mushaf oldi',
  },
  {
    name: 'protected term with -qa suffix remains unchanged',
    input: 'Ishoqqa kitob berdim',
    mode: 'old-latin',
    expected: 'Ishoqqa kitob berdim',
  },
  {
    name: 'cyrillic ts at word start converts to s',
    input: 'цирк цех цемент',
    mode: 'cyrillic',
    expected: 'sirk sex sement',
  },
  {
    name: 'cyrillic ts after consonants converts to s',
    input: 'акция станция концерт функция лекция',
    mode: 'cyrillic',
    expected: 'aksiya stansiya konsert funksiya leksiya',
  },
  {
    name: 'cyrillic ts after vowels converts to ts',
    input: 'конституция доцент лицей',
    mode: 'cyrillic',
    expected: 'konstitutsiya dotsent litsey',
  },
  {
    name: 'autocorrect h/x confusion and missing apostrophe',
    input: 'xarakat xayot etibor malumot raxmat baxor',
    mode: 'old-latin',
    expected: "harakat hayot e'tibor ma'lumot rahmat bahor",
  },
  {
    name: 'autocorrect with agglutinative suffixes and capitalization',
    input: 'Xarakatlarimizga va etiboringizga tashshakur',
    mode: 'old-latin',
    expected: "Harakatlarimizga va e'tiboringizga taşakkur",
  },
  {
    name: 'autocorrect cyrillic misspellings',
    input: 'мухим малумот ва рахмат',
    mode: 'cyrillic',
    expected: "muhim ma'lumot va rahmat",
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

// Idempotency: converting already-converted text must not corrupt it.
const once = convertText("o’zbek shirin choy g’alla", 'old-latin')
const twice = convertText(once, 'old-latin')
if (once !== twice) {
  failed += 1
  console.error('FAIL idempotency')
  console.error(`  once:  ${once}`)
  console.error(`  twice: ${twice}`)
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
console.log(`Converter checks passed (${cases.length + 2})`)
