import Link from 'next/link'
import { Sparkles, RefreshCw } from 'lucide-react'
import { getLatestReport } from '@/app/actions/cv-report'
import type { CvReport } from '@/lib/cv-report-schema'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CvReportView } from '@/components/dashboard/cv-report-view'

export default async function DashboardPage() {
  const row = await getLatestReport()

  if (!row) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">
            Your CV analysis
          </h1>
          <p className="mt-1 text-muted-foreground">
            Start by analyzing your CV to see the roles you qualify for.
          </p>
        </div>

        <Card className="flex flex-col items-center justify-center px-6 py-16 text-center">
          <div className="grid size-12 place-items-center rounded-full bg-secondary text-primary">
            <Sparkles className="size-6" />
          </div>
          <h2 className="mt-5 text-lg font-semibold">Run your first analysis</h2>
          <p className="mt-2 max-w-sm text-pretty text-sm text-muted-foreground">
            Upload your CV to see which jobs you qualify for, the skills to
            improve, a path to the role you want, and an honest CV review.
          </p>
          <Button asChild className="mt-6">
            <Link href="/dashboard/analyze">
              <Sparkles className="size-4" />
              Analyze my CV
            </Link>
          </Button>
        </Card>
      </div>
    )
  }

  const report = row.result as CvReport

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Your CV analysis
          </h1>
          <p className="mt-1 text-muted-foreground">
            Based on the CV you analyzed
            {row.desiredRole ? ` · aiming for ${row.desiredRole}` : ''}.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard/analyze">
            <RefreshCw className="size-4" />
            Re-analyze
          </Link>
        </Button>
      </div>

      <CvReportView report={report} reportId={row.id} />
    </div>
  )
}
