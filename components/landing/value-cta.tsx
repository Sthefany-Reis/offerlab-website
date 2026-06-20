import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export function MarketValue() {
  return (
    <section id="value" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="text-sm font-medium text-primary">Know your worth</p>
          <h2 className="mt-2 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            A real market-value estimate, not a vague range
          </h2>
          <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
            OfferLab benchmarks your experience against your target market and shows
            you both what you can command today and the higher number you could reach
            after closing your top skill gaps.
          </p>
        </div>

        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Estimated market value</p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-4xl font-semibold tracking-tight">$118k</span>
            <span className="text-muted-foreground">median / yr</span>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-secondary">
            <div className="h-full w-2/3 rounded-full bg-primary" />
          </div>
          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            <span>$96k</span>
            <span>$142k</span>
          </div>
          <div className="mt-5 rounded-lg bg-accent/15 p-3 text-sm">
            <span className="font-medium text-foreground">Potential: $158k</span>
            <span className="text-muted-foreground">
              {' '}
              after closing 3 skill gaps
            </span>
          </div>
        </Card>
      </div>
    </section>
  )
}

export function CtaFooter() {
  return (
    <>
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="rounded-2xl bg-primary px-6 py-14 text-center text-primary-foreground sm:px-12">
          <h2 className="mx-auto max-w-2xl text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Your next offer starts with one upload
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-pretty leading-relaxed text-primary-foreground/80">
            Create a free account and get your full career analysis in seconds.
          </p>
          <Button
            asChild
            size="lg"
            variant="secondary"
            className="mt-8"
          >
            <Link href="/sign-up">
              Get started free
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:px-6">
          <div className="flex items-center gap-2">
            <span className="grid size-6 place-items-center rounded bg-primary text-xs font-bold text-primary-foreground">
              O
            </span>
            <span className="font-medium text-foreground">OfferLab</span>
          </div>
          <p>Built to get you hired. Not affiliated with any employer.</p>
        </div>
      </footer>
    </>
  )
}
