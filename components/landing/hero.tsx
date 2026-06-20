import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Hero({ signedIn }: { signedIn: boolean }) {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-24">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/60 px-3 py-1 text-xs font-medium text-muted-foreground">
            <span className="size-1.5 rounded-full bg-accent" />
            AI career copilot
          </span>
          <h1 className="mt-5 text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            Turn your CV into your next offer
          </h1>
          <p className="mt-5 max-w-lg text-pretty text-lg leading-relaxed text-muted-foreground">
            Upload your CV and get a market-value estimate, a missing-skills
            breakdown, a personalized learning roadmap, tailored applications, and
            interview prep — in one place.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button asChild size="lg">
              <Link href={signedIn ? '/dashboard' : '/sign-up'}>
                Analyze my CV
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="#how">See how it works</Link>
            </Button>
          </div>

          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
            {['Market-value estimate', 'Skill gap analysis', 'Interview prep'].map(
              (item) => (
                <li key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-primary" aria-hidden="true" />
                  {item}
                </li>
              ),
            )}
          </ul>
        </div>

        <div className="relative">
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-2xl shadow-primary/5">
            <Image
              src="/hero-dashboard.png"
              alt="OfferLab dashboard showing a market-value estimate, skill match score, and learning roadmap"
              width={1200}
              height={900}
              priority
              className="h-auto w-full"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
