import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect, notFound } from 'next/navigation'
import { getSpecialist } from '@/lib/specialists'
import { SpecialistChat } from '@/components/dashboard/specialist-chat'

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

  return <SpecialistChat specialist={specialist} />
}
