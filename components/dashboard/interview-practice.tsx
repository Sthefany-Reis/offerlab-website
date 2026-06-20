'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import {
  Sparkles,
  RefreshCw,
  Lightbulb,
  CheckCircle2,
  MessageSquareText,
  Zap,
  Lock,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  generateQuestion,
  evaluateAnswer,
  type InterviewQuestion,
  type InterviewAnswer,
} from '@/app/actions/interview'
import type { WeeklyUsage } from '@/app/actions/subscription'

const categoryStyles: Record<string, string> = {
  behavioral: 'bg-primary/15 text-primary border-primary/30',
  technical: 'bg-accent/15 text-accent border-accent/30',
  situational: 'bg-warning/15 text-warning border-warning/30',
  'role-specific': 'bg-success/15 text-success border-success/30',
}

function scoreTone(score: number) {
  if (score >= 80) return 'text-success'
  if (score >= 50) return 'text-warning'
  return 'text-destructive'
}

export function InterviewPractice({ usage }: { usage: WeeklyUsage }) {
  const [role, setRole] = useState('')
  const [question, setQuestion] = useState<InterviewQuestion | null>(null)
  const [asked, setAsked] = useState<string[]>([])
  const [answer, setAnswer] = useState('')
  const [result, setResult] = useState<InterviewAnswer | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [remaining, setRemaining] = useState(usage.remaining)
  const [loadingQuestion, startQuestion] = useTransition()
  const [evaluating, startEval] = useTransition()

  const limitReached = !usage.unlimited && remaining <= 0

  function nextQuestion() {
    setError(null)
    setResult(null)
    setAnswer('')
    startQuestion(async () => {
      const res = await generateQuestion(role, asked)
      if ('error' in res) {
        setError(res.error)
        return
      }
      setQuestion(res.question)
      setAsked((prev) => [...prev, res.question.question])
      if (!usage.unlimited) setRemaining((n) => Math.max(0, n - 1))
    })
  }

  function submitAnswer() {
    if (!question) return
    setError(null)
    startEval(async () => {
      const res = await evaluateAnswer(role, question.question, answer)
      if ('error' in res) {
        setError(res.error)
        return
      }
      setResult(res.answer)
    })
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Usage / plan banner */}
      {usage.unlimited ? (
        <div className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm text-accent-foreground">
          <Zap className="size-4 shrink-0" />
          <span>
            <span className="font-semibold">Pro plan</span> — unlimited
            interview questions.
          </span>
        </div>
      ) : (
        <div
          className={`flex flex-wrap items-center justify-between gap-2 rounded-lg border px-4 py-2.5 text-sm ${
            limitReached
              ? 'border-destructive/30 bg-destructive/10 text-destructive'
              : 'border-border bg-secondary/60 text-muted-foreground'
          }`}
        >
          <span>
            {limitReached ? (
              <>You&apos;ve used all {usage.limit} free questions this week.</>
            ) : (
              <>
                <span className="font-medium text-foreground">
                  {remaining} of {usage.limit}
                </span>{' '}
                free interview questions left this week.
              </>
            )}
          </span>
          <Link
            href="/dashboard/billing"
            className="inline-flex items-center gap-1 font-medium text-accent underline-offset-2 hover:underline"
          >
            <Sparkles className="size-3.5" />
            Upgrade for unlimited
          </Link>
        </div>
      )}

      {/* Role selector */}
      <Card className="p-5">
        <label
          htmlFor="role"
          className="text-sm font-medium text-foreground"
        >
          Target role
        </label>
        <p className="mb-3 mt-1 text-sm text-muted-foreground">
          Tell us the career you&apos;re interviewing for and we&apos;ll tailor
          every question and model answer to it.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="e.g. Senior Product Manager"
            className="flex-1"
          />
          {limitReached ? (
            <Button asChild>
              <Link href="/dashboard/billing">
                <Lock className="size-4" />
                Upgrade to continue
              </Link>
            </Button>
          ) : (
            <Button
              onClick={nextQuestion}
              disabled={loadingQuestion || !role.trim()}
            >
              {loadingQuestion ? (
                <>
                  <RefreshCw className="size-4 animate-spin" />
                  Generating…
                </>
              ) : (
                <>
                  <Sparkles className="size-4" />
                  {question ? 'New question' : 'Start practicing'}
                </>
              )}
            </Button>
          )}
        </div>
      </Card>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      {/* Question + answer */}
      {question && (
        <Card className="p-5">
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={categoryStyles[question.category] ?? ''}
            >
              {question.category}
            </Badge>
            <span className="text-xs text-muted-foreground">
              Assessing: {question.focus}
            </span>
          </div>
          <h2 className="mt-3 text-pretty text-lg font-semibold leading-snug">
            {question.question}
          </h2>

          <Textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer here, then submit to get the strongest model answer and feedback…"
            className="mt-4 min-h-36"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <Button onClick={submitAnswer} disabled={evaluating}>
              {evaluating ? (
                <>
                  <RefreshCw className="size-4 animate-spin" />
                  Evaluating…
                </>
              ) : (
                <>
                  <CheckCircle2 className="size-4" />
                  Submit answer
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={submitAnswer}
              disabled={evaluating}
            >
              Skip &amp; show model answer
            </Button>
          </div>
        </Card>
      )}

      {/* Result */}
      {result && (
        <Card className="flex flex-col gap-5 p-5">
          {answer.trim() && (
            <div className="flex items-center justify-between rounded-lg bg-secondary p-4">
              <span className="text-sm font-medium">Your answer score</span>
              <span className={`text-2xl font-bold ${scoreTone(result.score)}`}>
                {result.score}
                <span className="text-base font-normal text-muted-foreground">
                  /100
                </span>
              </span>
            </div>
          )}

          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Lightbulb className="size-4 text-primary" />
              How to answer this kind of question
            </h3>
            <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">
              {result.howToAnswer}
            </p>
          </div>

          <div>
            <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <MessageSquareText className="size-4 text-primary" />
              Strongest model answer
            </h3>
            <p className="mt-2 text-pretty text-sm leading-relaxed text-foreground">
              {result.modelAnswer}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              {result.structure}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Feedback on your answer
            </h3>
            <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">
              {result.feedback}
            </p>
          </div>

          <div>
            <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Lightbulb className="size-4 text-warning" />
              Delivery tips
            </h3>
            <ul className="mt-2 flex flex-col gap-1.5">
              {result.tips.map((tip, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                >
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          {limitReached ? (
            <Button asChild variant="outline">
              <Link href="/dashboard/billing">
                <Lock className="size-4" />
                Upgrade for more questions
              </Link>
            </Button>
          ) : (
            <Button
              onClick={nextQuestion}
              variant="outline"
              disabled={loadingQuestion}
            >
              <Sparkles className="size-4" />
              Next question
            </Button>
          )}
        </Card>
      )}
    </div>
  )
}
