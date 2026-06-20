import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect, notFound } from 'next/navigation'
import { getSpecialist } from '@/lib/specialists'
import { SpecialistChat } from '@/components/dashboard/specialist-chat'
import { getWeeklyUsage } from '@/app/actions/subscription'

export default async function SpecialistChatPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in')

  const { id } = await params
  const specialist = getSpecialist(id)
  if (!specialist) notFound()

  const usage = await getWeeklyUsage('specialist')

  return <SpecialistChat specialist={specialist} usage={usage} />
}
