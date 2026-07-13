type RenderedPage = {
  pageNumber: number
  png: Buffer
  width: number
  height: number
}

export async function renderPdfPages(buffer: Buffer, scale = 2): Promise<RenderedPage[]> {
  const runtimeImport = new Function('specifier', 'return import(specifier)') as <T>(specifier: string) => Promise<T>
  const canvasApi = await runtimeImport<{
    createCanvas: (width: number, height: number) => any
    DOMMatrix: typeof DOMMatrix
    DOMPoint: typeof DOMPoint
    DOMRect: typeof DOMRect
    ImageData: typeof ImageData
    Path2D: typeof Path2D
  }>('@napi-rs/canvas')
  const globalObject = globalThis as typeof globalThis & Record<string, unknown>
  globalObject.DOMMatrix ??= canvasApi.DOMMatrix
  globalObject.DOMPoint ??= canvasApi.DOMPoint
  globalObject.DOMRect ??= canvasApi.DOMRect
  globalObject.ImageData ??= canvasApi.ImageData
  globalObject.Path2D ??= canvasApi.Path2D

  const pdfjs = await runtimeImport<{ getDocument: (options: Record<string, unknown>) => { promise: Promise<any> } }>('pdfjs-dist/legacy/build/pdf.mjs')
  const { createCanvas } = canvasApi

  const loadingTask = pdfjs.getDocument({
    data: new Uint8Array(buffer),
    disableWorker: true,
    useSystemFonts: true,
  })
  const pdf = await loadingTask.promise
  const pages: RenderedPage[] = []

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber)
    const viewport = page.getViewport({ scale })
    const canvas = createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height))
    const context = canvas.getContext('2d')

    await page.render({
      canvasContext: context,
      viewport,
      canvas,
    }).promise

    pages.push({
      pageNumber,
      png: canvas.toBuffer('image/png'),
      width: viewport.width,
      height: viewport.height,
    })
  }

  if (typeof pdf.destroy === 'function') await pdf.destroy()
  return pages
}
