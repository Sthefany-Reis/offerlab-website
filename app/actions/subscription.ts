'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import {
  subscriptions,
  cvReports,
  usageEvents,
  payments,
} from '@/lib/db/schema'
import { and, desc, eq, gte, sql } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import {
  FREE_MONTHLY_ANALYSES,
  FREE_WEEKLY_INTERVIEW_QUESTIONS,
  FREE_WEEKLY_SPECIALIST_QUESTIONS,
} from '@/lib/plan'

// Monthly Pro price, in cents.
const PRO_PRICE_CENTS = 1200

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

function startOfMonth() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1)
}

// Start of the current week (Monday 00:00 local time).
function startOfWeek() {
  const now = new Date()
  const day = (now.getDay() + 6) % 7 // 0 = Monday
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day)
  return monday
}

// Metered weekly actions and their free-plan limits.
export type MeteredKind = 'interview' | 'specialist'

const WEEKLY_LIMITS: Record<MeteredKind, number> = {
  interview: FREE_WEEKLY_INTERVIEW_QUESTIONS,
  specialist: FREE_WEEKLY_SPECIALIST_QUESTIONS,
}

export type WeeklyUsage = {
  unlimited: boolean
  used: number
  limit: number
  remaining: number
}

// Counts how many times the user has used a metered action this week and
// whether they can use it again. Pro users are unlimited.
export async function getWeeklyUsage(kind: MeteredKind): Promise<WeeklyUsage> {
  const userId = await getUserId()
  const sub = await getSubscription()
  const limit = WEEKLY_LIMITS[kind]

  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(usageEvents)
    .where(
      and(
        eq(usageEvents.userId, userId),
        eq(usageEvents.kind, kind),
        gte(usageEvents.createdAt, startOfWeek()),
      ),
    )

  const used = row?.count ?? 0

  if (sub.active) {
    return { unlimited: true, used, limit: Infinity, remaining: Infinity }
  }

  return { unlimited: false, used, limit, remaining: Math.max(0, limit - used) }
}

// Records one usage event for a metered action.
export async function recordUsage(kind: MeteredKind) {
  const userId = await getUserId()
  await db.insert(usageEvents).values({ userId, kind })
}

export type AnalysisUsage = {
  unlimited: boolean
  used: number
  limit: number
  remaining: number
}

// How many CV analyses the current user has run this month, and whether they
// can run another. Pro users are unlimited; free users get FREE_MONTHLY_ANALYSES.
export async function getAnalysisUsage(): Promise<AnalysisUsage> {
  const userId = await getUserId()
  const sub = await getSubscription()

  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(cvReports)
    .where(
      and(
        eq(cvReports.userId, userId),
        gte(cvReports.createdAt, startOfMonth()),
      ),
    )

  const used = row?.count ?? 0

  if (sub.active) {
    return { unlimited: true, used, limit: Infinity, remaining: Infinity }
  }

  return {
    unlimited: false,
    used,
    limit: FREE_MONTHLY_ANALYSES,
    remaining: Math.max(0, FREE_MONTHLY_ANALYSES - used),
  }
}

export type SubscriptionStatus = {
  plan: 'free' | 'pro'
  active: boolean
  currentPeriodEnd: string | null
}

// Reads the current user's subscription. Everyone starts on the free plan.
export async function getSubscription(): Promise<SubscriptionStatus> {
  const userId = await getUserId()
  const [row] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .limit(1)

  if (!row) return { plan: 'free', active: false, currentPeriodEnd: null }

  const active =
    row.status === 'active' &&
    (!row.currentPeriodEnd || row.currentPeriodEnd.getTime() > Date.now())

  return {
    plan: active ? 'pro' : 'free',
    active,
    currentPeriodEnd: row.currentPeriodEnd?.toISOString() ?? null,
  }
}

// True when the user has an active paid plan. Used to gate premium features
// (cover letters) on the server before doing any premium work.
export async function hasActiveSubscription() {
  const sub = await getSubscription()
  return sub.active
}

// Activates the Pro plan for the current user. In a real deployment this is
// driven by a Stripe webhook after a successful payment; here it is called
// from the success page after the in-app checkout flow completes.
export async function activateSubscription(): Promise<SubscriptionStatus> {
  const userId = await getUserId()
  const periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

  await db
    .insert(subscriptions)
    .values({
      userId,
      plan: 'pro',
      status: 'active',
      currentPeriodEnd: periodEnd,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: subscriptions.userId,
      set: {
        plan: 'pro',
        status: 'active',
        currentPeriodEnd: periodEnd,
        updatedAt: new Date(),
      },
    })

  // Record the charge for payment history. In a real deployment this is driven
  // by the payment processor's webhook; here we log it on successful checkout.
  await db.insert(payments).values({
    userId,
    amount: PRO_PRICE_CENTS,
    currency: 'USD',
    description: 'OfferLab Pro — Monthly',
    status: 'paid',
  })

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/billing')
  return { plan: 'pro', active: true, currentPeriodEnd: periodEnd.toISOString() }
}

export type Payment = {
  id: number
  amount: number
  currency: string
  description: string
  status: string
  createdAt: string
}

// Returns the current user's payment history, newest first.
export async function getPayments(): Promise<Payment[]> {
  const userId = await getUserId()
  const rows = await db
    .select()
    .from(payments)
    .where(eq(payments.userId, userId))
    .orderBy(desc(payments.createdAt))

  return rows.map((r) => ({
    id: r.id,
    amount: r.amount,
    currency: r.currency,
    description: r.description,
    status: r.status,
    createdAt: r.createdAt.toISOString(),
  }))
}

// Cancels the user's subscription (downgrades to free immediately).
export async function cancelSubscription(): Promise<SubscriptionStatus> {
  const userId = await getUserId()
  await db
    .update(subscriptions)
    .set({ plan: 'free', status: 'canceled', updatedAt: new Date() })
    .where(eq(subscriptions.userId, userId))

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/billing')
  return { plan: 'free', active: false, currentPeriodEnd: null }
}
