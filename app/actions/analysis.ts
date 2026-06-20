'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { analyses } from '@/lib/db/schema'
import { analysisResultSchema, type AnalysisResult } from '@/lib/analysis-schema'
import { generateText, Output } from 'ai'
import { and, desc, eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

const SYSTEM_PROMPT = `You are OfferLab, an elite career strategist that combines an AI job hunter, interview coach, CV optimizer, skill-gap analyzer and learning coach.

You are given the raw text of a candidate's CV/resume and optionally a target role they are aiming for. Produce a rigorous, honest, and genuinely useful career analysis.

Guidelines:
- Be specific and grounded in what the CV actually says. Do not invent experience.
- Market-value estimates should be realistic annual base salaries for the candidate's region (infer from the CV; default to the United States in USD if unclear). "potentialMedian" should reflect the higher salary they could command after closing the identified skill gaps.
- Skill gaps must be concrete and prioritized for the target role (or the detected role if none is given).
- The learning roadmap must be sequential, realistic, and explicitly tied to the skill gaps.
- Tailored applications must read like a real human wrote them; cover letters should be concise and confident, never generic filler.
- Interview questions should be the ones this specific candidate is most likely to face, with sharp guidance.`

export async function analyzeCv(input: {
  cvText: string
  targetRole?: string
}): Promise<{ id: number } | { error: string }> {
  const userId = await getUserId()

  const cvText = input.cvText.trim()
  if (cvText.length < 80) {
    return {
      error:
        'That CV looks too short to analyze. Please paste your full CV or upload a complete document.',
    }
  }

  const targetRole = input.targetRole?.trim()

  try {
    const { output } = await generateText({
      model: 'openai/gpt-5.4-mini',
      output: Output.object({ schema: analysisResultSchema }),
      system: SYSTEM_PROMPT,
      prompt: `${
        targetRole
          ? `Target role the candidate is aiming for: "${targetRole}".`
          : 'No specific target role was provided — infer the most ambitious realistic next role from the CV.'
      }

CV / RESUME TEXT:
"""
${cvText.slice(0, 16000)}
"""

Analyze this candidate and return the structured result.`,
    })

    const result = output as AnalysisResult

    const title = targetRole
      ? `${result.detectedRole} → ${targetRole}`
      : result.detectedRole

    const [row] = await db
      .insert(analyses)
      .values({
        userId,
        title,
        targetRole: targetRole ?? null,
        cvText,
        result,
      })
      .returning({ id: analyses.id })

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

export async function getAnalyses() {
  const userId = await getUserId()
  return db
    .select({
      id: analyses.id,
      title: analyses.title,
      targetRole: analyses.targetRole,
      createdAt: analyses.createdAt,
      result: analyses.result,
    })
    .from(analyses)
    .where(eq(analyses.userId, userId))
    .orderBy(desc(analyses.createdAt))
}

export async function getAnalysis(id: number) {
  const userId = await getUserId()
  const [row] = await db
    .select()
    .from(analyses)
    .where(and(eq(analyses.id, id), eq(analyses.userId, userId)))
    .limit(1)
  return row ?? null
}

export async function deleteAnalysis(id: number) {
  const userId = await getUserId()
  await db
    .delete(analyses)
    .where(and(eq(analyses.id, id), eq(analyses.userId, userId)))
  revalidatePath('/dashboard')
}
