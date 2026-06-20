import type { AnalysisResult } from '@/lib/analysis-schema'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock } from 'lucide-react'

export function Roadmap({ result }: { result: AnalysisResult }) {
  const totalWeeks = result.roadmap.reduce((sum, s) => sum + s.durationWeeks, 0)

  return (
    <div>
      <p className="mb-5 text-sm text-muted-foreground">
        A sequenced plan to close your gaps —{' '}
        <span className="font-medium text-foreground">
          about {totalWeeks} weeks
        </span>{' '}
        end to end.
      </p>

      <ol className="relative space-y-4 border-l border-border pl-6">
        {result.roadmap.map((step, i) => (
          <li key={i} className="relative">
            <span
              className="absolute -left-[31px] grid size-6 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground"
              aria-hidden="true"
            >
              {i + 1}
            </span>
            <Card className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-semibold">{step.title}</h3>
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="size-3.5" />
                  {step.durationWeeks} wk
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {step.focus}
              </p>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {step.skillsAddressed.map((s) => (
                  <Badge key={s} variant="secondary" className="font-normal">
                    {s}
                  </Badge>
                ))}
              </div>

              <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                {step.resources.map((r) => (
                  <li key={r} className="flex gap-2">
                    <span className="text-primary">•</span>
                    {r}
                  </li>
                ))}
              </ul>
            </Card>
          </li>
        ))}
      </ol>
    </div>
  )
}
