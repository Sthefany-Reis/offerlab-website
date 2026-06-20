import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { CvIntake } from '@/components/dashboard/cv-intake'

export default function NewAnalysisPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to dashboard
      </Link>

      <div className="mt-4 mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">New CV analysis</h1>
        <p className="mt-1 text-pretty text-muted-foreground">
          Paste your CV or upload a file. Add a target role for sharper, more
          tailored results.
        </p>
      </div>

      <CvIntake />
    </div>
  )
}
