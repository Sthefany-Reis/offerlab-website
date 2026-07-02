'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { cvReports } from '@/lib/db/schema'
import {
  cvReportSchema,
  desiredRolePlanSchema,
  type CvReport,
  type DesiredRolePlan,
} from '@/lib/cv-report-schema'
import {
  getAnalysisUsage,
  hasActiveSubscription,
} from '@/app/actions/subscription'
import { researchWeb } from '@/lib/web-research'
import { generateText, Output } from 'ai'
import { and, desc, eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

const SYSTEM_PROMPT = `You are OfferLab, an elite career strategist. You are given the raw text of a candidate's CV and, optionally, the role they WANT to land next.

Produce a rigorous, honest, genuinely useful analysis:
- "qualifiedRoles": the roles the candidate can realistically get hired for RIGHT NOW based on their CV, scored by match and with realistic annual base salary ranges for their region (infer it; default to the United States in USD). For each role also include a short "description" of what the role does day-to-day and "companies" — real, well-known companies that commonly hire for that role.
- "skillGaps": concrete skills the candidate should improve, prioritized.
- "desiredRolePlan": compare where the CV best fits ("bestFitRole") with the role the candidate wants ("desiredRole"). If no desired role was given, infer the most ambitious realistic next role and use that. Set "isMismatch" true when the CV is currently better suited to a different role than the one they want. Give the exact certifications (real, named) and skills needed to qualify for the DESIRED role.
- "cvQuality": an honest review of how well the CV is written and structured. Set "needsRedesign" true when the CV is poorly organized, vague, or weak so it should be regenerated.

Be specific and grounded in what the CV actually says. Never invent experience.`

export async function analyzeCv(input: {
  cvText: string
  desiredRole?: string
}): Promise<{ id: number } | { error: string }> {
  const userId = await getUserId()

  const cvText = input.cvText.trim()
  if (cvText.length < 80) {
    return {
      error:
        'That CV looks too short to analyze. Please paste your full CV or upload a complete document.',
    }
  }

  // Enforce the monthly analysis limit for free users.
  const usage = await getAnalysisUsage()
  if (!usage.unlimited && usage.remaining <= 0) {
    return {
      error: `You've used all ${usage.limit} free CV analyses this month. Upgrade to Pro for unlimited analyses.`,
    }
  }

  const desiredRole = input.desiredRole?.trim()

  try {
    const { output } = await generateText({
      model: 'openai/gpt-5-mini',
      output: Output.object({ schema: cvReportSchema }),
      system: SYSTEM_PROMPT,
      prompt: `${
        desiredRole
          ? `The role the candidate WANTS to land next: "${desiredRole}".`
          : 'No specific desired role was provided — infer the most ambitious realistic next role from the CV.'
      }

CV / RESUME TEXT:
"""
${cvText.slice(0, 16000)}
"""

Analyze this candidate and return the structured result.`,
    })

    const result = output as CvReport

    const [row] = await db
      .insert(cvReports)
      .values({
        userId,
        cvText,
        desiredRole: desiredRole ?? null,
        result,
      })
      .returning({ id: cvReports.id })

    revalidatePath('/dashboard')
    return { id: row.id }
  } catch (err) {
    console.log('[v0] analyzeCv error:', err instanceof Error ? err.message : err)
    return {
      error:
        'We could not complete the analysis right now. Please try again in a moment.',
    }
  }
}

export async function getLatestReport() {
  const userId = await getUserId()
  const [row] = await db
    .select()
    .from(cvReports)
    .where(eq(cvReports.userId, userId))
    .orderBy(desc(cvReports.createdAt))
    .limit(1)
  return row ?? null
}

export async function getReports() {
  const userId = await getUserId()
  const rows = await db
    .select({
      id: cvReports.id,
      desiredRole: cvReports.desiredRole,
      result: cvReports.result,
      createdAt: cvReports.createdAt,
    })
    .from(cvReports)
    .where(eq(cvReports.userId, userId))
    .orderBy(desc(cvReports.createdAt))
  return rows.map((r) => {
    const result = r.result as CvReport
    return {
      id: r.id,
      desiredRole: r.desiredRole,
      createdAt: r.createdAt,
      detectedRole: result.detectedRole,
      seniority: result.seniority,
      candidateName: result.candidateName,
    }
  })
}

export async function getReport(id: number) {
  const userId = await getUserId()
  const [row] = await db
    .select()
    .from(cvReports)
    .where(and(eq(cvReports.id, id), eq(cvReports.userId, userId)))
    .limit(1)
  return row ?? null
}

export async function deleteReport(id: number) {
  const userId = await getUserId()
  await db
    .delete(cvReports)
    .where(and(eq(cvReports.id, id), eq(cvReports.userId, userId)))
  revalidatePath('/dashboard')
}

// Regenerate a clean, well-structured CV from the candidate's existing
// information. Returns Markdown text.
export async function regenerateCv(
  reportId: number,
): Promise<{ cv: string } | { error: string }> {
  const userId = await getUserId()

  // CV regeneration is a Pro-only feature.
  if (!(await hasActiveSubscription())) {
    return {
      error: 'Regenerating your CV is a Pro feature. Upgrade to unlock it.',
    }
  }

  const [row] = await db
    .select()
    .from(cvReports)
    .where(and(eq(cvReports.id, reportId), eq(cvReports.userId, userId)))
    .limit(1)

  if (!row) return { error: 'Report not found.' }

  const report = row.result as CvReport
  const targetRole =
    report.desiredRolePlan?.desiredRole ?? report.detectedRole

  try {
    // Research what employers are currently looking for in this role so the
    // rewrite is optimized against the real market, not just tidied up.
    const research = await researchWeb(
      `What are hiring managers and recruiters looking for in ${targetRole} candidates in ${new Date().getFullYear()}?
Cover: the most in-demand hard and soft skills, tools and technologies, keywords that pass ATS screening for this role, how top resumes are structured, and the achievements/metrics that stand out. Base this on current job postings and recruiter guidance.`,
    )

    const { text } = await generateText({
      model: 'openai/gpt-5-mini',
      system: `You are an expert CV writer and recruiter. Rewrite the candidate's CV into a clean, well-structured, ATS-friendly resume in Markdown that is optimized for what employers are looking for RIGHT NOW.

Rules:
- Use only information present in the original CV. Do not invent jobs, dates, or metrics.
- Use the MARKET RESEARCH to decide what to emphasize, how to phrase achievements, and which real keywords/skills (that the candidate genuinely has) to surface for ATS. Never claim skills the candidate doesn't have.
- Use clear sections: a header with name and contact (use placeholders like [email] only if missing), a punchy professional summary tuned to the target role, Experience (with concise achievement bullets that start with strong verbs), Skills, and Education.
- Tighten weak or vague language; quantify achievements only where the original implies numbers.
- Keep it concise and scannable. Return ONLY the Markdown, no commentary.`,
      prompt: `Candidate target/best-fit role: ${targetRole}

WHAT EMPLOYERS CURRENTLY WANT FOR THIS ROLE (market research):
"""
${research.text}
"""

ORIGINAL CV TEXT:
"""
${row.cvText.slice(0, 16000)}
"""

Rewrite it as a polished, market-optimized Markdown CV.`,
    })

    return { cv: text }
  } catch (err) {
    console.log(
      '[v0] regenerateCv error:',
      err instanceof Error ? err.message : err,
    )
    return { error: 'Could not regenerate the CV right now. Please try again.' }
  }
}

// Recompute the path-to-dream-role plan for a new target role chosen by the
// candidate (either a recommended role or a custom one), and persist it.
export async function updateDesiredRole(
  reportId: number,
  desiredRole: string,
): Promise<{ plan: DesiredRolePlan } | { error: string }> {
  const userId = await getUserId()
  const role = desiredRole.trim()
  if (!role) return { error: 'Please choose or enter a role.' }

  const [row] = await db
    .select()
    .from(cvReports)
    .where(and(eq(cvReports.id, reportId), eq(cvReports.userId, userId)))
    .limit(1)
  if (!row) return { error: 'Report not found.' }

  const report = row.result as CvReport

  try {
    const { output } = await generateText({
      model: 'openai/gpt-5-mini',
      output: Output.object({ schema: desiredRolePlanSchema }),
      system: `You are OfferLab, an elite career strategist. Given a candidate's CV and the role they WANT to land next, produce ONLY the "desiredRolePlan": compare where the CV best fits ("bestFitRole") with the desired role, set "isMismatch" true when the CV is currently better suited to a different role, estimate "currentFit" (0-100), and give the exact real, named certifications and concrete skills needed to qualify for the DESIRED role. Be specific and grounded in what the CV actually says. Never invent experience.`,
      prompt: `The role the candidate WANTS to land next: "${role}".

CV / RESUME TEXT:
"""
${row.cvText.slice(0, 16000)}
"""

Return the structured plan to reach this desired role.`,
    })

    const plan = output as DesiredRolePlan
    const updated: CvReport = { ...report, desiredRolePlan: plan }

    await db
      .update(cvReports)
      .set({ result: updated, desiredRole: role })
      .where(and(eq(cvReports.id, reportId), eq(cvReports.userId, userId)))

    revalidatePath('/dashboard')
    return { plan }
  } catch (err) {
    console.log(
      '[v0] updateDesiredRole error:',
      err instanceof Error ? err.message : err,
    )
    return {
      error: 'Could not update your dream-role plan right now. Please try again.',
    }
  }
}
