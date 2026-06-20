import { streamText, convertToModelMessages, type UIMessage } from 'ai'
import { getSpecialist } from '@/lib/specialists'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { getWeeklyUsage, recordUsage } from '@/app/actions/subscription'

export const maxDuration = 30

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    return new Response('Unauthorized', { status: 401 })
  }

  // Enforce the weekly specialist-question limit for free users.
  const usage = await getWeeklyUsage('specialist')
  if (!usage.unlimited && usage.remaining <= 0) {
    return Response.json(
      {
        error: `You've used all ${usage.limit} free specialist questions this week. Upgrade to Pro for unlimited access.`,
      },
      { status: 429 },
    )
  }

  const {
    messages,
    specialistId,
  }: { messages: UIMessage[]; specialistId: string } = await req.json()

  const specialist = getSpecialist(specialistId)
  if (!specialist) {
    return new Response('Specialist not found', { status: 404 })
  }

  // Count this question against the weekly allowance.
  await recordUsage('specialist')

  const result = streamText({
    model: 'openai/gpt-5-mini',
    system: `${specialist.persona}

You are chatting inside OfferLab, a career platform. Keep replies focused, friendly, and concise (a few short paragraphs max). Use concrete examples and end with a clear next step or question when helpful. Stay in character as ${specialist.name} and only give career-related guidance.`,
    messages: await convertToModelMessages(messages),
  })

  return result.toUIMessageStreamResponse()
}
