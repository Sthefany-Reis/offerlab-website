'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { jobs, applications, cvReports } from '@/lib/db/schema'
import { jobSearchSchema, type GeneratedJob } from '@/lib/cv-report-schema'
import { generateText, Output } from 'ai'
import { and, desc, eq, notInArray } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

export async function searchJobs(input: {
  query: string
  location?: string
  workMode?: string
}): Promise<{ ok: true } | { error: string }> {
  const userId = await getUserId()
  const query = input.query.trim()
  if (query.length < 2) return { error: 'Enter a role or keyword to search.' }

  // Use the latest CV report for match scoring context, if any.
  const [report] = await db
    .select({ cvText: cvReports.cvText })
    .from(cvReports)
    .where(eq(cvReports.userId, userId))
    .orderBy(desc(cvReports.createdAt))
    .limit(1)

  try {
    const { output } = await generateText({
      model: 'openai/gpt-5-mini',
      output: Output.object({ schema: jobSearchSchema }),
      system: `You are a job board aggregator that surfaces realistic openings comparable to those found on LinkedIn and Indeed. Generate realistic, varied, currently-plausible job postings that match the user's search. Use realistic but fictional company names. Salaries should be realistic for the role and location. ${
        report
          ? 'A candidate CV is provided: set each job\'s "matchScore" (0-100) based on how well this candidate fits that specific posting.'
          : 'No CV is provided: set every "matchScore" to 0.'
      }`,
      prompt: `Search query: "${query}"
${input.location ? `Preferred location: ${input.location}` : ''}
${input.workMode && input.workMode !== 'any' ? `Preferred work mode: ${input.workMode}` : ''}
${
  report
    ? `\nCANDIDATE CV:\n"""\n${report.cvText.slice(0, 8000)}\n"""`
    : ''
}

Generate a diverse set of matching job postings.`,
    })

    const generated = (output as { jobs: GeneratedJob[] }).jobs

    // Clear previous search results that the user has NOT applied to, so the
    // board refreshes without losing applied jobs.
    const applied = await db
      .select({ jobId: applications.jobId })
      .from(applications)
      .where(eq(applications.userId, userId))
    const appliedIds = applied.map((a) => a.jobId)

    if (appliedIds.length > 0) {
      await db
        .delete(jobs)
        .where(
          and(eq(jobs.userId, userId), notInArray(jobs.id, appliedIds)),
        )
    } else {
      await db.delete(jobs).where(eq(jobs.userId, userId))
    }

    if (generated.length > 0) {
      await db.insert(jobs).values(
        generated.map((j) => ({
          userId,
          title: j.title,
          company: j.company,
          location: j.location,
          workMode: j.workMode,
          employmentType: j.employmentType,
          salaryLow: j.salaryLow,
          salaryHigh: j.salaryHigh,
          currency: j.currency,
          summary: j.summary,
          requirements: j.requirements,
          niceToHaves: j.niceToHaves,
          matchScore: j.matchScore,
          searchQuery: query,
        })),
      )
    }

    revalidatePath('/dashboard/jobs')
    return { ok: true }
  } catch (err) {
    console.log('[v0] searchJobs error:', err instanceof Error ? err.message : err)
    return { error: 'Could not search jobs right now. Please try again.' }
  }
}

export async function getJobs() {
  const userId = await getUserId()
  const rows = await db
    .select()
    .from(jobs)
    .where(eq(jobs.userId, userId))
    .orderBy(desc(jobs.matchScore), desc(jobs.createdAt))

  const applied = await db
    .select({ jobId: applications.jobId })
    .from(applications)
    .where(eq(applications.userId, userId))
  const appliedIds = new Set(applied.map((a) => a.jobId))

  return rows.map((r) => ({ ...r, applied: appliedIds.has(r.id) }))
}

export async function applyToJob(
  jobId: number,
): Promise<{ ok: true } | { error: string }> {
  const userId = await getUserId()

  // Ensure the job belongs to the user.
  const [job] = await db
    .select({ id: jobs.id })
    .from(jobs)
    .where(and(eq(jobs.id, jobId), eq(jobs.userId, userId)))
    .limit(1)
  if (!job) return { error: 'Job not found.' }

  // Avoid duplicate applications.
  const [existing] = await db
    .select({ id: applications.id })
    .from(applications)
    .where(
      and(eq(applications.userId, userId), eq(applications.jobId, jobId)),
    )
    .limit(1)
  if (existing) return { ok: true }

  await db.insert(applications).values({ userId, jobId, status: 'applied' })
  revalidatePath('/dashboard/jobs')
  revalidatePath('/dashboard/applications')
  return { ok: true }
}

const STATUSES = [
  'applied',
  'interviewing',
  'offer',
  'rejected',
  'withdrawn',
] as const
export type ApplicationStatus = (typeof STATUSES)[number]

export async function getApplications() {
  const userId = await getUserId()
  const rows = await db
    .select({
      id: applications.id,
      status: applications.status,
      note: applications.note,
      createdAt: applications.createdAt,
      jobId: jobs.id,
      title: jobs.title,
      company: jobs.company,
      location: jobs.location,
      workMode: jobs.workMode,
      employmentType: jobs.employmentType,
      salaryLow: jobs.salaryLow,
      salaryHigh: jobs.salaryHigh,
      currency: jobs.currency,
      matchScore: jobs.matchScore,
      summary: jobs.summary,
      requirements: jobs.requirements,
      niceToHaves: jobs.niceToHaves,
    })
    .from(applications)
    .innerJoin(jobs, eq(applications.jobId, jobs.id))
    .where(eq(applications.userId, userId))
    .orderBy(desc(applications.createdAt))
  return rows
}

export type ApplicationWithJob = Awaited<
  ReturnType<typeof getApplications>
>[number]

export async function updateApplicationStatus(
  id: number,
  status: ApplicationStatus,
): Promise<{ ok: true } | { error: string }> {
  const userId = await getUserId()
  if (!STATUSES.includes(status)) return { error: 'Invalid status.' }
  await db
    .update(applications)
    .set({ status, updatedAt: new Date() })
    .where(and(eq(applications.id, id), eq(applications.userId, userId)))
  revalidatePath('/dashboard/applications')
  return { ok: true }
}

export async function withdrawApplication(id: number) {
  const userId = await getUserId()
  await db
    .delete(applications)
    .where(and(eq(applications.id, id), eq(applications.userId, userId)))
  revalidatePath('/dashboard/applications')
  revalidatePath('/dashboard/jobs')
}
