import { clerkClient } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export function fallbackEmail(userId: string) {
  return `${userId}@missing-email.clerk.local`
}

export async function ensureUserRecord(userId: string) {
  const existing = await prisma.user.findUnique({ where: { id: userId } })
  if (existing) return existing

  try {
    const clerk = await clerkClient()
    const clerkUser = await clerk.users.getUser(userId)
    return await prisma.user.create({
      data: {
        id: userId,
        email: clerkUser.emailAddresses[0]?.emailAddress ?? fallbackEmail(userId),
        name: `${clerkUser.firstName ?? ''} ${clerkUser.lastName ?? ''}`.trim() || null,
        imageUrl: clerkUser.imageUrl,
      },
    })
  } catch {
    return prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: { id: userId, email: fallbackEmail(userId) },
    })
  }
}
