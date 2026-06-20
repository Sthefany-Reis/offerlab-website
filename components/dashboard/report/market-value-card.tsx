import type { AnalysisResult } from '@/lib/analysis-schema'
import { Card } from '@/components/ui/card'
import { TrendingUp } from 'lucide-react'

function fmt(n: number, currency: string) {
  const code = currency.toUpperCase()
  const symbol = code.includes('USD') || code === '$' ? '$' : ''
  return `${symbol}${n.toLocaleString()}`
}

export function MarketValueCard({ result }: { result: AnalysisResult }) {
  const mv = result.marketValue
  // Position the median marker within the low-high range.
  // Scale the bar to include the upside potential so growth is visible.
  const scaleMax = Math.max(mv.high, mv.potentialMedian)
  const span = Math.max(scaleMax - mv.low, 1)
  const pct = (v: number) =>
    Math.min(98, Math.max(2, ((v - mv.low) / span) * 100))
  const medianPct = pct(mv.median)
  const potentialPct = pct(mv.potentialMedian)
  const highPct = pct(mv.high)

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">
            Estimated market value · {mv.region}
          </p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-4xl font-semibold tracking-tight">
              {fmt(mv.median, mv.currency)}
            </span>
            <span className="text-muted-foreground">median / year</span>
          </div>
        </div>
        <div className="rounded-lg bg-accent/15 px-4 py-3">
          <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
            <TrendingUp className="size-4" />
            Potential {fmt(mv.potentialMedian, mv.currency)}
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            after closing your skill gaps
          </p>
        </div>
      </div>

      <div className="mt-6">
        <div className="relative h-2 rounded-full bg-secondary">
          {/* Current market range: low → high */}
          <div
            className="absolute inset-y-0 rounded-full bg-primary/70"
            style={{ left: 0, width: `${highPct}%` }}
            aria-hidden="true"
          />
          {/* Upside: high → potential */}
          <div
            className="absolute inset-y-0 rounded-full bg-success/70"
            style={{ left: `${highPct}%`, width: `${potentialPct - highPct}%` }}
            aria-hidden="true"
          />
          {/* Median marker */}
          <div
            className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background bg-primary shadow"
            style={{ left: `${medianPct}%` }}
            aria-hidden="true"
          />
          {/* Potential marker */}
          <div
            className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background bg-success shadow"
            style={{ left: `${potentialPct}%` }}
            aria-hidden="true"
          />
        </div>
        <div className="mt-2 flex justify-between text-xs">
          <span className="text-muted-foreground">
            {fmt(mv.low, mv.currency)}
          </span>
          <span className="font-medium text-success">
            {fmt(mv.potentialMedian, mv.currency)} potential
          </span>
        </div>
      </div>

      <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
        {mv.rationale}
      </p>
    </Card>
  )
}
