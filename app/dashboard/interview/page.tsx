import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { InterviewPractice } from '@/components/dashboard/interview-practice'
import { getWeeklyUsage } from '@/app/actions/subscription'

export default async function InterviewPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in')

  const usage = await getWeeklyUsage('interview')

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          Interview practice
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Answer realistic questions for your target role and get the strongest
          model answer plus personalized feedback.
        </p>
      </header>
      <InterviewPractice usage={usage} />
    </div>
  )
}
