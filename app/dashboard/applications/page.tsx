import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getApplications } from '@/app/actions/jobs'
import { ApplicationsList } from '@/components/dashboard/applications-list'

export default async function ApplicationsPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in')

  const items = await getApplications()

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Applications</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track every role you&apos;ve applied to and update its status as you
          move through the process.
        </p>
      </header>
      <ApplicationsList items={items} />
    </div>
  )
}
