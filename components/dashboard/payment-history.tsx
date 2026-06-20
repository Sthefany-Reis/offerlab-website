import { CreditCard, Receipt } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Payment } from '@/app/actions/subscription'

function formatAmount(cents: number, currency: string) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
  }).format(cents / 100)
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function PaymentHistory({ payments }: { payments: Payment[] }) {
  return (
    <section className="mt-10">
      <div className="flex items-center gap-2">
        <Receipt className="size-5 text-muted-foreground" />
        <h2 className="text-lg font-semibold tracking-tight">Payment history</h2>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        A record of your subscription charges.
      </p>

      {payments.length === 0 ? (
        <Card className="mt-4 flex flex-col items-center gap-2 p-10 text-center">
          <div className="grid size-11 place-items-center rounded-full bg-secondary text-muted-foreground">
            <CreditCard className="size-5" />
          </div>
          <p className="font-medium">No payments yet</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            When you upgrade to Pro, your charges will appear here.
          </p>
        </Card>
      ) : (
        <Card className="mt-4 overflow-hidden p-0">
          <ul className="divide-y divide-border">
            {payments.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between gap-4 p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="grid size-10 shrink-0 place-items-center rounded-full bg-secondary text-muted-foreground">
                    <CreditCard className="size-5" />
                  </div>
                  <div>
                    <p className="font-medium">{p.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(p.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-medium tabular-nums">
                    {formatAmount(p.amount, p.currency)}
                  </span>
                  <Badge
                    variant={p.status === 'paid' ? 'secondary' : 'outline'}
                    className="capitalize"
                  >
                    {p.status}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </section>
  )
}
