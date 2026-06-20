import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getSubscription, getPayments } from '@/app/actions/subscription'
import { PricingPlans } from '@/components/dashboard/pricing-plans'
import { PaymentHistory } from '@/components/dashboard/payment-history'
import { Card } from '@/components/ui/card'
import { Sparkles } from 'lucide-react'

export const metadata = {
  title: 'Billing & plans · OfferLab',
}

export default async function BillingPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in')

  const [sub, payments] = await Promise.all([getSubscription(), getPayments()])

  return (
    <div className="mx-auto max-w-4xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Billing &amp; plans</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose the plan that fits your job hunt. Upgrade or cancel anytime.
        </p>
      </div>

      {sub.active && (
        <Card className="mt-6 flex items-center gap-3 border-primary/30 bg-primary/5 p-4">
          <div className="grid size-10 place-items-center rounded-full bg-primary/15 text-primary">
            <Sparkles className="size-5" />
          </div>
          <div>
            <p className="font-medium">You&apos;re on the Pro plan</p>
            <p className="text-sm text-muted-foreground">
              All premium features, including AI cover letters, are unlocked.
            </p>
          </div>
        </Card>
      )}

      <div className="mt-6">
        <PricingPlans isPro={sub.active} periodEnd={sub.currentPeriodEnd} />
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Payments are processed securely. You can cancel your subscription at any
        time from this page.
      </p>

      <PaymentHistory payments={payments} />
    </div>
  )
}
