import type { AnalysisResult, SkillGap } from '@/lib/analysis-schema'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const importanceStyles: Record<
  SkillGap['importance'],
  { label: string; className: string }
> = {
  critical: {
    label: 'Critical',
    className: 'bg-destructive/10 text-destructive border-destructive/20',
  },
  important: {
    label: 'Important',
    className: 'bg-accent/20 text-accent-foreground border-accent/30',
  },
  'nice-to-have': {
    label: 'Nice to have',
    className: 'bg-secondary text-secondary-foreground border-border',
  },
}

export function SkillGaps({ result }: { result: AnalysisResult }) {
  return (
    <div className="space-y-3">
      {result.skillGaps.map((gap) => {
        const style = importanceStyles[gap.importance]
        return (
          <Card key={gap.skill} className="flex items-start gap-4 p-5">
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
