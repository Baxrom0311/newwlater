import { auth, clerkClient } from '@clerk/nextjs/server'
import { notFound } from 'next/navigation'

function adminEmails(): Set<string> {
  return new Set(
    (process.env.ADMIN_EMAILS ?? '')
      .split(',')
      .map((email) => email.trim().toLocaleLowerCase())
      .filter(Boolean)
  )
}

export async function requireAdmin() {
  const { userId } = await auth()
  if (!userId) notFound()

  const allowed = adminEmails()
  if (allowed.size === 0) notFound()

  const clerk = await clerkClient()
  const user = await clerk.users.getUser(userId)
  const emails = user.emailAddresses.map((email) => email.emailAddress.toLocaleLowerCase())
  if (!emails.some((email) => allowed.has(email))) notFound()

  return { userId }
}
