'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  LogOut,
  FileSearch,
  Briefcase,
  ClipboardList,
  MessagesSquare,
  Users,
  UserRound,
  History,
} from 'lucide-react'
import { BrandMark } from '@/components/brand-logo'

const links = [
  { href: '/dashboard', label: 'Analyze CV', icon: FileSearch, exact: true },
  { href: '/dashboard/jobs', label: 'Find Jobs', icon: Briefcase },
  {
    href: '/dashboard/applications',
    label: 'Applications',
    icon: ClipboardList,
  },
  { href: '/dashboard/interview', label: 'Interview', icon: MessagesSquare },
  { href: '/dashboard/specialists', label: 'Specialists', icon: Users },
]

export function DashboardNav({
  name,
  email,
}: {
  name: string
  email: string
}) {
  const router = useRouter()
  const pathname = usePathname()

  async function handleSignOut() {
    await authClient.signOut()
    router.push('/')
    router.refresh()
  }

  const initials =
    name
      ?.split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'U'

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          aria-label="OfferLab home"
          className="flex shrink-0 items-center gap-2 rounded-md font-semibold tracking-tight outline-none ring-ring transition-opacity hover:opacity-80 focus-visible:ring-2"
        >
          <BrandMark size={32} priority />
          <span className="hidden text-lg sm:inline">OfferLab</span>
        </Link>

        <nav className="flex flex-1 items-center gap-1 overflow-x-auto">
          {links.map((link) => {
            const active = isActive(link.href, link.exact)
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'inline-flex shrink-0 items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 hover:-translate-y-0.5',
                  active
                    ? 'bg-secondary text-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground',
                )}
              >
                <link.icon className="size-4" aria-hidden="true" />
                <span className="hidden md:inline">{link.label}</span>
              </Link>
            )
          })}
        </nav>

        <DropdownMenu>
          <DropdownMenuTrigger
            className="group shrink-0 rounded-full outline-none ring-ring transition-transform duration-200 hover:scale-105 focus-visible:ring-2 data-[popup-open]:scale-105"
            aria-label="Account menu"
          >
            <Avatar className="size-9">
              <AvatarFallback className="bg-secondary text-sm font-medium text-muted-foreground transition-colors duration-200 group-hover:bg-accent group-hover:text-accent-foreground group-data-[popup-open]:bg-accent group-data-[popup-open]:text-accent-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="flex flex-col">
                <span className="truncate">{name || 'Your account'}</span>
                <span className="truncate text-xs font-normal text-muted-foreground">
                  {email}
                </span>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem render={<Link href="/dashboard/profile" />}>
              <UserRound className="size-4" />
              Profile &amp; settings
            </DropdownMenuItem>
            <DropdownMenuItem render={<Link href="/dashboard/history" />}>
              <History className="size-4" />
              CV history
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="size-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
