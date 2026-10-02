import { readFile } from 'node:fs/promises'
import path from 'node:path'

let cached: Buffer | null = null

/**
 * Unicode TTF (Liberation Sans) used to draw converted text onto scanned PDFs.
 * The standard PDF fonts (Helvetica/WinAnsi) cannot encode ş/ğ, which are the
 * whole point of the conversion. The file is shipped in public/fonts and copied
 * into the standalone output by the build script.
 */
export async function loadUnicodeFont(): Promise<Buffer> {
  if (cached) return cached
  const fontPath = path.join(process.cwd(), 'public', 'fonts', 'LiberationSans-Regular.ttf')
  cached = await readFile(fontPath)
  return cached
}
