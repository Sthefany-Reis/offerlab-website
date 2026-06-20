'use server'

import { generateObject } from 'ai'
import { z } from 'zod'

const questionSchema = z.object({
  question: z.string().describe('A realistic interview question'),
  category: z
    .enum(['behavioral', 'technical', 'situational', 'role-specific'])
    .describe('The type of question'),
  focus: z
    .string()
    .describe('One short phrase on what the interviewer is really assessing'),
})

const answerSchema = z.object({
  howToAnswer: z
    .string()
    .describe(
      'Clear guidance on how to approach THIS KIND of interview question: what the interviewer is looking for, the structure or framework to use, and what to include and avoid. 3-5 sentences, written as coaching advice.',
    ),
  modelAnswer: z
    .string()
    .describe(
      'The strongest, most successful answer for this role, written in first person as the candidate would say it. 4-8 sentences.',
    ),
  structure: z
    .string()
    .describe(
      'The framework this answer uses (e.g. STAR) and why it works, one or two sentences.',
    ),
  feedback: z
    .string()
    .describe(
      "Specific, constructive feedback on the user's own answer: what was strong and what to improve. If no answer was given, coach them on how to approach it.",
    ),
  score: z
    .number()
    .min(0)
    .max(100)
    .describe(
      "A 0-100 rating of the user's submitted answer. If no answer was given, return 0.",
    ),
  tips: z
    .array(z.string())
    .min(2)
    .max(4)
    .describe('Short, actionable tips to deliver this answer well'),
})

export type InterviewQuestion = z.infer<typeof questionSchema>
export type InterviewAnswer = z.infer<typeof answerSchema>

export async function generateQuestion(
  role: string,
  asked: string[],
): Promise<{ question: InterviewQuestion } | { error: string }> {
  if (!role.trim()) return { error: 'Choose a target role first.' }
  try {
    const { object } = await generateObject({
      model: 'openai/gpt-5-mini',
      schema: questionSchema,
      prompt: `You are an expert interviewer for a "${role}" position.
Generate ONE realistic interview question that a strong candidate for this role should be ready to answer.
Vary the category across behavioral, technical, situational, and role-specific.
Do NOT repeat any of these already-asked questions:
${asked.length ? asked.map((q) => `- ${q}`).join('\n') : '(none yet)'}`,
    })
    return { question: object }
  } catch (err) {
    console.log('[v0] generateQuestion error:', err)
    return { error: 'Could not generate a question. Please try again.' }
  }
}

export async function evaluateAnswer(
  role: string,
  question: string,
  userAnswer: string,
): Promise<{ answer: InterviewAnswer } | { error: string }> {
  try {
    const { object } = await generateObject({
      model: 'openai/gpt-5-mini',
      schema: answerSchema,
      prompt: `You are an elite interview coach for a "${role}" position.

Interview question: "${question}"

The candidate's answer was:
"""
${userAnswer.trim() || '(The candidate did not provide an answer.)'}
"""

Provide:
1. howToAnswer: how to approach THIS KIND of question — what's being assessed, the framework to use, what to include and avoid.
2. modelAnswer: the strongest possible answer for this role, in first person.
3. structure: the framework it uses and why it works.
4. feedback: specific feedback on the candidate's own answer (or coaching if none was given).
5. score: 0-100 rating of the candidate's answer (0 if none given).
6. tips: 2-4 short delivery tips.`,
    })
    return { answer: object }
  } catch (err) {
    console.log('[v0] evaluateAnswer error:', err)
    return { error: 'Could not evaluate your answer. Please try again.' }
  }
}
