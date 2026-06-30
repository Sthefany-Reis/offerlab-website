'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { jobs, applications, cvReports } from '@/lib/db/schema'
import { jobSearchSchema, type GeneratedJob } from '@/lib/cv-report-schema'
import { researchWeb } from '@/lib/web-research'
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

  const locationText = input.location?.trim()
  const workMode =
    input.workMode && input.workMode !== 'any' ? input.workMode : undefined

  try {
    // 1) Live web search for REAL, currently-open positions, with citations.
    const research = await researchWeb(
      `Find currently open, real job postings for "${query}"${
        locationText ? ` in ${locationText}` : ''
      }${workMode ? ` (${workMode} roles)` : ''}.
Search job boards and company career pages (LinkedIn, Indeed, Greenhouse, Lever, Ashby, company sites).
For each opening, report: exact job title, the real hiring company, location, work mode, employment type, salary range if listed, a short summary, key requirements, and how recently it was posted.
Only include real, verifiable openings that appear to be active right now. Prefer the most recently posted roles. Provide the direct application URLs.`,
    )

    if (research.sources.length === 0) {
      return {
        error:
          'No live job postings found for that search right now. Try a broader role or location.',
      }
    }

    const sourceList = research.sources
      .map((s, i) => `${i + 1}. ${s.title} — ${s.url}`)
      .join('\n')

    // 2) Structure the real findings into typed listings, scored vs. the CV.
    const { output } = await generateText({
      model: 'openai/gpt-5-mini',
      output: Output.object({ schema: jobSearchSchema }),
      system: `You convert real, web-sourced job listings into structured data. Use ONLY the openings described in the research below — never invent companies or roles. Each job's "applyUrl" MUST be copied verbatim from the provided source URLs (pick the most specific posting link). If a salary is not stated, set salaryLow and salaryHigh to 0. ${
        report
          ? 'A candidate CV is provided: set each job\'s "matchScore" (0-100) based on how well this candidate fits that specific posting.'
          : 'No CV is provided: set every "matchScore" to 0.'
      }`,
      prompt: `Search query: "${query}"
${locationText ? `Preferred location: ${locationText}` : ''}
${workMode ? `Preferred work mode: ${workMode}` : ''}

WEB RESEARCH (real, current openings):
"""
${research.text}
"""

SOURCE URLS (use these exact links for applyUrl):
${sourceList}
${
  report
    ? `\nCANDIDATE CV:\n"""\n${report.cvText.slice(0, 8000)}\n"""`
    : ''
}

Return the real postings as structured jobs.`,
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
          applyUrl: j.applyUrl || null,
          source: j.source || null,
          postedText: j.postedText || null,
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

export async function applyToJob(input: {
  jobId: number
  cvText: string
  coverLetter?: string
}): Promise<{ ok: true } | { error: string }> {
  const userId = await getUserId()
  const { jobId } = input
  const cvText = input.cvText.trim()
  const coverLetter = input.coverLetter?.trim() || null

  if (cvText.length < 50) {
    return { error: 'Please add the CV you want to apply with.' }
  }

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

  await db
    .insert(applications)
    .values({ userId, jobId, status: 'applied', cvText, coverLetter })
  revalidatePath('/dashboard/jobs')
  revalidatePath('/dashboard/applications')
  return { ok: true }
}

// Returns the user's most recent analyzed CV text to prefill applications.
export async function getLatestCvText(): Promise<string> {
  const userId = await getUserId()
  const [report] = await db
    .select({ cvText: cvReports.cvText })
    .from(cvReports)
    .where(eq(cvReports.userId, userId))
    .orderBy(desc(cvReports.createdAt))
    .limit(1)
  return report?.cvText ?? ''
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
      cvText: applications.cvText,
      coverLetter: applications.coverLetter,
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
