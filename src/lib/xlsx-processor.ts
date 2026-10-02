import JSZip from 'jszip'
import { prewarmDictionary } from './async-converter'
import { convertContainers } from './xml-text-runs'
import { assertEntrySafe } from './zip-guard'
import { type ConversionMode, type ConversionOptions } from './converter'

const SHARED_STRINGS = /^xl\/sharedStrings\.xml$/i
const WORKSHEET = /^xl\/worksheets\/sheet\d+\.xml$/i
const XLSX_TEXT_XML = /^xl\/(sharedStrings\.xml|worksheets\/sheet\d+\.xml)$/i

export async function processXlsx(
  buffer: Buffer,
  mode: ConversionMode,
  options: ConversionOptions = {}
): Promise<Buffer> {
  const zip = await JSZip.loadAsync(buffer)
  const paths = Object.keys(zip.files).filter((path) => XLSX_TEXT_XML.test(path))

  const running = { total: 0 }
  for (const path of paths) {
    const file = zip.file(path)
    if (!file) continue
    assertEntrySafe(file, running)
    const content = await file.async('text')
    await prewarmDictionary(content.replace(/<[^>]+>/g, ' '))
    // sharedStrings wrap runs in <si>; worksheet inline strings wrap them in <is>.
    // Joining runs per container converts digraphs split across rich-text runs.
    const container = SHARED_STRINGS.test(path) ? 'si' : WORKSHEET.test(path) ? 'is' : 'si'
    const result = await convertContainers(content, container, { textTag: 't', preserveSpace: true }, mode, options)
    zip.file(path, result)
  }

  return zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  })
}
