import { randomUUID } from 'node:crypto'
import { prisma } from './prisma'
import { getPlan, type PlanKey } from './plans'

function currentMonth(): string {
  // NOTE: server-local calendar month (not the Stripe billing period). Good
  // enough for a monthly free quota; revisit if quotas must track billing dates.
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export async function getMonthlyUsage(userId: string): Promise<number> {
  const month = currentMonth()
  const record = await prisma.monthlyUsage.findUnique({
    where: { userId_month: { userId, month } },
  })
  return record?.count ?? 0
}

/**
 * Non-quota gates (file size, format access). Does NOT touch usage counters.
 */
export function checkPlanLimits(
  plan: PlanKey,
  fileSizeBytes: number,
  fileExt: string
): { allowed: boolean; reason?: string } {
  const config = getPlan(plan)

  const fileSizeMB = fileSizeBytes / (1024 * 1024)
  if (fileSizeMB > config.maxFileSizeMB) {
    return {
      allowed: false,
      reason: `Fayl hajmi ${config.maxFileSizeMB}MB dan oshmasligi kerak (sizniki: ${fileSizeMB.toFixed(1)}MB)`,
    }
  }

  const ext = fileExt.toLowerCase().replace('.', '')
  if (!config.formats.includes(ext as never)) {
    return { allowed: false, reason: `Bu format sizning rejangizda qo'llab-quvvatlanmaydi` }
  }

  return { allowed: true }
}

/**
 * Atomically reserve one unit of the monthly quota. Uses a single
 * INSERT ... ON CONFLICT DO UPDATE so concurrent requests cannot both pass a
 * read-then-check and exceed the limit. If the reservation would go over the
 * limit it is rolled back and { allowed: false } is returned.
 * Call releaseUsage() if the conversion later fails.
 */
export async function reserveUsage(
  userId: string,
  plan: PlanKey
): Promise<{ allowed: boolean; reason?: string }> {
  const config = getPlan(plan)
  const month = currentMonth()

  const rows = await prisma.$queryRaw<Array<{ count: number }>>`
    INSERT INTO "MonthlyUsage" ("id", "userId", "month", "count")
    VALUES (${randomUUID()}, ${userId}, ${month}, 1)
    ON CONFLICT ("userId", "month")
    DO UPDATE SET "count" = "MonthlyUsage"."count" + 1
    RETURNING "count"
  `
  const newCount = Number(rows[0]?.count ?? 1)

  if (config.monthlyLimit !== Infinity && newCount > config.monthlyLimit) {
    await releaseUsage(userId)
    return {
      allowed: false,
      reason: `Oylik limit tugadi (${config.monthlyLimit} ta). Pro rejaga o'ting!`,
    }
  }
  return { allowed: true }
}

/** Give back a previously reserved unit (e.g. the conversion failed). */
export async function releaseUsage(userId: string): Promise<void> {
  const month = currentMonth()
  await prisma.$executeRaw`
    UPDATE "MonthlyUsage"
    SET "count" = GREATEST("count" - 1, 0)
    WHERE "userId" = ${userId} AND "month" = ${month}
  `
}

export async function getUserPlan(userId: string): Promise<PlanKey> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true },
  })
  return (user?.plan ?? 'FREE') as PlanKey
}
