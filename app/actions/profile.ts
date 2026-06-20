'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { user } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function updateProfile(input: { name: string }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')

  const name = input.name.trim()
  if (!name) {
    return { ok: false as const, error: 'Name cannot be empty.' }
  }

  await db
    .update(user)
    .set({ name, updatedAt: new Date() })
    .where(eq(user.id, session.user.id))

  revalidatePath('/dashboard/profile')
  revalidatePath('/dashboard')
  return { ok: true as const }
}
