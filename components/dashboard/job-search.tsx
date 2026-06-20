'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { searchJobs, applyToJob } from '@/app/actions/jobs'
import type { JobRow } from '@/lib/db/schema'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Check,
  Loader2,
  MapPin,
  Search,
  Briefcase,
  Building2,
} from 'lucide-react'

type Job = JobRow & { applied: boolean }

const WORK_MODES = ['any', 'remote', 'hybrid', 'onsite'] as const

function fmt(n: number | null, currency: string) {
  if (n == null) return null
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
  if (score >= 80) return 'text-success'
  if (score >= 60) return 'text-primary'
  return 'text-warning'
}

export function JobSearch({
  initialJobs,
  hasCv,
}: {
  initialJobs: Job[]
  hasCv: boolean
}) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [location, setLocation] = useState('')
  const [workMode, setWorkMode] = useState<(typeof WORK_MODES)[number]>('any')
  const [searching, setSearching] = useState(false)
  const [applyingId, setApplyingId] = useState<number | null>(null)
  const [, startTransition] = useTransition()

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim().length < 2) {
      toast.error('Enter a role or keyword to search.')
      return
    }
    setSearching(true)
    const res = await searchJobs({ query, location, workMode })
    setSearching(false)
    if ('error' in res) {
      toast.error(res.error)
      return
    }
    startTransition(() => router.refresh())
    toast.success('Found matching roles.')
  }

  async function handleApply(jobId: number) {
    setApplyingId(jobId)
    const res = await applyToJob(jobId)
    setApplyingId(null)
    if ('error' in res) {
      toast.error(res.error)
      return
    }
    toast.success('Application tracked.')
    startTransition(() => router.refresh())
  }

  return (
    <div className="space-y-6">
      <Card className="p-4 sm:p-5">
        <form onSubmit={handleSearch} className="flex flex-col gap-3">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Role or keywords, e.g. Frontend Engineer"
                className="pl-9"
                disabled={searching}
              />
            </div>
            <div className="relative sm:w-56">
              <MapPin className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Location (optional)"
                className="pl-9"
                disabled={searching}
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1.5">
              {WORK_MODES.map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setWorkMode(mode)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium capitalize transition-colors ${
                    workMode === mode
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border text-muted-foreground hover:bg-secondary'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
            <Button type="submit" disabled={searching}>
              {searching ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="size-4" />
                  Search jobs
                </>
              )}
            </Button>
          </div>
        </form>
        {!hasCv && (
          <p className="mt-3 text-xs text-muted-foreground">
            Tip: analyze your CV first so we can score how well you match each
            role.
          </p>
        )}
      </Card>

      {initialJobs.length === 0 ? (
        <Card className="flex flex-col items-center justify-center px-6 py-16 text-center">
          <div className="grid size-12 place-items-center rounded-full bg-secondary text-primary">
            <Briefcase className="size-6" />
          </div>
          <h2 className="mt-5 text-lg font-semibold">Search for openings</h2>
          <p className="mt-2 max-w-sm text-pretty text-sm text-muted-foreground">
            Enter a role above to generate matching job postings tailored to your
            profile.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {initialJobs.map((job) => {
            const salary =
              fmt(job.salaryLow, job.currency) &&
              fmt(job.salaryHigh, job.currency)
                ? `${fmt(job.salaryLow, job.currency)} – ${fmt(job.salaryHigh, job.currency)}`
                : null
            return (
              <Card key={job.id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold">{job.title}</h3>
                      {job.matchScore > 0 && (
                        <span
                          className={`text-sm font-semibold ${matchTone(job.matchScore)}`}
                        >
                          {job.matchScore}% match
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Building2 className="size-3.5" />
                        {job.company}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="size-3.5" />
                        {job.location}
                      </span>
                      <Badge variant="secondary" className="capitalize">
                        {job.workMode}
                      </Badge>
                      <Badge variant="secondary" className="capitalize">
                        {job.employmentType}
                      </Badge>
                    </div>
                  </div>
                  <div className="shrink-0">
                    {job.applied ? (
                      <Button variant="outline" disabled>
                        <Check className="size-4" />
                        Applied
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleApply(job.id)}
                        disabled={applyingId === job.id}
                      >
                        {applyingId === job.id ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : null}
                        Apply
                      </Button>
                    )}
                  </div>
                </div>

                {salary && (
                  <p className="mt-3 text-sm font-medium">{salary}</p>
                )}
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {job.summary}
                </p>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium text-foreground">
                      Requirements
                    </p>
                    <ul className="mt-2 space-y-1">
                      {(job.requirements as string[]).map((r) => (
                        <li
                          key={r}
                          className="flex gap-2 text-sm text-muted-foreground"
                        >
                          <span className="mt-2 size-1 shrink-0 rounded-full bg-muted-foreground" />
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-foreground">
                      Nice to have
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {(job.niceToHaves as string[]).map((n) => (
                        <span
                          key={n}
                          className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-secondary-foreground"
                        >
                          {n}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
