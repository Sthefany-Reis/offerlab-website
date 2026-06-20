import { z } from 'zod'

// The structured result produced by the AI for a single CV analysis in the
// new OfferLab concept: what roles you qualify for now, the skills you need to
// improve, a plan to reach the role you actually want, and an honest review of
// how well your CV is written.

export const qualifiedRoleSchema = z.object({
  title: z.string().describe('A realistic job title the candidate qualifies for now'),
  matchScore: z
    .number()
    .int()
    .min(0)
    .max(100)
    .describe('How well the CV currently matches this role, 0-100'),
  why: z
    .string()
    .describe('One sentence on why the candidate is a good fit for this role'),
  salaryLow: z.number().int().describe('Lower bound annual base salary'),
  salaryHigh: z.number().int().describe('Upper bound annual base salary'),
  currency: z.string().describe('Currency code, e.g. USD'),
})

export const skillGapSchema = z.object({
  skill: z.string().describe('The name of the missing or weak skill'),
  importance: z
    .enum(['critical', 'important', 'nice-to-have'])
    .describe('How important this skill is for the candidate'),
  reason: z.string().describe('One short sentence on why this skill matters'),
})

export const certificationSchema = z.object({
  name: z.string().describe('Name of a concrete, real certification'),
  provider: z.string().describe('Who issues it, e.g. AWS, Google, PMI'),
  why: z
    .string()
    .describe('One sentence on how it helps reach the desired role'),
})

// The plan to reach the role the candidate WANTS (which may differ from the
// role their CV currently fits best).
export const desiredRolePlanSchema = z.object({
  desiredRole: z
    .string()
    .describe('The role the candidate is aiming for (echoed back)'),
  bestFitRole: z
    .string()
    .describe(
      "The role the CV actually fits best right now, which may differ from the desired role",
    ),
  isMismatch: z
    .boolean()
    .describe(
      'True if the CV is currently better suited to a different role than the one the candidate wants',
    ),
  currentFit: z
    .number()
    .int()
    .min(0)
    .max(100)
    .describe('How close the candidate is to qualifying for the desired role'),
  summary: z
    .string()
    .describe(
      'A 2-3 sentence honest explanation of the gap between current profile and desired role',
    ),
  certifications: z.array(certificationSchema).min(1).max(4),
  skillsToLearn: z
    .array(z.string())
    .min(2)
    .max(8)
    .describe('Concrete skills to acquire to qualify for the desired role'),
})

export const cvQualitySchema = z.object({
  score: z
    .number()
    .int()
    .min(0)
    .max(100)
    .describe('Overall quality/design score of the CV, 0-100'),
  needsRedesign: z
    .boolean()
    .describe('True if the CV is poorly structured and should be regenerated'),
  strengths: z
    .array(z.string())
    .min(1)
    .max(4)
    .describe('What the CV does well'),
  issues: z
    .array(z.string())
    .min(1)
    .max(6)
    .describe('Concrete problems with the CV structure, clarity, or content'),
})

export const cvReportSchema = z.object({
  candidateName: z
    .string()
    .describe('The candidate name if present in the CV, otherwise "Candidate"'),
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
  qualifiedRoles: z.array(qualifiedRoleSchema).min(3).max(6),
  skillGaps: z.array(skillGapSchema).min(3).max(8),
  desiredRolePlan: desiredRolePlanSchema,
  cvQuality: cvQualitySchema,
})

export type CvReport = z.infer<typeof cvReportSchema>
export type QualifiedRole = z.infer<typeof qualifiedRoleSchema>
export type SkillGap = z.infer<typeof skillGapSchema>
export type Certification = z.infer<typeof certificationSchema>
export type DesiredRolePlan = z.infer<typeof desiredRolePlanSchema>
export type CvQuality = z.infer<typeof cvQualitySchema>

// --- Job search ------------------------------------------------------------

export const generatedJobSchema = z.object({
  title: z.string(),
  company: z.string().describe('A realistic but fictional company name'),
  location: z.string().describe('City, Country or "Remote"'),
  workMode: z.enum(['remote', 'hybrid', 'onsite']),
  employmentType: z.enum(['full-time', 'part-time', 'contract', 'internship']),
  salaryLow: z.number().int(),
  salaryHigh: z.number().int(),
  currency: z.string().describe('Currency code, e.g. USD'),
  summary: z
    .string()
    .describe('A 2-3 sentence description of the role and team'),
  requirements: z
    .array(z.string())
    .min(3)
    .max(7)
    .describe('Must-have requirements'),
  niceToHaves: z
    .array(z.string())
    .min(1)
    .max(5)
    .describe('Nice-to-have skills'),
  matchScore: z
    .number()
    .int()
    .min(0)
    .max(100)
    .describe(
      'If a CV was provided, how well the candidate matches; otherwise 0',
    ),
})

export const jobSearchSchema = z.object({
  jobs: z.array(generatedJobSchema).min(4).max(8),
})

export type GeneratedJob = z.infer<typeof generatedJobSchema>

// --- Interview practice ----------------------------------------------------

export const interviewFeedbackSchema = z.object({
  score: z
    .number()
    .int()
    .min(0)
    .max(100)
    .describe('How strong the candidate answer is, 0-100'),
  strengths: z.array(z.string()).min(1).max(3),
  improvements: z.array(z.string()).min(1).max(3),
  modelAnswer: z
    .string()
    .describe(
      'The most qualified, successful answer for this question and career',
    ),
})

export type InterviewFeedback = z.infer<typeof interviewFeedbackSchema>
