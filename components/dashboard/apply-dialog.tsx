'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { applyToJob } from '@/app/actions/jobs'
import { generateCoverLetter } from '@/app/actions/cover-letter'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Loader2, Sparkles, Lock, Send } from 'lucide-react'

export function ApplyDialog({
  jobId,
  jobTitle,
  company,
  initialCv,
  isPro,
  onApplied,
}: {
  jobId: number
  jobTitle: string
  company: string
  initialCv: string
  isPro: boolean
  onApplied: () => void
}) {
  const [open, setOpen] = useState(false)
  const [cvText, setCvText] = useState(initialCv)
  const [coverLetter, setCoverLetter] = useState('')
  const [generating, setGenerating] = useState(false)
  const [applying, startApplying] = useTransition()

  async function handleGenerate() {
    setGenerating(true)
    const res = await generateCoverLetter({ jobId, jobTitle, company })
    setGenerating(false)
    if ('error' in res) {
      toast.error(res.error)
      return
    }
    setCoverLetter(res.letter)
    toast.success('Cover letter generated.')
  }

  function handleApply() {
    if (cvText.trim().length < 50) {
      toast.error('Please add the CV you want to apply with.')
      return
    }
    startApplying(async () => {
      const res = await applyToJob({ jobId, cvText, coverLetter })
      if ('error' in res) {
        toast.error(res.error)
        return
      }
      toast.success('Application tracked.')
      setOpen(false)
      onApplied()
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button>Apply</Button>} />
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Apply to {jobTitle}</DialogTitle>
          <DialogDescription>
            {company} · Submit the CV you want to apply with and an optional
            cover letter.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* CV */}
          <div>
            <Label htmlFor="apply-cv">Your CV</Label>
            <Textarea
              id="apply-cv"
              value={cvText}
              onChange={(e) => setCvText(e.target.value)}
              placeholder="Paste the CV you want to apply with…"
              className="mt-2 min-h-44"
            />
          </div>

          {/* Cover letter (optional) */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Label htmlFor="apply-cover">
                Cover letter{' '}
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
              </Label>
              {isPro ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGenerate}
                  disabled={generating}
                >
                  {generating ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" />
                      Generating…
                    </>
                  ) : (
                    <>
                      <Sparkles className="size-3.5" />
                      Generate with AI
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  asChild
                >
                  <Link href="/dashboard/billing">
                    <Lock className="size-3.5" />
                    Generate with AI (Pro)
                  </Link>
                </Button>
              )}
            </div>
            <Textarea
              id="apply-cover"
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder={
                isPro
                  ? 'Write or generate a cover letter tailored to this role…'
                  : 'Write a cover letter, or upgrade to Pro to generate one with AI…'
              }
              className="mt-2 min-h-40"
            />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleApply} disabled={applying}>
            {applying ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
            Submit application
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
