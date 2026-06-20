import { z } from 'zod'

// The structured result produced by the AI for a single CV analysis.
// This schema is shared by the AI generation call and the app's UI types.

export const skillGapSchema = z.object({
  skill: z.string().describe('The name of the missing or weak skill'),
  importance: z
    .enum(['critical', 'important', 'nice-to-have'])
    .describe('How important this skill is for the target role'),
  reason: z
    .string()
    .describe('One short sentence on why this skill matters for the role'),
})

export const roadmapStepSchema = z.object({
  title: z.string().describe('Short title of the learning milestone'),
  durationWeeks: z
    .number()
    .int()
    .min(1)
    .max(52)
    .describe('Estimated weeks to complete this step'),
  focus: z
    .string()
    .describe('What the learner should focus on during this step'),
  resources: z
    .array(z.string())
    .min(1)
    .max(4)
    .describe('Concrete resource types or example courses/books/projects'),
  skillsAddressed: z
    .array(z.string())
    .describe('Which gap skills this step closes'),
})

export const applicationSchema = z.object({
  roleTitle: z.string().describe('A realistic target job title'),
  companyType: z
    .string()
    .describe('Type of company that suits this candidate, e.g. "Series B SaaS"'),
  matchScore: z
    .number()
    .int()
    .min(0)
    .max(100)
    .describe('How well the candidate currently matches this role, 0-100'),
  tailoredSummary: z
    .string()
    .describe('A 2-3 sentence tailored professional summary for this role'),
  coverLetter: z
    .string()
    .describe('A concise, tailored cover letter (about 150-200 words)'),
})

export const interviewQuestionSchema = z.object({
  question: z.string(),
  category: z.enum(['behavioral', 'technical', 'role-specific']),
  whatTheyWant: z
    .string()
    .describe('What the interviewer is really assessing'),
  sampleAnswer: z
    .string()
    .describe('A strong example answer tailored to this candidate'),
})

export const analysisResultSchema = z.object({
  detectedRole: z
    .string()
    .describe('The role the CV currently best fits, inferred from experience'),
  seniority: z
    .enum(['entry', 'junior', 'mid', 'senior', 'lead', 'executive'])
    .describe('Estimated seniority level'),
  summary: z
    .string()
    .describe('A 2-3 sentence honest assessment of the candidate'),
  strengths: z
    .array(z.string())
    .min(3)
    .max(6)
    .describe('Key strengths evident from the CV'),
  marketValue: z.object({
    currency: z.string().describe('ISO-ish currency symbol or code, e.g. USD'),
    low: z.number().int().describe('Lower bound annual salary estimate'),
    median: z.number().int().describe('Median annual salary estimate'),
    high: z.number().int().describe('Upper bound annual salary estimate'),
    region: z
      .string()
      .describe('Region the estimate applies to, e.g. "United States"'),
    rationale: z
      .string()
      .describe('Short explanation of what drives this estimate'),
    potentialMedian: z
      .number()
      .int()
      .describe('Median salary achievable after closing the skill gaps'),
  }),
  skillGaps: z.array(skillGapSchema).min(3).max(8),
  roadmap: z.array(roadmapStepSchema).min(3).max(6),
  applications: z.array(applicationSchema).min(2).max(3),
  interviewQuestions: z.array(interviewQuestionSchema).min(4).max(6),
})

export type AnalysisResult = z.infer<typeof analysisResultSchema>
export type SkillGap = z.infer<typeof skillGapSchema>
export type RoadmapStep = z.infer<typeof roadmapStepSchema>
export type TailoredApplication = z.infer<typeof applicationSchema>
export type InterviewQuestion = z.infer<typeof interviewQuestionSchema>
