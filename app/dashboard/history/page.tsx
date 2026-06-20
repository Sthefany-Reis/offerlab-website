import Link from 'next/link'
import { FileText, Plus, ArrowRight } from 'lucide-react'
import { getReports } from '@/app/actions/cv-report'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export const metadata = {
  title: 'CV history · OfferLab',
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date))
}

export default async function HistoryPage() {
  const reports = await getReports()

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">CV history</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Every CV analysis you&apos;ve run, newest first.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard">
            <Plus className="size-4" />
            New analysis
          </Link>
        </Button>
      </div>

      {reports.length === 0 ? (
        <Card className="mt-6 flex flex-col items-center gap-3 p-10 text-center">
          <div className="grid size-12 place-items-center rounded-full bg-secondary">
            <FileText className="size-6 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">No analyses yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Analyze your CV to see your qualified roles and skill gaps.
            </p>
          </div>
          <Button asChild className="mt-2">
            <Link href="/dashboard">Analyze my CV</Link>
          </Button>
        </Card>
      ) : (
        <div className="mt-6 space-y-3">
          {reports.map((report) => (
            <Link key={report.id} href={`/dashboard/report/${report.id}`}>
              <Card className="flex flex-row items-center justify-between gap-4 p-5 text-left transition-colors hover:border-primary/40 hover:bg-secondary/40">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold">
                      {report.detectedRole ?? 'CV analysis'}
                    </h3>
                    {report.seniority && (
                      <Badge variant="secondary">{report.seniority}</Badge>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {report.desiredRole
                      ? `Target: ${report.desiredRole}`
                      : 'No target role set'}
                    {' · '}
                    {formatDate(report.createdAt)}
                  </p>
                </div>
                <ArrowRight className="size-5 shrink-0 text-muted-foreground" />
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
