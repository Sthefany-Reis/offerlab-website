'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { ArrowLeft, Lock, Loader2, Sparkles } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { activateSubscription } from '@/app/actions/subscription'

function formatCard(v: string) {
  return v
    .replace(/\D/g, '')
    .slice(0, 16)
    .replace(/(.{4})/g, '$1 ')
    .trim()
}

export function CheckoutForm() {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [card, setCard] = useState('')
  const [exp, setExp] = useState('')
  const [cvc, setCvc] = useState('')
  const [name, setName] = useState('')

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      try {
        await activateSubscription()
        toast.success('Welcome to Pro! Your plan is now active.')
        router.push('/dashboard/billing?upgraded=1')
        router.refresh()
      } catch {
        toast.error('Could not complete the upgrade. Please try again.')
      }
    })
  }

  return (
    <div className="mx-auto max-w-md">
      <Button asChild variant="ghost" size="sm" className="mb-4">
        <Link href="/dashboard/billing">
          <ArrowLeft className="size-4" />
          Back to plans
        </Link>
      </Button>

      <Card className="overflow-hidden p-0">
        <div className="border-b border-border bg-secondary/40 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="size-5 text-primary" />
              <span className="font-semibold">OfferLab Pro</span>
            </div>
            <span className="text-sm text-muted-foreground">Monthly</span>
          </div>
          <p className="mt-4 text-3xl font-bold tracking-tight">
            $12
            <span className="text-base font-normal text-muted-foreground">
              {' '}
              / month
            </span>
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Billed monthly · cancel anytime
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 p-6">
          <div className="flex flex-col gap-2">
            <Label htmlFor="card-name">Name on card</Label>
            <Input
              id="card-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jordan Smith"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="card-number">Card number</Label>
            <Input
              id="card-number"
              inputMode="numeric"
              value={card}
              onChange={(e) => setCard(formatCard(e.target.value))}
              placeholder="4242 4242 4242 4242"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="card-exp">Expiry</Label>
              <Input
                id="card-exp"
                value={exp}
                onChange={(e) =>
                  setExp(
                    e.target.value
                      .replace(/\D/g, '')
                      .slice(0, 4)
                      .replace(/(.{2})(.+)/, '$1/$2'),
                  )
                }
                placeholder="MM/YY"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="card-cvc">CVC</Label>
              <Input
                id="card-cvc"
                inputMode="numeric"
                value={cvc}
                onChange={(e) =>
                  setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))
                }
                placeholder="123"
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Processing…
              </>
            ) : (
              <>
                <Lock className="size-4" />
                Subscribe for $12/month
              </>
            )}
          </Button>

          <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
            <Lock className="size-3" />
            Demo checkout — no real card is charged.
          </p>
        </form>
      </Card>
    </div>
  )
}
