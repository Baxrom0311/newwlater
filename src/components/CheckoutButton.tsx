'use client'

import { useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface Props {
  plan: 'PRO' | 'BUSINESS'
  className?: string
  children: React.ReactNode
}

/**
 * Starts a Stripe Checkout session for the given plan. Signed-out users are
 * sent to sign-in first and returned to /pricing, where the button then opens
 * checkout — closing the previously broken /pricing → /sign-up → /dashboard loop.
 */
export default function CheckoutButton({ plan, className, children }: Props) {
  const { isSignedIn } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const onClick = async () => {
    if (!isSignedIn) {
      router.push(`/sign-in?redirect_url=${encodeURIComponent('/pricing')}`)
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'checkout', plan }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.url) throw new Error(data.error ?? 'Xatolik yuz berdi')
      window.location.href = data.url as string
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Xatolik yuz berdi')
      setLoading(false)
    }
  }

  return (
    <button type="button" onClick={onClick} disabled={loading} className={className} aria-busy={loading}>
      {children}
    </button>
  )
}
