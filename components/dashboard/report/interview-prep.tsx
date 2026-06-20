import type { AnalysisResult } from '@/lib/analysis-schema'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Lightbulb } from 'lucide-react'

const categoryLabel: Record<string, string> = {
  behavioral: 'Behavioral',
  technical: 'Technical',
  'role-specific': 'Role-specific',
}

export function InterviewPrep({ result }: { result: AnalysisResult }) {
  return (
    <div>
      <p className="mb-5 text-sm text-muted-foreground">
        The questions you are most likely to face, with what each interviewer is
        really assessing and a strong sample answer.
      </p>

      <Accordion type="single" collapsible className="space-y-3">
        {result.interviewQuestions.map((q, i) => (
          <AccordionItem
            key={i}
            value={`q-${i}`}
            className="rounded-lg border border-border bg-card px-4"
          >
            <AccordionTrigger className="text-left hover:no-underline">
              <span className="flex flex-1 items-center gap-3 pr-2">
                <Badge variant="secondary" className="shrink-0 font-normal">
                  {categoryLabel[q.category] ?? q.category}
                </Badge>
                <span className="font-medium">{q.question}</span>
              </span>
            </AccordionTrigger>
            <AccordionContent className="space-y-3">
              <div className="rounded-md bg-secondary/60 p-3">
                <p className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                  <Lightbulb className="size-3.5 text-accent-foreground" />
                  What they are really assessing
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {q.whatTheyWant}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Sample answer
                </p>
                <p className="mt-1 text-sm leading-relaxed">{q.sampleAnswer}</p>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
