import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, FileText, Search, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'

const flow = [
  { icon: FileText, label: 'Upload CV' },
  { icon: Search, label: 'Match & apply' },
  { icon: Trophy, label: 'Get the offer' },
]

export function Hero({ signedIn }: { signedIn: boolean }) {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-24">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/60 px-3 py-1 text-xs font-medium text-muted-foreground">
            <span className="size-1.5 rounded-full bg-accent" />
            Your AI career copilot
          </span>
          <h1 className="mt-5 text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            Where applications become{' '}
            <span className="text-primary">offers</span>.
          </h1>
          <p className="mt-5 max-w-lg text-pretty text-lg leading-relaxed text-muted-foreground">
            OfferLab turns one CV into your entire job hunt — surfacing the roles
            you qualify for, applying on your behalf, prepping you for interviews,
            and coaching you all the way to signed.
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

          <div className="mt-10 flex flex-wrap items-center gap-3 text-sm font-medium">
            {flow.map((step, i) => (
              <div key={step.label} className="flex items-center gap-3">
                <span className="flex items-center gap-2 text-foreground">
                  <span className="grid size-8 place-items-center rounded-lg bg-secondary text-primary">
                    <step.icon className="size-4" aria-hidden="true" />
                  </span>
                  {step.label}
                </span>
                {i < flow.length - 1 && (
                  <ArrowRight
                    className="size-4 text-muted-foreground"
                    aria-hidden="true"
                  />
                )}
              </div>
            ))}
          </div>
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
          <div className="absolute -bottom-4 -left-4 hidden rounded-xl border border-border bg-card p-4 shadow-xl sm:block">
            <p className="text-xs text-muted-foreground">Offer probability</p>
            <p className="mt-0.5 text-2xl font-semibold tracking-tight text-primary">
              92%
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
