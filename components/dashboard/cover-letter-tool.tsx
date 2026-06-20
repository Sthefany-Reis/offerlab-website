'use client'

import { useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import {
  Copy,
  Loader2,
  Lock,
  PenLine,
  Sparkles,
  Star,
  Wand2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  generateCoverLetter,
  rateCoverLetter,
} from '@/app/actions/cover-letter'
import type { CoverLetterRating } from '@/lib/cover-letter-schema'

type Tone = 'professional' | 'enthusiastic' | 'concise'

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

export function CoverLetterTool({
  isPro,
  jobId,
  jobTitle,
  company,
}: {
  isPro: boolean
  jobId?: number
  jobTitle?: string
  company?: string
}) {
  const [tone, setTone] = useState<Tone>('professional')
  const [generating, setGenerating] = useState(false)
  const [letter, setLetter] = useState('')

  const [draft, setDraft] = useState('')
  const [rating, setRating] = useState<CoverLetterRating | null>(null)
  const [rating_, setRating_] = useState(false)

  if (!isPro) {
    return (
      <Card className="flex flex-col items-center gap-3 p-8 text-center">
        <div className="grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
          <Lock className="size-6" />
        </div>
        <h3 className="text-lg font-semibold">Cover letters are a Pro feature</h3>
        <p className="max-w-sm text-pretty text-sm text-muted-foreground">
          Upgrade to OfferLab Pro to generate tailored cover letters and get
          instant AI ratings with actionable feedback.
        </p>
        <Button asChild className="mt-2">
          <Link href="/dashboard/billing">
            <Sparkles className="size-4" />
            Upgrade to Pro
          </Link>
        </Button>
      </Card>
    )
  }

  async function onGenerate() {
    setGenerating(true)
    const res = await generateCoverLetter({ jobId, jobTitle, company, tone })
    setGenerating(false)
    if ('error' in res) {
      toast.error(res.error)
      return
    }
    setLetter(res.letter)
    toast.success('Cover letter ready.')
  }

  async function onRate() {
    setRating_(true)
    const res = await rateCoverLetter({ letter: draft, jobId, jobTitle, company })
    setRating_(false)
    if ('error' in res) {
      toast.error(res.error)
      return
    }
    setRating(res.rating)
  }

  return (
    <Tabs defaultValue="generate" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="generate">
          <Wand2 className="size-4" />
          Generate
        </TabsTrigger>
        <TabsTrigger value="rate">
          <Star className="size-4" />
          Rate mine
        </TabsTrigger>
      </TabsList>

      {/* Generate */}
      <TabsContent value="generate" className="mt-4 space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Tone</span>
            <Select value={tone} onValueChange={(v) => v && setTone(v as Tone)}>
              <SelectTrigger className="w-full sm:w-48" aria-label="Tone">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                <SelectItem value="concise">Concise</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={onGenerate} disabled={generating}>
            {generating ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Writing…
              </>
            ) : (
              <>
                <Wand2 className="size-4" />
                {letter ? 'Regenerate' : 'Generate cover letter'}
              </>
            )}
          </Button>
        </div>

        {(jobTitle || company) && (
          <p className="text-xs text-muted-foreground">
            Tailored for{' '}
            <span className="font-medium text-foreground">
              {[jobTitle, company].filter(Boolean).join(' at ')}
            </span>
            , grounded in your most recent analyzed CV.
          </p>
        )}

        {letter ? (
          <Card className="space-y-3 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Your cover letter</span>
              <Button variant="outline" size="xs" onClick={() => copyText(letter)}>
                <Copy className="size-3.5" />
                Copy
              </Button>
            </div>
            <Textarea
              value={letter}
              onChange={(e) => setLetter(e.target.value)}
              className="min-h-72 resize-y text-sm leading-relaxed"
              aria-label="Generated cover letter"
            />
          </Card>
        ) : (
          <Card className="flex flex-col items-center gap-2 border-dashed p-8 text-center">
            <PenLine className="size-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Generate a tailored cover letter from your analyzed CV.
            </p>
          </Card>
        )}
      </TabsContent>

      {/* Rate */}
      <TabsContent value="rate" className="mt-4 space-y-4">
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Paste your cover letter here to get an honest rating and feedback…"
          className="min-h-48 resize-y text-sm leading-relaxed"
          aria-label="Cover letter to rate"
        />
        <div className="flex justify-end">
          <Button onClick={onRate} disabled={rating_ || draft.trim().length < 120}>
            {rating_ ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Rating…
              </>
            ) : (
              <>
                <Star className="size-4" />
                Rate my cover letter
              </>
            )}
          </Button>
        </div>

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
                    <li
                      key={s}
                      className="flex gap-2 text-sm text-muted-foreground"
                    >
                      <span className="mt-1.5 size-1 shrink-0 rounded-full bg-success" />
                      {s}
                    </li>
                  ))}
                </ul>
              </Card>
              <Card className="p-4">
                <h4 className="text-sm font-semibold text-warning">
                  Improvements
                </h4>
                <ul className="mt-2 space-y-1.5">
                  {rating.improvements.map((s) => (
                    <li
                      key={s}
                      className="flex gap-2 text-sm text-muted-foreground"
                    >
                      <span className="mt-1.5 size-1 shrink-0 rounded-full bg-warning" />
                      {s}
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>
        )}
      </TabsContent>
    </Tabs>
  )
}
