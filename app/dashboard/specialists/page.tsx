import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { MessageSquare } from 'lucide-react'
import { LinkedinIcon } from '@/components/icons/linkedin-icon'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { specialists } from '@/lib/specialists'

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
          Chat with an AI specialist for tailored guidance, then connect with
          them on LinkedIn when you&apos;re ready.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {specialists.map((s) => (
          <Card key={s.id} className="flex flex-col p-5">
            <div className="flex items-center gap-3">
              <div className="grid size-11 shrink-0 place-items-center rounded-full bg-primary/15 text-base font-semibold text-primary">
                {s.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </div>
              <div className="min-w-0">
                <h2 className="truncate font-semibold">{s.name}</h2>
                <p className="truncate text-xs text-muted-foreground">
                  {s.title}
                </p>
              </div>
            </div>

            <p className="mt-3 text-sm font-medium text-primary">
              {s.specialty}
            </p>
            <p className="mt-1 flex-1 text-pretty text-sm leading-relaxed text-muted-foreground">
              {s.bio}
            </p>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {s.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="font-normal">
                  {tag}
                </Badge>
              ))}
            </div>

            <div className="mt-4 flex gap-2">
              <Button asChild size="sm" className="flex-1">
                <Link href={`/dashboard/specialists/${s.id}`}>
                  <MessageSquare className="size-3.5" />
                  Chat
                </Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <a href={s.linkedIn} target="_blank" rel="noopener noreferrer">
                  <LinkedinIcon className="size-3.5" />
                  Connect
                </a>
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
