'use client'

import { useState, useRef, useEffect } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import Link from 'next/link'
import { ArrowLeft, Send, Loader2 } from 'lucide-react'
import { LinkedinIcon } from '@/components/icons/linkedin-icon'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { Specialist } from '@/lib/specialists'

function specialistInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
}

function messageText(parts: { type: string; text?: string }[]) {
  return parts
    .filter((p) => p.type === 'text')
    .map((p) => p.text ?? '')
    .join('')
}

export function SpecialistChat({ specialist }: { specialist: Specialist }) {
  const [input, setInput] = useState('')
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/specialist-chat',
      prepareSendMessagesRequest: ({ messages }) => ({
        body: { messages, specialistId: specialist.id },
      }),
    }),
  })
  const scrollRef = useRef<HTMLDivElement>(null)
  const busy = status === 'streaming' || status === 'submitted'

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [messages])

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || busy) return
    sendMessage({ text: input })
    setInput('')
  }

  const starters = [
    `How do I break into ${specialist.specialty.toLowerCase()}?`,
    'Review how I should frame my experience.',
    'What skills should I focus on next?',
  ]

  return (
    <div className="mx-auto flex h-[calc(100vh-3.5rem)] w-full max-w-3xl flex-col px-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b py-4">
        <div className="flex min-w-0 items-center gap-3">
          <Button asChild variant="ghost" size="icon" className="shrink-0">
            <Link href="/dashboard/specialists" aria-label="Back to specialists">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <Avatar className="size-10 shrink-0">
            <AvatarImage src={specialist.photo} alt={`${specialist.name} headshot`} />
            <AvatarFallback className="bg-primary/15 text-sm font-semibold text-primary">
              {specialistInitials(specialist.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h1 className="truncate font-semibold">{specialist.name}</h1>
            <p className="truncate text-xs text-muted-foreground">
              {specialist.title}
            </p>
          </div>
        </div>
        <Button asChild variant="outline" size="sm" className="shrink-0">
          <a
            href={specialist.linkedIn}
            target="_blank"
            rel="noopener noreferrer"
          >
            <LinkedinIcon className="size-3.5" />
            <span className="hidden sm:inline">Connect</span>
          </a>
        </Button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto py-6">
        {messages.length === 0 && (
          <div className="flex flex-col items-center gap-4 py-10 text-center">
            <Avatar className="size-14">
              <AvatarImage src={specialist.photo} alt={`${specialist.name} headshot`} />
              <AvatarFallback className="bg-primary/15 text-lg font-semibold text-primary">
                {specialistInitials(specialist.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">
                Chat with {specialist.name.split(' ')[0]}
              </p>
              <p className="mx-auto mt-1 max-w-sm text-pretty text-sm text-muted-foreground">
                {specialist.bio}
              </p>
            </div>
            <div className="flex flex-col items-center gap-2">
              {starters.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage({ text: s })}
                  className="rounded-full border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] whitespace-pre-wrap text-pretty rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                m.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground'
              }`}
            >
              {messageText(m.parts)}
            </div>
          </div>
        ))}

        {status === 'submitted' && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 rounded-2xl bg-secondary px-4 py-2.5 text-sm text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin" />
              {specialist.name.split(' ')[0]} is typing…
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={onSubmit} className="border-t py-4">
        <div className="flex items-center gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Message ${specialist.name.split(' ')[0]}…`}
            disabled={busy}
          />
          <Button type="submit" size="icon" disabled={busy || !input.trim()}>
            <Send className="size-4" />
            <span className="sr-only">Send</span>
          </Button>
        </div>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          AI specialist responses are guidance only. Connect on LinkedIn to
          reach {specialist.name.split(' ')[0]} directly.
        </p>
      </form>
    </div>
  )
}
