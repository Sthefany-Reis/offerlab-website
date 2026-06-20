'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateProfile } from '@/app/actions/profile'

export function ProfileForm({
  initialName,
  email,
}: {
  initialName: string
  email: string
}) {
  const router = useRouter()
  const [name, setName] = useState(initialName)
  const [isSaving, setIsSaving] = useState(false)

  const dirty = name.trim() !== initialName.trim()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!dirty) return
    setIsSaving(true)
    try {
      const res = await updateProfile({ name })
      if (res.ok) {
        toast.success('Profile updated.')
        router.refresh()
      } else {
        toast.error(res.error ?? 'Could not update profile.')
      }
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            autoComplete="name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" value={email} disabled readOnly />
          <p className="text-xs text-muted-foreground">
            Your email is used to sign in and can&apos;t be changed here.
          </p>
        </div>

        <Button type="submit" disabled={!dirty || isSaving}>
          {isSaving && <Loader2 className="size-4 animate-spin" />}
          Save changes
        </Button>
      </form>
    </Card>
  )
}
