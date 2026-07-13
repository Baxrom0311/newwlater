'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Download, Loader2, X, UploadCloud, CheckCircle2, AlertCircle } from 'lucide-react'

type DetectedMode = 'old-latin' | 'cyrillic' | null
type FileStatus = 'idle' | 'converting' | 'done' | 'error'

interface ConvertFile {
  id: string
  file: File
  status: FileStatus
  progress: number
  resultUrl?: string
  resultName?: string
  detectedMode?: DetectedMode
  error?: string
}

const FREE_ACCEPT = {
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'text/plain': ['.txt'],
  'text/markdown': ['.md'],
  'text/csv': ['.csv'],
}
const PRO_ACCEPT = {
  ...FREE_ACCEPT,
  'application/pdf': ['.pdf'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'image/gif': ['.gif'],
  'image/bmp': ['.bmp'],
  'image/tiff': ['.tiff', '.tif'],
}

function extOf(name: string) {
  return name.split('.').pop()?.toLowerCase() ?? ''
}

function outLabel(name: string) {
  const e = extOf(name)
  if (e === 'docx') return '.docx'
  if (['pdf', 'jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'tiff', 'tif'].includes(e)) return '.txt'
  return `.${e}`
}

interface Props { plan: string; maxFileSizeMB: number }

export default function FileConverter({ plan, maxFileSizeMB }: Props) {
  const [items, setItems] = useState<ConvertFile[]>([])
  const router = useRouter()
  const isPro = plan === 'PRO' || plan === 'BUSINESS'

  const onDrop = useCallback((accepted: File[]) => {
    setItems(prev => [
      ...prev,
      ...accepted.map(f => ({
        id: crypto.randomUUID(),
        file: f, status: 'idle' as FileStatus, progress: 0,
      })),
    ])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: isPro ? PRO_ACCEPT : FREE_ACCEPT,
    maxSize: maxFileSizeMB * 1024 * 1024,
    onDropRejected: r => r.forEach(f => toast.error(`${f.file.name}: ${f.errors[0]?.message}`)),
  })

  const remove = (id: string) => {
    setItems(prev => {
      const it = prev.find(x => x.id === id)
      if (it?.resultUrl) URL.revokeObjectURL(it.resultUrl)
      return prev.filter(x => x.id !== id)
    })
  }

  const convert = async (id: string) => {
    const entry = items.find(x => x.id === id)
    if (!entry || entry.status === 'converting') return

    setItems(prev => prev.map(x => x.id === id ? { ...x, status: 'converting', progress: 15 } : x))

    const fd = new FormData()
    fd.append('file', entry.file)
    fd.append('mode', 'auto')

    const tick = setInterval(() => {
      setItems(prev => prev.map(x =>
        x.id === id && x.status === 'converting' && x.progress < 80
          ? { ...x, progress: x.progress + 8 }
          : x
      ))
    }, 350)

    try {
      const res = await fetch('/api/convert', { method: 'POST', body: fd })
      clearInterval(tick)

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Xato' }))
        if (res.status === 403) {
          toast.error(data.error, {
            action: { label: "Pro ga o'tish", onClick: () => router.push('/pricing') },
          })
        } else {
          toast.error(data.error ?? 'Xato yuz berdi')
        }
        throw new Error(data.error)
      }

      const blob = await res.blob()
      const disp = res.headers.get('Content-Disposition') ?? ''
      const name = disp.match(/filename="?([^";]+)"?/)?.[1] ?? 'natija.txt'
      const resultUrl = URL.createObjectURL(blob)
      const detectedMode = res.headers.get('X-Detected-Mode') as DetectedMode

      setItems(prev => prev.map(x =>
        x.id === id ? { ...x, status: 'done', progress: 100, resultUrl, resultName: name, detectedMode } : x
      ))
      toast.success(`${entry.file.name} tayyor!`)
      router.refresh()
    } catch {
      clearInterval(tick)
      setItems(prev => prev.map(x =>
        x.id === id ? { ...x, status: 'error', progress: 0 } : x
      ))
    }
  }

  const convertAll = () => {
    items.filter(x => x.status === 'idle' || x.status === 'error').forEach(x => convert(x.id))
  }

  const pendingCount = items.filter(x => x.status === 'idle' || x.status === 'error').length
  const converting = items.some(x => x.status === 'converting')

  return (
    <div className="space-y-3 p-3 sm:space-y-4 sm:p-5">

      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={`relative cursor-pointer rounded-[22px] border-2 border-dashed p-7 text-center transition-all duration-300 sm:rounded-[28px] sm:p-14 ${
          isDragActive
            ? 'border-blue-400 bg-blue-50/60 drop-pulse dark:bg-blue-950/30'
            : 'border-zinc-200 bg-zinc-50/44 hover:border-blue-200 hover:bg-blue-50/30 dark:border-zinc-800 dark:bg-zinc-900/48 dark:hover:border-blue-900/70 dark:hover:bg-blue-950/18'
        }`}
      >
        <input {...getInputProps()} />
        <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl transition-colors duration-300 ${
          isDragActive ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300' : 'bg-white text-zinc-300 shadow-sm dark:bg-zinc-800 dark:text-zinc-500'
        }`}>
          <UploadCloud className="h-8 w-8" />
        </div>
        <p className="mb-1 text-lg font-black text-zinc-800 dark:text-zinc-100 sm:text-xl">
          {isDragActive ? "Qo'yib yuboring" : 'Fayllarni tashlang'}
        </p>
        <p className="text-sm font-bold text-zinc-600 dark:text-zinc-400">
          {isPro ? 'DOCX · PDF · TXT · Rasm' : 'DOCX · TXT'} · max {maxFileSizeMB} MB
        </p>
      </div>

      {/* File list */}
      {items.length > 0 && (
        <div className="space-y-2">
          {items.map(item => (
            <div
              key={item.id}
              className="group flex flex-col gap-3 rounded-2xl border border-zinc-100 bg-white px-4 py-4 transition-colors hover:border-blue-100 dark:border-zinc-800 dark:bg-zinc-900/72 dark:hover:border-blue-900/60 sm:flex-row sm:items-center"
            >
              {/* Filename + meta */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="max-w-[260px] truncate text-sm font-black text-zinc-800 dark:text-zinc-100">
                    {item.file.name}
                  </span>
                  <span className="text-xs font-black text-zinc-500 dark:text-zinc-500">→ {outLabel(item.file.name)}</span>
                  {item.detectedMode && (
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                      item.detectedMode === 'cyrillic'
                        ? 'bg-orange-50 text-orange-600 dark:bg-orange-950/36 dark:text-orange-300'
                        : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/36 dark:text-indigo-300'
                    }`}>
                      {item.detectedMode === 'cyrillic' ? 'Kirill' : 'Lotin'}
                    </span>
                  )}
                </div>

                {/* Progress bar */}
                {item.status === 'converting' && (
                  <div className="mt-1.5 h-0.5 bg-zinc-100 rounded-full overflow-hidden dark:bg-zinc-800">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all duration-300"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex shrink-0 items-center gap-2">
                {item.status === 'idle' && (
                  <button
                    onClick={() => convert(item.id)}
                    className="btn-border h-9 rounded-xl border border-zinc-200 bg-white px-4 text-xs font-black text-zinc-600 transition-colors hover:border-blue-200 hover:text-blue-700 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:border-blue-800 dark:hover:text-blue-300"
                  >
                    Konvert
                  </button>
                )}
                {item.status === 'converting' && (
                  <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                )}
                {item.status === 'done' && item.resultUrl && (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <a href={item.resultUrl} download={item.resultName}>
                      <button className="btn-border shine flex h-9 items-center gap-1 rounded-xl bg-green-600 px-4 text-xs font-black text-white transition-colors hover:bg-green-700">
                        <Download className="w-3 h-3" />
                        Yuklab olish
                      </button>
                    </a>
                  </>
                )}
                {item.status === 'error' && (
                  <>
                    <AlertCircle className="w-4 h-4 text-red-400" />
                    <button
                      onClick={() => convert(item.id)}
                      className="h-9 rounded-xl border border-red-200 px-4 text-xs font-black text-red-500 transition-colors hover:bg-red-50 dark:border-red-900/70 dark:hover:bg-red-950/30"
                    >
                      Qayta
                    </button>
                  </>
                )}
                <button
                  onClick={() => remove(item.id)}
                  className="rounded-lg p-1 text-zinc-300 opacity-100 transition-all hover:text-zinc-600 dark:text-zinc-600 dark:hover:text-zinc-300 sm:opacity-0 sm:group-hover:opacity-100"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}

          {pendingCount > 0 && (
            <button
              onClick={convertAll}
              disabled={converting}
              className="btn-border shine flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 text-sm font-black text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
            >
              {converting
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Konvertatsiya qilinmoqda...</>
                : `Hammasini konvertatsiya qilish (${pendingCount})`
              }
            </button>
          )}
        </div>
      )}
    </div>
  )
}
