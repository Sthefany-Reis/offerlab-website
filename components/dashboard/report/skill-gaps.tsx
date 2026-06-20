import type { AnalysisResult, SkillGap } from '@/lib/analysis-schema'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const importanceStyles: Record<
  SkillGap['importance'],
  { label: string; className: string; dot: string }
> = {
  critical: {
    label: 'Critical',
    className: 'bg-destructive/15 text-destructive border-destructive/30',
    dot: 'bg-destructive',
  },
  important: {
    label: 'Important',
    className: 'bg-warning/15 text-warning border-warning/30',
    dot: 'bg-warning',
  },
  'nice-to-have': {
    label: 'Nice to have',
    className: 'bg-success/15 text-success border-success/30',
    dot: 'bg-success',
  },
}

export function SkillGaps({ result }: { result: AnalysisResult }) {
  return (
    <div className="space-y-3">
      {result.skillGaps.map((gap) => {
        const style = importanceStyles[gap.importance]
        return (
          <Card
            key={gap.skill}
            className="relative flex items-start gap-4 overflow-hidden p-5"
          >
            <span
              className={`absolute inset-y-0 left-0 w-1 ${style.dot}`}
              aria-hidden="true"
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold">{gap.skill}</h3>
                <Badge
                  variant="outline"
                  className={style.className}
                >
                  {style.label}
                </Badge>
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {gap.reason}
              </p>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
