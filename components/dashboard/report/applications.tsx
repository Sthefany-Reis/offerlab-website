'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import type { AnalysisResult } from '@/lib/analysis-schema'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Check, Copy } from 'lucide-react'

function matchTone(score: number) {
  if (score >= 80) return { bar: 'bg-success', text: 'text-success' }
  if (score >= 60) return { bar: 'bg-primary', text: 'text-primary' }
  return { bar: 'bg-warning', text: 'text-warning' }
}

export function Applications({ result }: { result: AnalysisResult }) {
  const [copied, setCopied] = useState<number | null>(null)

  function copy(text: string, i: number) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(i)
      toast.success('Cover letter copied to clipboard.')
      setTimeout(() => setCopied((c) => (c === i ? null : c)), 2000)
    })
  }

  return (
    <div className="space-y-4">
      {result.applications.map((app, i) => (
        <Card key={i} className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold">{app.roleTitle}</h3>
              <p className="text-sm text-muted-foreground">{app.companyType}</p>
            </div>
            <div className="w-36">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Match</span>
                <span className={`font-semibold ${matchTone(app.matchScore).text}`}>
                  {app.matchScore}%
                </span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full transition-all ${matchTone(app.matchScore).bar}`}
                  style={{ width: `${app.matchScore}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Tailored summary
            </p>
            <p className="mt-1.5 text-sm leading-relaxed">
              {app.tailoredSummary}
            </p>
          </div>

          <Separator className="my-4" />

          <div>
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Cover letter
              </p>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copy(app.coverLetter, i)}
              >
                {copied === i ? (
                  <>
                    <Check className="size-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="size-4" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
              {app.coverLetter}
            </p>
          </div>
        </Card>
      ))}
    </div>
  )
}
