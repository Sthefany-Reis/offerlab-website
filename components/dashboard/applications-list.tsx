'use client'

import { useState, useTransition } from 'react'
import {
  Building2,
  MapPin,
  ExternalLink,
  Trash2,
  Briefcase,
} from 'lucide-react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  updateApplicationStatus,
  withdrawApplication,
  type ApplicationWithJob,
  type ApplicationStatus,
} from '@/app/actions/jobs'

const STATUSES: { value: ApplicationStatus; label: string }[] = [
  { value: 'applied', label: 'Applied' },
  { value: 'interviewing', label: 'Interviewing' },
  { value: 'offer', label: 'Offer' },
  { value: 'rejected', label: 'Rejected' },
]

const statusStyles: Record<string, string> = {
  applied: 'bg-accent/15 text-accent border-accent/30',
  interviewing: 'bg-primary/15 text-primary border-primary/30',
  offer: 'bg-success/15 text-success border-success/30',
  rejected: 'bg-muted text-muted-foreground border-border',
}

function fmtSalary(low: number | null, high: number | null, currency: string) {
  if (!low && !high) return null
  const f = (n: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
      notation: 'compact',
    }).format(n)
  if (low && high) return `${f(low)} – ${f(high)}`
  return f((low || high) as number)
}

export function ApplicationsList({ items }: { items: ApplicationWithJob[] }) {
  if (items.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center gap-3 p-12 text-center">
        <div className="grid size-12 place-items-center rounded-full bg-secondary">
          <Briefcase className="size-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium">No applications yet</h3>
        <p className="max-w-sm text-pretty text-sm text-muted-foreground">
          Find roles you qualify for and apply — every application you submit
          will show up here so you can track its progress.
        </p>
        <Button asChild className="mt-2">
          <Link href="/dashboard/jobs">Find jobs</Link>
        </Button>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {items.map((item) => (
        <ApplicationRow key={item.id} item={item} />
      ))}
    </div>
  )
}

function ApplicationRow({ item }: { item: ApplicationWithJob }) {
  const [status, setStatus] = useState<ApplicationStatus>(
    item.status as ApplicationStatus,
  )
  const [isPending, startTransition] = useTransition()
  const salary = fmtSalary(item.salaryLow, item.salaryHigh, item.currency)

  function onStatusChange(next: string) {
    setStatus(next as ApplicationStatus)
    startTransition(async () => {
      await updateApplicationStatus(item.id, next as ApplicationStatus)
    })
  }

  function onWithdraw() {
    startTransition(async () => {
      await withdrawApplication(item.id)
    })
  }

  const linkedInUrl = `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(
    `${item.title} ${item.company}`,
  )}`

  return (
    <Card className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-base font-semibold">{item.title}</h3>
          <Badge
            variant="outline"
            className={statusStyles[status] ?? statusStyles.applied}
          >
            {STATUSES.find((s) => s.value === status)?.label ?? status}
          </Badge>
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Building2 className="size-3.5" />
            {item.company}
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="size-3.5" />
            {item.location} · {item.workMode}
          </span>
          {salary && <span>{salary}</span>}
        </div>
      </div>

      <div className="flex shrink-0 flex-col gap-2 sm:w-48">
        <Select value={status} onValueChange={onStatusChange} disabled={isPending}>
          <SelectTrigger aria-label="Application status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUSES.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button asChild variant="outline" size="sm">
          <a href={linkedInUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="size-3.5" />
            View on LinkedIn
          </a>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onWithdraw}
          disabled={isPending}
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="size-3.5" />
          Withdraw
        </Button>
      </div>
    </Card>
  )
}
