'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { BrandLockup } from '@/components/brand-logo'
import { ArrowLeft } from 'lucide-react'

export function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const urlError = searchParams.get('error')

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const invalidToken = !token || urlError === 'INVALID_TOKEN'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    const { error } = await authClient.resetPassword({
      newPassword: password,
      token: token as string,
    })
    setLoading(false)

    if (error) {
      setError(error.message ?? 'Could not reset password. Try again.')
      return
    }

    router.push('/sign-in')
    router.refresh()
  }

  return (
    <main className="flex min-h-svh items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm p-6">
        <Link
          href="/"
          className="mb-6 flex justify-center"
          aria-label="OfferLab home"
        >
          <BrandLockup size={220} priority className="w-44" />
        </Link>

        {invalidToken ? (
          <div className="text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Invalid or expired link
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              This password reset link is no longer valid. Request a new one to
              continue.
            </p>
            <Button asChild className="mt-6 w-full">
              <Link href="/forgot-password">Request a new link</Link>
            </Button>
            <Button asChild variant="ghost" className="mt-2 w-full">
              <Link href="/sign-in">
                <ArrowLeft className="size-4" />
                Back to sign in
              </Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Set a new password
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Choose a strong password you haven&apos;t used before.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="password">New password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="confirm">Confirm new password</Label>
                <Input
                  id="confirm"
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
              </div>

              {error && (
                <p className="text-sm text-destructive" role="alert">
                  {error}
                </p>
              )}

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Updating...' : 'Reset password'}
              </Button>
            </form>
          </>
        )}
      </Card>
    </main>
  )
}
