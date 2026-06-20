'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { cvReports, jobs } from '@/lib/db/schema'
import { hasActiveSubscription } from '@/app/actions/subscription'
import {
  coverLetterRatingSchema,
  type CoverLetterRating,
} from '@/lib/cover-letter-schema'
import { generateText, Output } from 'ai'
import { and, desc, eq } from 'drizzle-orm'
import { headers } from 'next/headers'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

// Pulls the candidate's most recent analyzed CV text, used as grounding for
// both generating and rating cover letters.
async function getLatestCvText(userId: string): Promise<string | null> {
  const [row] = await db
    .select({ cvText: cvReports.cvText })
    .from(cvReports)
    .where(eq(cvReports.userId, userId))
    .orderBy(desc(cvReports.createdAt))
    .limit(1)
  return row?.cvText ?? null
}

// Resolves job context either from a saved job (by id, scoped to the user) or
// from free-text passed by the caller.
async function resolveJobContext(
  userId: string,
  input: {
    jobId?: number
    jobTitle?: string
    company?: string
    jobDescription?: string
  },
) {
  if (input.jobId) {
    const [job] = await db
      .select()
      .from(jobs)
      .where(and(eq(jobs.id, input.jobId), eq(jobs.userId, userId)))
      .limit(1)
    if (job) {
      const reqs = Array.isArray(job.requirements)
        ? (job.requirements as string[]).join(', ')
        : ''
      return {
        title: job.title,
        company: job.company,
        description: `${job.summary}${reqs ? `\n\nKey requirements: ${reqs}` : ''}`,
      }
    }
  }
  return {
    title: input.jobTitle?.trim() || 'the role',
    company: input.company?.trim() || 'the company',
    description: input.jobDescription?.trim() || '',
  }
}

export type GenerateCoverLetterInput = {
  jobId?: number
  jobTitle?: string
  company?: string
  jobDescription?: string
  tone?: 'professional' | 'enthusiastic' | 'concise'
}

// Generates a tailored cover letter. Premium-gated.
export async function generateCoverLetter(
  input: GenerateCoverLetterInput,
): Promise<{ letter: string } | { error: string; upgrade?: boolean }> {
  const userId = await getUserId()

  if (!(await hasActiveSubscription())) {
    return {
      error: 'Cover letters are a Pro feature. Upgrade to unlock them.',
      upgrade: true,
    }
  }

  const cvText = await getLatestCvText(userId)
  if (!cvText) {
    return {
      error:
        'Analyze your CV first so we can tailor the cover letter to your experience.',
    }
  }

  const job = await resolveJobContext(userId, input)
  const tone = input.tone ?? 'professional'

  try {
    const { text } = await generateText({
      model: 'openai/gpt-5-mini',
      system: `You are OfferLab, an expert career writer. Write a tailored, compelling cover letter grounded ONLY in the candidate's real CV. Never invent experience, employers, or metrics that aren't supported by the CV. Keep it to 3-4 short paragraphs, specific to the target role and company, and written in a ${tone} tone. Return ONLY the cover letter body text — no placeholders like [Your Name], no markdown, no preamble.`,
      prompt: `TARGET ROLE: ${job.title}
COMPANY: ${job.company}
${job.description ? `ROLE DETAILS:\n${job.description}\n` : ''}
CANDIDATE CV:
"""
${cvText.slice(0, 16000)}
"""

Write the cover letter now.`,
    })

    return { letter: text.trim() }
  } catch (err) {
    console.log(
      '[v0] generateCoverLetter error:',
      err instanceof Error ? err.message : err,
    )
    return {
      error: 'Could not generate a cover letter right now. Please try again.',
    }
  }
}

export type RateCoverLetterInput = {
  letter: string
  jobId?: number
  jobTitle?: string
  company?: string
  jobDescription?: string
}

// Rates a pasted cover letter and returns structured feedback. Premium-gated.
export async function rateCoverLetter(
  input: RateCoverLetterInput,
): Promise<
  { rating: CoverLetterRating } | { error: string; upgrade?: boolean }
> {
  const userId = await getUserId()

  if (!(await hasActiveSubscription())) {
    return {
      error: 'Cover letter rating is a Pro feature. Upgrade to unlock it.',
      upgrade: true,
    }
  }

  const letter = input.letter.trim()
  if (letter.length < 120) {
    return {
      error: 'Please paste a complete cover letter (at least a few sentences).',
    }
  }

  const job = await resolveJobContext(userId, input)
  const cvText = await getLatestCvText(userId)

  try {
    const { output } = await generateText({
      model: 'openai/gpt-5-mini',
      output: Output.object({ schema: coverLetterRatingSchema }),
      system: `You are OfferLab, an exacting hiring manager and career coach. Rate the candidate's cover letter honestly and constructively. Judge relevance to the target role, demonstrated impact, tone, clarity, and structure. Be specific and actionable. Do not inflate scores.`,
      prompt: `TARGET ROLE: ${job.title}
COMPANY: ${job.company}
${job.description ? `ROLE DETAILS:\n${job.description}\n` : ''}
${cvText ? `CANDIDATE CV (for grounding):\n"""\n${cvText.slice(0, 8000)}\n"""\n` : ''}
COVER LETTER TO RATE:
"""
${letter.slice(0, 8000)}
"""

Rate the cover letter now.`,
    })

    return { rating: output as CoverLetterRating }
  } catch (err) {
    console.log(
      '[v0] rateCoverLetter error:',
      err instanceof Error ? err.message : err,
    )
    return {
      error: 'Could not rate this cover letter right now. Please try again.',
    }
  }
}
