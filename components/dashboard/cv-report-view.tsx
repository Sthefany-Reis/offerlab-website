'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { regenerateCv, updateDesiredRole } from '@/app/actions/cv-report'
import type { CvReport, DesiredRolePlan } from '@/lib/cv-report-schema'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CoverLetterTool } from '@/components/dashboard/cover-letter-tool'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Briefcase,
  Building2,
  CheckCircle2,
  Copy,
  GraduationCap,
  Info,
  Loader2,
  Pencil,
  PenLine,
  RefreshCw,
  Sparkles,
  Target,
  TriangleAlert,
  Wand2,
} from 'lucide-react'

function fmt(n: number, currency: string) {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      maximumFractionDigits: 0,
    }).format(n)
  } catch {
    return `${currency} ${n.toLocaleString()}`
  }
}

function matchTone(score: number) {
  if (score >= 80) return { bar: 'bg-success', text: 'text-success' }
  if (score >= 60) return { bar: 'bg-primary', text: 'text-primary' }
  return { bar: 'bg-warning', text: 'text-warning' }
}

const severityStyles: Record<
  CvReport['skillGaps'][number]['importance'],
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

export function CvReportView({
  report,
  reportId,
  isPro = false,
}: {
  report: CvReport
  reportId: number
  isPro?: boolean
}) {
  const [regenerating, setRegenerating] = useState(false)
  const [newCv, setNewCv] = useState<string | null>(null)
  const [plan, setPlan] = useState<DesiredRolePlan>(report.desiredRolePlan)
  const [updatingRole, setUpdatingRole] = useState(false)
  const [customRole, setCustomRole] = useState('')

  // Recommended roles the candidate can aim for: their best current fit plus
  // every role they already qualify for, de-duplicated.
  const recommendedRoles = Array.from(
    new Set([
      report.detectedRole,
      ...report.qualifiedRoles.map((r) => r.title),
    ]),
  )

  async function chooseDreamRole(role: string) {
    const target = role.trim()
    if (!target || updatingRole) return
    setUpdatingRole(true)
    const res = await updateDesiredRole(reportId, target)
    setUpdatingRole(false)
    if ('error' in res) {
      toast.error(res.error)
      return
    }
    setPlan(res.plan)
    setCustomRole('')
    toast.success(`Updated your plan for ${target}.`)
  }

  async function handleRegenerate() {
    setRegenerating(true)
    const res = await regenerateCv(reportId)
    setRegenerating(false)
    if ('error' in res) {
      toast.error(res.error)
      return
    }
    setNewCv(res.cv)
    toast.success('Here is your regenerated CV.')
  }

  async function copyCv() {
    if (!newCv) return
    try {
      // Preferred API — may be blocked by iframe permissions policy.
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(newCv)
        toast.success('CV copied to clipboard.')
        return
      }
      throw new Error('Clipboard API unavailable')
    } catch {
      // Fallback for sandboxed/iframe contexts where the Clipboard API is blocked.
      try {
        const textarea = document.createElement('textarea')
        textarea.value = newCv
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'
        document.body.appendChild(textarea)
        textarea.focus()
        textarea.select()
        const ok = document.execCommand('copy')
        document.body.removeChild(textarea)
        if (ok) {
          toast.success('CV copied to clipboard.')
        } else {
          toast.error('Copy failed. Please select the text and copy manually.')
        }
      } catch {
        toast.error('Copy failed. Please select the text and copy manually.')
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Best current fit</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">
              {report.detectedRole}
            </h2>
            <Badge variant="secondary" className="mt-2 capitalize">
              {report.seniority} level
            </Badge>
          </div>
        </div>
        <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
          {report.summary}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {report.strengths.map((s) => (
            <span
              key={s}
              className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground"
            >
              <CheckCircle2 className="size-3.5 text-success" />
              {s}
            </span>
          ))}
        </div>
      </Card>

      <Tabs defaultValue="jobs">
        <TabsList className="grid w-full grid-cols-3 sm:grid-cols-5">
          <TabsTrigger value="jobs">
            <Briefcase className="size-4" />
            <span className="hidden sm:inline">Qualified for</span>
            <span className="sm:hidden">Jobs</span>
          </TabsTrigger>
          <TabsTrigger value="skills">
            <Target className="size-4" />
            Skills
          </TabsTrigger>
          <TabsTrigger value="path">
            <GraduationCap className="size-4" />
            <span className="hidden sm:inline">Dream role</span>
            <span className="sm:hidden">Path</span>
          </TabsTrigger>
          <TabsTrigger value="cv">
            <Sparkles className="size-4" />
            <span className="hidden sm:inline">CV quality</span>
            <span className="sm:hidden">CV</span>
          </TabsTrigger>
          <TabsTrigger value="cover">
            <PenLine className="size-4" />
            <span className="hidden sm:inline">Cover letter</span>
            <span className="sm:hidden">Letter</span>
          </TabsTrigger>
        </TabsList>

        {/* Qualified roles */}
        <TabsContent value="jobs" className="mt-4 space-y-3">
          <p className="text-sm text-muted-foreground">
            Roles you can realistically get hired for right now, based on your CV.
          </p>
          {report.qualifiedRoles.map((role, i) => {
            const tone = matchTone(role.matchScore)
            return (
              <Card
                key={role.title}
                className="p-5 transition-all duration-200 animate-in fade-in slide-in-from-bottom-2 fill-mode-both hover:-translate-y-0.5 hover:shadow-md"
                style={{ animationDelay: `${i * 70}ms` }}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-semibold">{role.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {role.why}
                    </p>
                    <p className="mt-2 text-sm font-medium">
                      {fmt(role.salaryLow, role.currency)} –{' '}
                      {fmt(role.salaryHigh, role.currency)}
                    </p>
                  </div>
                  <div className="w-32 shrink-0">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Match</span>
                      <span className={`font-semibold ${tone.text}`}>
                        {role.matchScore}%
                      </span>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full ${tone.bar}`}
                        style={{ width: `${role.matchScore}%` }}
                      />
                    </div>
                  </div>
                </div>

                <Dialog>
                  <DialogTrigger
                    render={
                      <Button
                        variant="outline"
                        size="xs"
                        className="mt-3 border-accent/30 bg-accent/10 text-accent transition-colors hover:bg-accent/20 hover:text-accent dark:bg-accent/15"
                      />
                    }
                  >
                    <Info />
                    View role &amp; companies
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>{role.title}</DialogTitle>
                      <DialogDescription>
                        {fmt(role.salaryLow, role.currency)} –{' '}
                        {fmt(role.salaryHigh, role.currency)} · {role.matchScore}%
                        match
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-semibold">
                          About this role
                        </h4>
                        <p className="mt-1.5 text-pretty text-sm leading-relaxed text-muted-foreground">
                          {role.description}
                        </p>
                      </div>
                      <div>
                        <h4 className="flex items-center gap-1.5 text-sm font-semibold">
                          <Building2 className="size-4 text-primary" />
                          Companies hiring for this
                        </h4>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {role.companies?.map((c) => (
                            <span
                              key={c}
                              className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground"
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </Card>
            )
          })}
        </TabsContent>

        {/* Skill gaps */}
        <TabsContent value="skills" className="mt-4 space-y-3">
          <p className="text-sm text-muted-foreground">
            Skills to improve, prioritized by impact.
          </p>
          {report.skillGaps.map((gap) => {
            const style = severityStyles[gap.importance]
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
                    <span
                      className={`rounded-full border px-2 py-0.5 text-xs font-medium ${style.className}`}
                    >
                      {style.label}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    {gap.reason}
                  </p>
                </div>
              </Card>
            )
          })}
        </TabsContent>

        {/* Desired role plan */}
        <TabsContent value="path" className="mt-4 space-y-4">
          {/* Dream role chooser */}
          <Card className="p-6">
            <h3 className="flex items-center gap-2 font-semibold">
              <Wand2 className="size-4 text-accent" />
              Choose your dream role
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Use a role we recommend, or aim for something else entirely. We&apos;ll
              rebuild your plan for it.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {recommendedRoles.map((role) => {
                const active =
                  role.toLowerCase() === plan.desiredRole.toLowerCase()
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => chooseDreamRole(role)}
                    disabled={updatingRole}
                    aria-pressed={active}
                    className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-all hover:-translate-y-0.5 disabled:opacity-50 ${
                      active
                        ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                        : 'border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground'
                    }`}
                  >
                    {role}
                  </button>
                )
              })}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                chooseDreamRole(customRole)
              }}
              className="mt-4 flex flex-col gap-2 sm:flex-row"
            >
              <div className="relative flex-1">
                <Pencil className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={customRole}
                  onChange={(e) => setCustomRole(e.target.value)}
                  placeholder="Or type a different dream role…"
                  className="pl-9"
                  disabled={updatingRole}
                  aria-label="Custom dream role"
                />
              </div>
              <Button
                type="submit"
                disabled={updatingRole || !customRole.trim()}
              >
                {updatingRole ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Updating…
                  </>
                ) : (
                  <>
                    <Wand2 className="size-4" />
                    Build plan
                  </>
                )}
              </Button>
            </form>
          </Card>

          <div
            key={plan.desiredRole}
            className="space-y-4 animate-in fade-in slide-in-from-bottom-1 duration-300"
          >
          {plan.isMismatch && (
            <Card className="flex items-start gap-3 border-warning/30 bg-warning/10 p-4">
              <TriangleAlert className="mt-0.5 size-5 shrink-0 text-warning" />
              <p className="text-sm leading-relaxed">
                Your CV is currently a stronger fit for{' '}
                <span className="font-semibold">{plan.bestFitRole}</span> than for{' '}
                <span className="font-semibold">{plan.desiredRole}</span>. Here is
                how to close that gap.
              </p>
            </Card>
          )}

          <Card className="p-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-sm text-muted-foreground">Target role</p>
                <h3 className="text-xl font-semibold">{plan.desiredRole}</h3>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Current fit</p>
                <p className="text-2xl font-semibold text-primary">
                  {plan.currentFit}%
                </p>
              </div>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${plan.currentFit}%` }}
              />
            </div>
            <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
              {plan.summary}
            </p>
          </Card>

          <Card className="p-6">
            <h3 className="flex items-center gap-2 font-semibold">
              <GraduationCap className="size-4 text-primary" />
              Recommended certifications
            </h3>
            <div className="mt-4 space-y-3">
              {plan.certifications.map((c) => (
                <div
                  key={c.name}
                  className="rounded-lg border border-border p-4"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{c.name}</span>
                    <Badge variant="secondary">{c.provider}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{c.why}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="flex items-center gap-2 font-semibold">
              <Target className="size-4 text-primary" />
              Skills to acquire
            </h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {plan.skillsToLearn.map((s) => (
                <span
                  key={s}
                  className="rounded-full bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground"
                >
                  {s}
                </span>
              ))}
            </div>
          </Card>
          </div>
        </TabsContent>

        {/* CV quality */}
        <TabsContent value="cv" className="mt-4 space-y-4">
          <Card className="p-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h3 className="font-semibold">CV quality score</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  How well your CV is written and structured.
                </p>
              </div>
              <p
                className={`text-3xl font-semibold ${matchTone(report.cvQuality.score).text}`}
              >
                {report.cvQuality.score}
                <span className="text-base text-muted-foreground">/100</span>
              </p>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-success">What works</p>
                <ul className="mt-2 space-y-1.5">
                  {report.cvQuality.strengths.map((s) => (
                    <li key={s} className="flex gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-sm font-medium text-warning">Needs work</p>
                <ul className="mt-2 space-y-1.5">
                  {report.cvQuality.issues.map((s) => (
                    <li key={s} className="flex gap-2 text-sm text-muted-foreground">
                      <TriangleAlert className="mt-0.5 size-4 shrink-0 text-warning" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-secondary/60 p-4">
              <p className="text-sm">
                {report.cvQuality.needsRedesign
                  ? 'We think your CV could be holding you back. Regenerate a cleaner version from your information.'
                  : 'Your CV is solid. You can still regenerate a polished version if you like.'}
              </p>
              <Button onClick={handleRegenerate} disabled={regenerating}>
                {regenerating ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Regenerating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="size-4" />
                    Regenerate CV
                  </>
                )}
              </Button>
            </div>
          </Card>

          {newCv && (
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Your regenerated CV</h3>
                <Button variant="outline" size="sm" onClick={copyCv}>
                  <Copy className="size-4" />
                  Copy
                </Button>
              </div>
              <pre className="mt-4 max-h-[28rem] overflow-auto whitespace-pre-wrap rounded-lg bg-secondary/50 p-4 text-sm leading-relaxed">
                {newCv}
              </pre>
            </Card>
          )}
        </TabsContent>

        {/* Cover letter */}
        <TabsContent value="cover" className="mt-4 space-y-4">
          <div>
            <h3 className="font-semibold">AI cover letter</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Generate a tailored cover letter for your dream role, or paste one
              to get an honest rating.
            </p>
          </div>
          <CoverLetterTool isPro={isPro} jobTitle={report.detectedRole} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
