import { z } from 'zod'

// Structured rating for a cover letter, used by the rateCoverLetter action.
export const coverLetterRatingSchema = z.object({
  overallScore: z
    .number()
    .int()
    .min(0)
    .max(100)
    .describe('Overall quality of the cover letter, 0-100'),
  verdict: z
    .string()
    .describe('A one-sentence honest summary of how strong the letter is'),
  categories: z
    .array(
      z.object({
        name: z
          .string()
          .describe(
            'Category name, e.g. Relevance, Impact, Tone, Clarity, Structure',
          ),
        score: z.number().int().min(0).max(100),
        comment: z
          .string()
          .describe('Specific, actionable feedback for this category'),
      }),
    )
    .describe('Per-category breakdown of the letter quality'),
  strengths: z
    .array(z.string())
    .describe('Concrete things the letter does well'),
  improvements: z
    .array(z.string())
    .describe('Concrete, prioritized changes that would improve the letter'),
})

export type CoverLetterRating = z.infer<typeof coverLetterRatingSchema>
