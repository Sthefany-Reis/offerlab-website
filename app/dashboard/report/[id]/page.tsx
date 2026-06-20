import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getReport } from '@/app/actions/cv-report'
import { getSubscription } from '@/app/actions/subscription'
import { CvReportView } from '@/components/dashboard/cv-report-view'
import type { CvReport } from '@/lib/cv-report-schema'
import { Button } from '@/components/ui/button'

export const metadata = {
  title: 'CV report · OfferLab',
}

export default async function ReportPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const reportId = Number(id)
  if (Number.isNaN(reportId)) notFound()

  const row = await getReport(reportId)
  if (!row) notFound()

  const sub = await getSubscription()

  return (
    <div>
      <Button asChild variant="ghost" size="sm" className="mb-4">
        <Link href="/dashboard/history">
          <ArrowLeft className="size-4" />
          Back to history
        </Link>
      </Button>
      <CvReportView
        report={row.result as CvReport}
        reportId={row.id}
        isPro={sub.active}
      />
    </div>
  )
}
