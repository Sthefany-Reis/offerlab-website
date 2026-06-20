import {
  pgTable,
  text,
  timestamp,
  boolean,
  serial,
  jsonb,
  integer,
} from 'drizzle-orm/pg-core'

// --- Better Auth required tables -------------------------------------------
// Column names are camelCase to match Better Auth's defaults. Do not rename.

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expiresAt').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

// --- App tables ------------------------------------------------------------

// Stores a full CV analysis: the input CV text + optional desired role, plus
// the AI-generated result (detected role, qualified jobs, skill gaps,
// desired-role gap plan, CV quality assessment) as a JSON blob.
export const cvReports = pgTable('cv_reports', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull(),
  cvText: text('cvText').notNull(),
  desiredRole: text('desiredRole'),
  result: jsonb('result').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

// AI-generated job listings, scoped per user and tied to a search query.
export const jobs = pgTable('jobs', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull(),
  title: text('title').notNull(),
  company: text('company').notNull(),
  location: text('location').notNull(),
  workMode: text('workMode').notNull(),
  employmentType: text('employmentType').notNull(),
  salaryLow: integer('salaryLow'),
  salaryHigh: integer('salaryHigh'),
  currency: text('currency').notNull().default('USD'),
  summary: text('summary').notNull(),
  requirements: jsonb('requirements').notNull(),
  niceToHaves: jsonb('niceToHaves').notNull(),
  matchScore: integer('matchScore').notNull().default(0),
  searchQuery: text('searchQuery'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

// Tracks a user's application to a job, with a status pipeline. Stores the CV
// the user submitted with the application and an optional cover letter.
export const applications = pgTable('applications', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull(),
  jobId: integer('jobId').notNull(),
  status: text('status').notNull().default('applied'),
  note: text('note'),
  cvText: text('cvText'),
  coverLetter: text('coverLetter'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

// Tracks a user's subscription plan and status. One row per user.
export const subscriptions = pgTable('subscriptions', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull().unique(),
  plan: text('plan').notNull().default('free'),
  status: text('status').notNull().default('inactive'),
  currentPeriodEnd: timestamp('currentPeriodEnd'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

// Records one row each time a user consumes a metered action (e.g. generating
// an interview question or asking a specialist). Counted per week to enforce
// free-plan limits.
export const usageEvents = pgTable('usage_events', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull(),
  kind: text('kind').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export type CvReportRow = typeof cvReports.$inferSelect
export type JobRow = typeof jobs.$inferSelect
export type ApplicationRow = typeof applications.$inferSelect
export type SubscriptionRow = typeof subscriptions.$inferSelect
export type UsageEventRow = typeof usageEvents.$inferSelect

// --- Reference (unused) ----------------------------------------------------
// Add your app tables below. Always include a plain `userId` column so queries
// can be scoped per user — the security model depends on this column existing,
// not on a foreign key. Do NOT add a foreign key constraint
// (`.references(() => user.id, ...)`) unless the user explicitly asks for
// foreign keys or referential integrity; FK constraints make iterating on the
// schema harder.
//
// Example:
//
// import { serial } from "drizzle-orm/pg-core"
//
// export const todos = pgTable("todos", {
//   id: serial("id").primaryKey(),
//   userId: text("userId").notNull(),
//   title: text("title").notNull(),
//   completed: boolean("completed").notNull().default(false),
//   createdAt: timestamp("createdAt").notNull().defaultNow(),
// })
//
// If the user asks for foreign keys, add the reference back in:
//   userId: text("userId")
//     .notNull()
//     .references(() => user.id, { onDelete: "cascade" }),
