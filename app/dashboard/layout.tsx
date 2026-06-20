import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { DashboardNav } from '@/components/dashboard/dashboard-nav'
import { HelpBot } from '@/components/dashboard/help-bot'
import { getAnalysisUsage } from '@/app/actions/subscription'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in')

  const usage = await getAnalysisUsage()

  return (
    <div className="min-h-svh bg-background">
      <DashboardNav
        name={session.user.name}
        email={session.user.email}
        plan={usage.unlimited ? 'pro' : 'free'}
        analysesLeft={usage.unlimited ? null : usage.remaining}
        analysesLimit={usage.unlimited ? null : usage.limit}
      />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
      <HelpBot />
    </div>
  )
}
