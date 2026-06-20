import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { History } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProfileForm } from '@/components/dashboard/profile-form'

export const metadata = {
  title: 'Profile & settings · OfferLab',
}

export default async function ProfilePage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in')

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Profile &amp; settings
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your account information.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard/history">
            <History className="size-4" />
            CV history
          </Link>
        </Button>
      </div>

      <div className="mt-6">
        <ProfileForm
          initialName={session.user.name}
          email={session.user.email}
        />
      </div>
    </div>
  )
}
