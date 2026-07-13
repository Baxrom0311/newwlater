import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin'
import {
  addConversionException,
  addProtectedTerm,
  toggleConversionException,
  toggleProtectedTerm,
} from './actions'

export default async function AdminRulesPage() {
  await requireAdmin()

  const [stats, exceptions, protectedTerms] = await Promise.all([
    Promise.all([
      prisma.uzbekDictionaryWord.count(),
      prisma.conversionException.count(),
      prisma.protectedTerm.count(),
    ]),
    prisma.conversionException.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 50,
    }),
    prisma.protectedTerm.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 50,
    }),
  ])
  const [dictionaryCount, exceptionCount, protectedCount] = stats

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 rounded-[28px] border border-zinc-200 bg-white/92 p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/72">
        <p className="text-sm font-bold uppercase tracking-widest text-blue-600">Admin</p>
        <h1 className="mt-2 text-3xl font-black text-zinc-950 dark:text-white">Konversiya qoidalari</h1>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <Stat label="Dictionary" value={dictionaryCount} />
          <Stat label="Exceptions" value={exceptionCount} />
          <Stat label="Protected" value={protectedCount} />
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-[26px] border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-xl font-black text-zinc-950 dark:text-white">Protected term</h2>
          <form action={addProtectedTerm} className="mt-4 grid gap-3">
            <input name="term" placeholder="Masalan: BrandName" className="h-11 rounded-xl border border-zinc-200 px-3 text-sm dark:border-zinc-800 dark:bg-zinc-900" />
            <input name="reason" placeholder="Sabab" className="h-11 rounded-xl border border-zinc-200 px-3 text-sm dark:border-zinc-800 dark:bg-zinc-900" />
            <button className="h-11 rounded-xl bg-blue-600 text-sm font-black text-white">Qo'shish</button>
          </form>
          <div className="mt-5 space-y-2">
            {protectedTerms.map((term) => (
              <form key={term.id} action={toggleProtectedTerm} className="flex items-center justify-between gap-3 rounded-xl border border-zinc-100 px-3 py-2 dark:border-zinc-800">
                <input type="hidden" name="id" value={term.id} />
                <input type="hidden" name="active" value={String(term.active)} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-zinc-900 dark:text-zinc-100">{term.term}</p>
                  <p className="truncate text-xs text-zinc-500">{term.reason ?? term.source ?? '-'}</p>
                </div>
                <button className={`rounded-lg px-3 py-1 text-xs font-bold ${term.active ? 'bg-green-100 text-green-700' : 'bg-zinc-100 text-zinc-500'}`}>
                  {term.active ? 'Active' : 'Off'}
                </button>
              </form>
            ))}
          </div>
        </section>

        <section className="rounded-[26px] border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-xl font-black text-zinc-950 dark:text-white">Exception</h2>
          <form action={addConversionException} className="mt-4 grid gap-3">
            <div className="grid grid-cols-2 gap-3">
              <input name="from" placeholder="from" className="h-11 rounded-xl border border-zinc-200 px-3 text-sm dark:border-zinc-800 dark:bg-zinc-900" />
              <input name="to" placeholder="to" className="h-11 rounded-xl border border-zinc-200 px-3 text-sm dark:border-zinc-800 dark:bg-zinc-900" />
            </div>
            <select name="direction" className="h-11 rounded-xl border border-zinc-200 px-3 text-sm dark:border-zinc-800 dark:bg-zinc-900">
              <option value="OLD_LATIN_TO_NEW">Old latin → New</option>
              <option value="CYRILLIC_TO_NEW">Cyrillic → New</option>
              <option value="ANY">Any</option>
            </select>
            <input name="reason" placeholder="Sabab" className="h-11 rounded-xl border border-zinc-200 px-3 text-sm dark:border-zinc-800 dark:bg-zinc-900" />
            <button className="h-11 rounded-xl bg-blue-600 text-sm font-black text-white">Qo'shish</button>
          </form>
          <div className="mt-5 space-y-2">
            {exceptions.map((rule) => (
              <form key={rule.id} action={toggleConversionException} className="flex items-center justify-between gap-3 rounded-xl border border-zinc-100 px-3 py-2 dark:border-zinc-800">
                <input type="hidden" name="id" value={rule.id} />
                <input type="hidden" name="active" value={String(rule.active)} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-zinc-900 dark:text-zinc-100">{rule.from} → {rule.to}</p>
                  <p className="truncate text-xs text-zinc-500">{rule.direction} · {rule.reason ?? rule.source ?? '-'}</p>
                </div>
                <button className={`rounded-lg px-3 py-1 text-xs font-bold ${rule.active ? 'bg-green-100 text-green-700' : 'bg-zinc-100 text-zinc-500'}`}>
                  {rule.active ? 'Active' : 'Off'}
                </button>
              </form>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/70">
      <p className="text-xs font-black uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="mt-2 text-2xl font-black text-zinc-950 dark:text-white">{value.toLocaleString()}</p>
    </div>
  )
}
