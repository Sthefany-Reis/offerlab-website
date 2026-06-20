import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { getAnalysis } from '@/app/actions/analysis'
import type { AnalysisResult } from '@/lib/analysis-schema'
import { ReportView } from '@/components/dashboard/report/report-view'

export default async function AnalysisPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const numericId = Number(id)
  if (!Number.isFinite(numericId)) notFound()

  const row = await getAnalysis(numericId)
  if (!row) notFound()

  const result = row.result as AnalysisResult

  return (
    <div>
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to dashboard
      </Link>

      <div className="mb-6 mt-4">
        <h1 className="text-balance text-2xl font-semibold tracking-tight">
          {row.title}
        </h1>
        {row.targetRole && (
          <p className="mt-1 text-muted-foreground">
            Tailored for{' '}
            <span className="text-foreground">{row.targetRole}</span>
          </p>
        )}
      </div>

      <ReportView result={result} />
    </div>
  )
}
