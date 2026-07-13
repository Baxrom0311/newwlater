import { prisma } from './prisma'
import { getPlan, type PlanKey } from './plans'

function currentMonth(): string {
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

export async function checkLimit(
  userId: string,
  plan: PlanKey,
  fileSizeBytes: number,
  fileExt: string
): Promise<{ allowed: boolean; reason?: string }> {
  const config = getPlan(plan)

  // Check file size
  const fileSizeMB = fileSizeBytes / (1024 * 1024)
  if (fileSizeMB > config.maxFileSizeMB) {
    return {
      allowed: false,
      reason: `Fayl hajmi ${config.maxFileSizeMB}MB dan oshmasligi kerak (sizniki: ${fileSizeMB.toFixed(1)}MB)`,
    }
  }

  // Check format access
  const ext = fileExt.toLowerCase().replace('.', '')
  if (!config.formats.includes(ext as never)) {
    return {
      allowed: false,
      reason: `Bu format sizning rejangizda qo'llab-quvvatlanmaydi`,
    }
  }

  // Check monthly limit
  if (config.monthlyLimit !== Infinity) {
    const used = await getMonthlyUsage(userId)
    if (used >= config.monthlyLimit) {
      return {
        allowed: false,
        reason: `Oylik limit tugadi (${config.monthlyLimit} ta). Pro rejaga o'ting!`,
      }
    }
  }

  return { allowed: true }
}

export async function incrementUsage(userId: string): Promise<void> {
  const month = currentMonth()
  await prisma.monthlyUsage.upsert({
    where: { userId_month: { userId, month } },
    update: { count: { increment: 1 } },
    create: { userId, month, count: 1 },
  })
}

export async function getUserPlan(userId: string): Promise<PlanKey> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true },
  })
  return (user?.plan ?? 'FREE') as PlanKey
}
