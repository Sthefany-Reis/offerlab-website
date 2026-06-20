import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { specialists } from '@/lib/specialists'
import { SpecialistsBrowser } from '@/components/dashboard/specialists-browser'

export default async function SpecialistsPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in')

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          Career specialists
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Search for the right expert or browse our recommendations, chat with
          an AI specialist for tailored guidance, then connect with them on
          LinkedIn when you&apos;re ready.
        </p>
      </header>

      <SpecialistsBrowser specialists={specialists} />
    </div>
  )
}
