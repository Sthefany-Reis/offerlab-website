import Link from 'next/link'
import { Plus, Sparkles } from 'lucide-react'
import { getAnalyses } from '@/app/actions/analysis'
import type { AnalysisResult } from '@/lib/analysis-schema'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { AnalysisList } from '@/components/dashboard/analysis-list'

export default async function DashboardPage() {
  const rows = await getAnalyses()
  const items = rows.map((r) => ({
    ...r,
    result: r.result as AnalysisResult,
  }))

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Your analyses
          </h1>
          <p className="mt-1 text-muted-foreground">
            Every CV report you have run, saved in one place.
          </p>
        </div>
        {items.length > 0 && (
          <Button asChild>
            <Link href="/dashboard/new">
              <Plus className="size-4" />
              New analysis
            </Link>
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <Card className="flex flex-col items-center justify-center px-6 py-16 text-center">
          <div className="grid size-12 place-items-center rounded-full bg-secondary text-primary">
            <Sparkles className="size-6" />
          </div>
          <h2 className="mt-5 text-lg font-semibold">Run your first analysis</h2>
          <p className="mt-2 max-w-sm text-pretty text-sm text-muted-foreground">
            Upload your CV to get a market-value estimate, skill gaps, a learning
            roadmap, tailored applications, and interview prep.
          </p>
          <Button asChild className="mt-6">
            <Link href="/dashboard/new">
              <Plus className="size-4" />
              New analysis
            </Link>
          </Button>
        </Card>
      ) : (
        <AnalysisList items={items} />
      )}
    </div>
  )
}
