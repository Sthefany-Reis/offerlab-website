'use client'

import { useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Copy, Loader2, Lock, PenLine, Sparkles, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { rateCoverLetter } from '@/app/actions/cover-letter'
import type { CoverLetterRating } from '@/lib/cover-letter-schema'

async function copyText(text: string) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      toast.success('Copied to clipboard.')
      return
    }
    throw new Error('no clipboard')
  } catch {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.focus()
    ta.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(ta)
    ok
      ? toast.success('Copied to clipboard.')
      : toast.error('Copy failed — select and copy manually.')
  }
}

function scoreColor(score: number) {
  if (score >= 75) return 'text-success'
  if (score >= 50) return 'text-warning'
  return 'text-destructive'
}

export function AppliedCoverLetter({
  coverLetter,
  isPro,
  jobId,
  jobTitle,
  company,
}: {
  coverLetter: string | null
  isPro: boolean
  jobId: number
  jobTitle: string
  company: string
}) {
  const [rating, setRating] = useState<CoverLetterRating | null>(null)
  const [rating_, setRating_] = useState(false)

  // No cover letter was submitted with this application.
  if (!coverLetter || coverLetter.trim().length === 0) {
    return (
      <Card className="flex flex-col items-center gap-2 border-dashed p-8 text-center">
        <PenLine className="size-6 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          You didn&apos;t include a cover letter with this application.
        </p>
      </Card>
    )
  }

  async function onRate() {
    setRating_(true)
    const res = await rateCoverLetter({
      letter: coverLetter as string,
      jobId,
      jobTitle,
      company,
    })
    setRating_(false)
    if ('error' in res) {
      toast.error(res.error)
      return
    }
    setRating(res.rating)
  }

  return (
    <div className="space-y-4">
      {/* The cover letter the user applied with — viewable by everyone */}
      <Card className="space-y-3 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">
            Cover letter you applied with
          </span>
          <Button
            variant="outline"
            size="xs"
            onClick={() => copyText(coverLetter)}
          >
            <Copy className="size-3.5" />
            Copy
          </Button>
        </div>
        <p className="whitespace-pre-wrap text-pretty text-sm leading-relaxed text-muted-foreground">
          {coverLetter}
        </p>
      </Card>

      {/* Rating — Pro feature */}
      {isPro ? (
        <div className="flex justify-end">
          <Button onClick={onRate} disabled={rating_}>
            {rating_ ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Rating…
              </>
            ) : (
              <>
                <Star className="size-4" />
                {rating ? 'Re-rate cover letter' : 'Rate this cover letter'}
              </>
            )}
          </Button>
        </div>
      ) : (
        <Card className="flex flex-col items-center gap-3 p-6 text-center">
          <div className="grid size-10 place-items-center rounded-full bg-primary/10 text-primary">
            <Lock className="size-5" />
          </div>
          <p className="max-w-sm text-pretty text-sm text-muted-foreground">
            Rating your cover letter with instant, actionable feedback is a Pro
            feature.
          </p>
          <Button asChild>
            <Link href="/dashboard/billing">
              <Sparkles className="size-4" />
              Upgrade to Pro
            </Link>
          </Button>
        </Card>
      )}

      {rating && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-1 duration-300">
          <Card className="flex items-center gap-4 p-5">
            <div className="flex flex-col items-center">
              <span
                className={`text-4xl font-bold tabular-nums ${scoreColor(rating.overallScore)}`}
              >
                {rating.overallScore}
              </span>
              <span className="text-xs text-muted-foreground">/ 100</span>
            </div>
            <p className="text-pretty text-sm leading-relaxed">
              {rating.verdict}
            </p>
          </Card>

          <div className="grid gap-3 sm:grid-cols-2">
            {rating.categories.map((c) => (
              <Card key={c.name} className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{c.name}</span>
                  <span
                    className={`text-sm font-semibold tabular-nums ${scoreColor(c.score)}`}
                  >
                    {c.score}
                  </span>
                </div>
                <Progress value={c.score} className="mt-2" />
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {c.comment}
                </p>
              </Card>
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Card className="p-4">
              <h4 className="text-sm font-semibold text-success">Strengths</h4>
              <ul className="mt-2 space-y-1.5">
                {rating.strengths.map((s) => (
                  <li key={s} className="flex gap-2 text-sm text-muted-foreground">
                    <span className="mt-1.5 size-1 shrink-0 rounded-full bg-success" />
                    {s}
                  </li>
                ))}
              </ul>
            </Card>
            <Card className="p-4">
              <h4 className="text-sm font-semibold text-warning">Improvements</h4>
              <ul className="mt-2 space-y-1.5">
                {rating.improvements.map((s) => (
                  <li key={s} className="flex gap-2 text-sm text-muted-foreground">
                    <span className="mt-1.5 size-1 shrink-0 rounded-full bg-warning" />
                    {s}
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
