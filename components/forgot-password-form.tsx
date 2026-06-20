'use client'

import { useState } from 'react'
import Link from 'next/link'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { BrandLockup } from '@/components/brand-logo'
import { ArrowLeft, MailCheck } from 'lucide-react'

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = await authClient.requestPasswordReset({
      email,
      redirectTo: '/reset-password',
    })

    setLoading(false)

    if (error) {
      setError(error.message ?? 'Something went wrong. Please try again.')
      return
    }
    setSent(true)
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

        {sent ? (
          <div className="text-center">
            <div className="mx-auto grid size-12 place-items-center rounded-full bg-success/15">
              <MailCheck className="size-6 text-success" />
            </div>
            <h1 className="mt-4 text-2xl font-semibold tracking-tight text-foreground">
              Check your email
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              If an account exists for{' '}
              <span className="font-medium text-foreground">{email}</span>,
              we&apos;ve sent a link to reset your password.
            </p>
            <Button asChild variant="outline" className="mt-6 w-full">
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
                Forgot your password?
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Enter your email and we&apos;ll send you a reset link.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              {error && (
                <p className="text-sm text-destructive" role="alert">
                  {error}
                </p>
              )}

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Sending...' : 'Send reset link'}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Remember your password?{' '}
              <Link
                href="/sign-in"
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                Sign in
              </Link>
            </p>
          </>
        )}
      </Card>
    </main>
  )
}
