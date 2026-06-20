'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { MessageSquare, Search, Sparkles, Users } from 'lucide-react'
import { LinkedinIcon } from '@/components/icons/linkedin-icon'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { Specialist } from '@/lib/specialists'

function initials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
}

function SpecialistCard({ s }: { s: Specialist }) {
  return (
    <Card className="flex flex-col p-5">
      <div className="flex items-center gap-3">
        <Avatar className="size-12 shrink-0">
          <AvatarImage src={s.photo} alt={`${s.name} headshot`} />
          <AvatarFallback className="bg-primary/15 text-base font-semibold text-primary">
            {initials(s.name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <h2 className="truncate font-semibold">{s.name}</h2>
          <p className="truncate text-xs text-muted-foreground">{s.title}</p>
        </div>
      </div>

      <p className="mt-3 text-sm font-medium text-primary">{s.specialty}</p>
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
  )
}

export function SpecialistsBrowser({
  specialists,
}: {
  specialists: Specialist[]
}) {
  const [query, setQuery] = useState('')

  const q = query.trim().toLowerCase()

  const results = useMemo(() => {
    if (!q) return specialists
    return specialists.filter((s) =>
      [s.name, s.title, s.specialty, s.bio, ...s.tags]
        .join(' ')
        .toLowerCase()
        .includes(q),
    )
  }, [q, specialists])

  const recommended = useMemo(
    () => specialists.filter((s) => s.recommended),
    [specialists],
  )

  const isSearching = q.length > 0

  return (
    <div className="space-y-8">
      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, specialty, or skill (e.g. data, design, negotiation)"
          className="pl-9"
          aria-label="Search specialists"
        />
      </div>

      {isSearching ? (
        <section>
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <Users className="size-4" />
            {`${results.length} ${
              results.length === 1 ? 'result' : 'results'
            } for `}
            &ldquo;{query}&rdquo;
          </h2>
          {results.length === 0 ? (
            <Card className="flex flex-col items-center justify-center gap-2 p-12 text-center">
              <p className="font-medium">No specialists match your search</p>
              <p className="max-w-sm text-pretty text-sm text-muted-foreground">
                Try a broader term like &ldquo;engineering&rdquo;,
                &ldquo;product&rdquo;, or &ldquo;career change&rdquo;.
              </p>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((s) => (
                <SpecialistCard key={s.id} s={s} />
              ))}
            </div>
          )}
        </section>
      ) : (
        <>
          {recommended.length > 0 && (
            <section>
              <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
                <Sparkles className="size-4 text-primary" />
                Recommended for you
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {recommended.map((s) => (
                  <SpecialistCard key={s.id} s={s} />
                ))}
              </div>
            </section>
          )}

          <section>
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
              <Users className="size-4 text-muted-foreground" />
              All specialists
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {specialists.map((s) => (
                <SpecialistCard key={s.id} s={s} />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  )
}
