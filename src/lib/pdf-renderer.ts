type RenderedPage = {
  pageNumber: number
  png: Buffer
  width: number
  height: number
}

type PdfViewport = { width: number; height: number }
type PdfPage = {
  getViewport: (opts: { scale: number }) => PdfViewport
  render: (opts: Record<string, unknown>) => { promise: Promise<void> }
  cleanup?: () => void
}
type PdfDocument = {
  numPages: number
  getPage: (n: number) => Promise<PdfPage>
  destroy?: () => Promise<void>
}
type PdfjsModule = {
  getDocument: (opts: Record<string, unknown>) => { promise: Promise<PdfDocument> }
}

// Hard cap so a huge scanned PDF can't render hundreds of full-resolution
// bitmaps into memory / blow the function time limit.
export const MAX_RENDER_PAGES = 50

/**
 * Render PDF pages to PNG one at a time (async generator) so the caller can
 * embed/OCR each page and drop it before the next is rendered — instead of
 * holding every page bitmap in memory at once.
 *
 * @napi-rs/canvas and pdfjs-dist are declared dependencies and listed in
 * serverExternalPackages, so a normal dynamic import is traced into the build.
 */
export async function* renderPdfPages(
  buffer: Buffer,
  scale = 2,
  maxPages = MAX_RENDER_PAGES
): AsyncGenerator<RenderedPage> {
  const canvasApi = await import('@napi-rs/canvas')
  // pdfjs expects these DOM globals; @napi-rs/canvas provides compatible impls
  // whose types don't structurally match lib.dom, so assign through an untyped
  // record.
  const globalObject = globalThis as unknown as Record<string, unknown>
  globalObject.DOMMatrix ??= canvasApi.DOMMatrix as unknown
  globalObject.DOMPoint ??= canvasApi.DOMPoint as unknown
  globalObject.DOMRect ??= canvasApi.DOMRect as unknown
  globalObject.ImageData ??= canvasApi.ImageData as unknown
  globalObject.Path2D ??= canvasApi.Path2D as unknown

  const pdfjs = (await import('pdfjs-dist/legacy/build/pdf.mjs')) as unknown as PdfjsModule
  const { createCanvas } = canvasApi

  const loadingTask = pdfjs.getDocument({
    data: new Uint8Array(buffer),
    disableWorker: true,
    useSystemFonts: true,
  })
  const pdf = await loadingTask.promise

  try {
    const pageCount = Math.min(pdf.numPages, maxPages)
    for (let pageNumber = 1; pageNumber <= pageCount; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber)
      const viewport = page.getViewport({ scale })
      const canvas = createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height))
      const context = canvas.getContext('2d')

      await page.render({ canvasContext: context, viewport, canvas }).promise

      yield {
        pageNumber,
        png: canvas.toBuffer('image/png'),
        width: viewport.width,
        height: viewport.height,
      }

      page.cleanup?.()
    }
  } finally {
    if (typeof pdf.destroy === 'function') await pdf.destroy()
  }
}
