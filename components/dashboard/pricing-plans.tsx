'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Check, Loader2, Sparkles } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cancelSubscription } from '@/app/actions/subscription'

const FREE_FEATURES = [
  '3 CV analyses per month',
  'Match scores & skill-gap roadmap',
  'AI job search',
  'Application tracking',
  'Interview practice',
]

const PRO_FEATURES = [
  'Everything in Free',
  'Unlimited CV analyses',
  'CV regeneration (ATS-friendly rewrite)',
  'AI cover letter generator',
  'AI cover letter rating & feedback',
  'Priority AI responses',
]

export function PricingPlans({
  isPro,
  periodEnd,
}: {
  isPro: boolean
  periodEnd: string | null
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [canceling, setCanceling] = useState(false)

  function onCancel() {
    setCanceling(true)
    startTransition(async () => {
      await cancelSubscription()
      setCanceling(false)
      toast.success('Your plan was canceled. You are back on Free.')
      router.refresh()
    })
  }

  const renewLabel = periodEnd
    ? new Date(periodEnd).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Free plan */}
      <Card className="flex flex-col p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Free</h3>
          {!isPro && <Badge variant="secondary">Current plan</Badge>}
        </div>
        <p className="mt-2 text-3xl font-bold tracking-tight">
          $0
          <span className="text-sm font-normal text-muted-foreground">
            {' '}
            / month
          </span>
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Everything you need to start your search.
        </p>
        <ul className="mt-6 flex-1 space-y-3">
          {FREE_FEATURES.map((f) => (
            <li key={f} className="flex items-start gap-2 text-sm">
              <Check className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              {f}
            </li>
          ))}
        </ul>
        <Button variant="outline" className="mt-6" disabled>
          {isPro ? 'Included' : 'Your current plan'}
        </Button>
      </Card>

      {/* Pro plan */}
      <Card className="relative flex flex-col border-primary/40 bg-primary/[0.03] p-6 ring-1 ring-primary/10">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-1.5 text-lg font-semibold">
            <Sparkles className="size-4 text-primary" />
            Pro
          </h3>
          {isPro ? (
            <Badge>Current plan</Badge>
          ) : (
            <Badge variant="secondary">Most popular</Badge>
          )}
        </div>
        <p className="mt-2 text-3xl font-bold tracking-tight">
          $12
          <span className="text-sm font-normal text-muted-foreground">
            {' '}
            / month
          </span>
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Unlock AI cover letters and premium tooling.
        </p>
        <ul className="mt-6 flex-1 space-y-3">
          {PRO_FEATURES.map((f) => (
            <li key={f} className="flex items-start gap-2 text-sm">
              <Check className="mt-0.5 size-4 shrink-0 text-primary" />
              {f}
            </li>
          ))}
        </ul>

        {isPro ? (
          <div className="mt-6 space-y-3">
            {renewLabel && (
              <p className="text-center text-xs text-muted-foreground">
                Renews on {renewLabel}
              </p>
            )}
            <Button
              variant="outline"
              className="w-full"
              onClick={onCancel}
              disabled={pending || canceling}
            >
              {canceling ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Canceling…
                </>
              ) : (
                'Cancel subscription'
              )}
            </Button>
          </div>
        ) : (
          <Button
            className="mt-6 w-full"
            onClick={() => router.push('/dashboard/billing/checkout')}
          >
            <Sparkles className="size-4" />
            Upgrade to Pro
          </Button>
        )}
      </Card>
    </div>
  )
}
