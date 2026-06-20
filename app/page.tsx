import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { SiteHeader } from '@/components/landing/site-header'
import { Hero } from '@/components/landing/hero'
import { Features } from '@/components/landing/features'
import { HowItWorks } from '@/components/landing/how-it-works'
import { MarketValue, CtaFooter } from '@/components/landing/value-cta'

export default async function HomePage() {
  const session = await auth.api.getSession({ headers: await headers() })
  const signedIn = Boolean(session?.user)

  return (
    <div className="min-h-svh bg-background">
      <SiteHeader signedIn={signedIn} />
      <main>
        <Hero signedIn={signedIn} />
        <Features />
        <HowItWorks />
        <MarketValue />
        <CtaFooter />
      </main>
    </div>
  )
}
