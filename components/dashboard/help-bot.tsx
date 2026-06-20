'use client'

import { useState, useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { MessageCircleQuestion, X, Send, Loader2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getHelpTopic } from '@/lib/help-topics'

function messageText(parts: { type: string; text?: string }[]) {
  return parts
    .filter((p) => p.type === 'text')
    .map((p) => p.text ?? '')
    .join('')
}

export function HelpBot() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const pathname = usePathname()
  const topic = getHelpTopic(pathname)

  // Keep the latest topic in a ref so the chat transport always sends the
  // context for the page the user is currently on, even mid-conversation.
  const topicRef = useRef(topic)
  topicRef.current = topic

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/help-bot',
      prepareSendMessagesRequest: ({ messages }) => ({
        body: {
          messages,
          pageLabel: topicRef.current.label,
          pageContext: topicRef.current.context,
        },
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
  }, [messages, open])

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || busy) return
    sendMessage({ text: input })
    setInput('')
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {/* Chat panel */}
      {open && (
        <div
          role="dialog"
          aria-label="OfferLab help assistant"
          className="flex h-[32rem] max-h-[calc(100svh-6rem)] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-2xl duration-300 animate-in fade-in slide-in-from-bottom-4 zoom-in-95"
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-2 border-b border-border bg-accent px-4 py-3 text-accent-foreground">
            <div className="flex min-w-0 items-center gap-2">
              <div className="grid size-8 shrink-0 place-items-center rounded-full bg-accent-foreground/15">
                <Sparkles className="size-4" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">Help Assistant</p>
                <p className="truncate text-xs text-accent-foreground/80">
                  {topic.label}
                </p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close help assistant"
              className="grid size-7 shrink-0 place-items-center rounded-full text-accent-foreground/80 transition-colors hover:bg-accent-foreground/15 hover:text-accent-foreground"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.length === 0 && (
              <div className="space-y-4">
                <p className="text-pretty text-sm text-muted-foreground">
                  Hi! I&apos;m here to help you with the{' '}
                  <span className="font-medium text-foreground">
                    {topic.label}
                  </span>{' '}
                  page and anything else about OfferLab. Ask me a question or
                  tap one below.
                </p>
                <div className="flex flex-col items-start gap-2">
                  {topic.starters.map((s) => (
                    <button
                      key={s}
                      onClick={() => sendMessage({ text: s })}
                      className="rounded-full border border-border px-3 py-1.5 text-left text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
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
                className={`flex ${
                  m.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[85%] whitespace-pre-wrap text-pretty rounded-2xl px-3.5 py-2 text-sm leading-relaxed duration-200 animate-in fade-in slide-in-from-bottom-1 ${
                    m.role === 'user'
                      ? 'bg-accent text-accent-foreground'
                      : 'bg-secondary text-secondary-foreground'
                  }`}
                >
                  {messageText(m.parts)}
                </div>
              </div>
            ))}

            {status === 'submitted' && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl bg-secondary px-3.5 py-2 text-sm text-muted-foreground">
                  <Loader2 className="size-3.5 animate-spin" />
                  Thinking…
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={onSubmit} className="border-t border-border p-3">
            <div className="flex items-center gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about this page…"
                disabled={busy}
                aria-label="Ask the help assistant"
              />
              <Button
                type="submit"
                size="icon"
                disabled={busy || !input.trim()}
                className="bg-accent text-accent-foreground hover:bg-accent/90"
              >
                <Send className="size-4" />
                <span className="sr-only">Send</span>
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Launcher button */}
      <Button
        onClick={() => setOpen((v) => !v)}
        size="icon"
        className="size-14 rounded-full bg-accent text-accent-foreground shadow-lg transition-transform duration-200 hover:scale-105 hover:bg-accent/90 active:scale-95"
        aria-label={open ? 'Close help assistant' : 'Open help assistant'}
        aria-expanded={open}
      >
        {open ? (
          <X className="size-6 duration-200 animate-in zoom-in-50" />
        ) : (
          <MessageCircleQuestion className="size-6 duration-200 animate-in zoom-in-50" />
        )}
      </Button>
    </div>
  )
}
