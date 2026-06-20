import { getJobs } from '@/app/actions/jobs'
import { getLatestReport } from '@/app/actions/cv-report'
import { JobSearch } from '@/components/dashboard/job-search'

export default async function JobsPage() {
  const [jobs, report] = await Promise.all([getJobs(), getLatestReport()])

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Find jobs</h1>
        <p className="mt-1 text-muted-foreground">
          Search openings tailored to your profile and apply in one click.
        </p>
      </div>

      <JobSearch initialJobs={jobs} hasCv={!!report} />
    </div>
  )
}
