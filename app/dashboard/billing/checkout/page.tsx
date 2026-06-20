import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getSubscription } from '@/app/actions/subscription'
import { CheckoutForm } from '@/components/dashboard/checkout-form'

export const metadata = {
  title: 'Checkout · OfferLab Pro',
}

export default async function CheckoutPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in')

  // Already subscribed — no need to check out again.
  const sub = await getSubscription()
  if (sub.active) redirect('/dashboard/billing')

  return (
    <div className="py-4">
      <CheckoutForm />
    </div>
  )
}
