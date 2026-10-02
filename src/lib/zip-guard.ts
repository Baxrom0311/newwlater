import type JSZip from 'jszip'

// Caps on decompressed size to blunt zip-bomb / decompression-bomb DoS: a small
// upload can otherwise inflate to gigabytes of XML and OOM the function.
const MAX_ENTRY_BYTES = 80 * 1024 * 1024
const MAX_TOTAL_BYTES = 200 * 1024 * 1024

const BOMB_ERROR = 'Fayl haddan tashqari katta ochiladi (himoya).'

/**
 * Check a zip entry's declared uncompressed size BEFORE inflating it. Throws if
 * a single entry or the running total exceeds the cap. Uses JSZip's stored
 * metadata; if unavailable, this is a no-op (best effort).
 */
export function assertEntrySafe(file: JSZip.JSZipObject, running: { total: number }): void {
  const meta = file as unknown as { _data?: { uncompressedSize?: number } }
  const size = meta._data?.uncompressedSize
  if (typeof size !== 'number') return
  if (size > MAX_ENTRY_BYTES) throw new Error(BOMB_ERROR)
  running.total += size
  if (running.total > MAX_TOTAL_BYTES) throw new Error(BOMB_ERROR)
}
