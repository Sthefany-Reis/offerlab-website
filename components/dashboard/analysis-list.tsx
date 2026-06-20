'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { deleteAnalysis } from '@/app/actions/analysis'
import type { AnalysisResult } from '@/lib/analysis-schema'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowUpRight, Trash2, Loader2 } from 'lucide-react'

type Item = {
  id: number
  title: string
  targetRole: string | null
  createdAt: Date | string
  result: AnalysisResult
}

function formatMoney(n: number, currency: string) {
  const symbol = currency.toUpperCase().includes('USD') ? '$' : ''
  return `${symbol}${Math.round(n / 1000)}k`
}

export function AnalysisList({ items }: { items: Item[] }) {
  const [list, setList] = useState(items)
  const [pendingId, setPendingId] = useState<number | null>(null)
  const [, startTransition] = useTransition()

  function handleDelete(id: number) {
    setPendingId(id)
    startTransition(async () => {
      try {
        await deleteAnalysis(id)
        setList((prev) => prev.filter((i) => i.id !== id))
        toast.success('Analysis deleted.')
      } catch {
        toast.error('Could not delete that analysis.')
      } finally {
        setPendingId(null)
      }
    })
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {list.map((item) => {
        const mv = item.result.marketValue
        return (
          <Card key={item.id} className="flex flex-col p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate font-semibold">{item.title}</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {new Date(item.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <Badge variant="secondary" className="shrink-0 capitalize">
                {item.result.seniority}
              </Badge>
            </div>

            <div className="mt-4 flex items-end gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Market value</p>
                <p className="text-xl font-semibold tracking-tight">
                  {formatMoney(mv.median, mv.currency)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Skill gaps</p>
                <p className="text-xl font-semibold tracking-tight">
                  {item.result.skillGaps.length}
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between gap-2 border-t border-border pt-4">
              <Button asChild size="sm" variant="ghost">
                <Link href={`/dashboard/analysis/${item.id}`}>
                  View report
                  <ArrowUpRight className="size-4" />
                </Link>
              </Button>
              <Button
                size="icon"
                variant="ghost"
                aria-label="Delete analysis"
                onClick={() => handleDelete(item.id)}
                disabled={pendingId === item.id}
                className="text-muted-foreground hover:text-destructive"
              >
                {pendingId === item.id ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Trash2 className="size-4" />
                )}
              </Button>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
