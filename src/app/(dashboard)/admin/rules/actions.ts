'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin'

function normalize(value: string) {
  return value
    .trim()
    .toLocaleLowerCase('uz-UZ')
    .replace(/[ʻ‘’`ʼ]/g, "'")
}

export async function addProtectedTerm(formData: FormData) {
  await requireAdmin()
  const term = String(formData.get('term') ?? '').trim()
  const reason = String(formData.get('reason') ?? '').trim() || null
  if (!term) return

  await prisma.protectedTerm.upsert({
    where: { normalized: normalize(term) },
    update: { term, reason, active: true, source: 'admin' },
    create: { term, normalized: normalize(term), reason, source: 'admin' },
  })
  revalidatePath('/admin/rules')
}

export async function addConversionException(formData: FormData) {
  await requireAdmin()
  const from = String(formData.get('from') ?? '').trim()
  const to = String(formData.get('to') ?? '').trim()
  const direction = String(formData.get('direction') ?? 'OLD_LATIN_TO_NEW') as
    | 'OLD_LATIN_TO_NEW'
    | 'CYRILLIC_TO_NEW'
    | 'ANY'
  const reason = String(formData.get('reason') ?? '').trim() || null
  if (!from || !to) return

  await prisma.conversionException.upsert({
    where: { normalized_direction: { normalized: normalize(from), direction } },
    update: { from, to, reason, active: true, source: 'admin' },
    create: { from, to, normalized: normalize(from), direction, reason, source: 'admin' },
  })
  revalidatePath('/admin/rules')
}

export async function toggleProtectedTerm(formData: FormData) {
  await requireAdmin()
  const id = String(formData.get('id') ?? '')
  const active = String(formData.get('active')) !== 'true'
  if (!id) return
  await prisma.protectedTerm.update({ where: { id }, data: { active } })
  revalidatePath('/admin/rules')
}

export async function toggleConversionException(formData: FormData) {
  await requireAdmin()
  const id = String(formData.get('id') ?? '')
  const active = String(formData.get('active')) !== 'true'
  if (!id) return
  await prisma.conversionException.update({ where: { id }, data: { active } })
  revalidatePath('/admin/rules')
}
