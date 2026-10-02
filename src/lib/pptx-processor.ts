import JSZip from 'jszip'
import { prewarmDictionary } from './async-converter'
import { convertContainers } from './xml-text-runs'
import { assertEntrySafe } from './zip-guard'
import { type ConversionMode, type ConversionOptions } from './converter'

const PPTX_TEXT_XML = /^ppt\/(slides|notesSlides|slideLayouts|slideMasters)\/.*\.xml$/i

export async function processPptx(
  buffer: Buffer,
  mode: ConversionMode,
  options: ConversionOptions = {}
): Promise<Buffer> {
  const zip = await JSZip.loadAsync(buffer)
  const paths = Object.keys(zip.files).filter((path) => PPTX_TEXT_XML.test(path))

  const running = { total: 0 }
  for (const path of paths) {
    const file = zip.file(path)
    if (!file) continue
    assertEntrySafe(file, running)
    const content = await file.async('text')
    await prewarmDictionary(content.replace(/<[^>]+>/g, ' '))
    // Join <a:t> runs per <a:p> paragraph so digraphs split across runs convert.
    const result = await convertContainers(content, 'a:p', { textTag: 'a:t', breakTag: 'a:br' }, mode, options)
    zip.file(path, result)
  }

  return zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  })
}
