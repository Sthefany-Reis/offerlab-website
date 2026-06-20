'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { subscriptions, cvReports } from '@/lib/db/schema'
import { and, eq, gte, sql } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { FREE_MONTHLY_ANALYSES } from '@/lib/plan'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

function startOfMonth() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1)
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

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/billing')
  return { plan: 'pro', active: true, currentPeriodEnd: periodEnd.toISOString() }
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
