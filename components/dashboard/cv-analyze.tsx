'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { analyzeCv } from '@/app/actions/cv-report'
import type { AnalysisUsage } from '@/app/actions/subscription'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FileUp, Loader2, Sparkles, FileText, Lock, Zap } from 'lucide-react'

const ACCEPTED = '.pdf,.docx,.doc,.txt,.png,.jpg,.jpeg'

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      resolve(result.split(',')[1] ?? '')
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function CvAnalyze({ usage }: { usage: AnalysisUsage }) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const limitReached = !usage.unlimited && usage.remaining <= 0

  const [cvText, setCvText] = useState('')
  const [desiredRole, setDesiredRole] = useState('')
  const [fileName, setFileName] = useState<string | null>(null)
  const [extracting, setExtracting] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)

  async function handleFile(file: File) {
    setFileName(file.name)

    if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      const text = await file.text()
      setCvText(text)
      toast.success('CV text loaded from file.')
      return
    }

    setExtracting(true)
    try {
      const data = await fileToBase64(file)
      const res = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data,
          mediaType: file.type || 'application/pdf',
          filename: file.name,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Extraction failed')
      setCvText(json.text)
      toast.success('CV text extracted. Review it below before analyzing.')
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Could not read that file.',
      )
      setFileName(null)
    } finally {
      setExtracting(false)
    }
  }

  async function handleAnalyze() {
    if (limitReached) {
      toast.error('You have reached your monthly analysis limit.')
      return
    }
    if (cvText.trim().length < 80) {
      toast.error('Please add your full CV text before analyzing.')
      return
    }
    setAnalyzing(true)
    const res = await analyzeCv({ cvText, desiredRole })
    if ('error' in res) {
      toast.error(res.error)
      setAnalyzing(false)
      return
    }
    toast.success('Your CV analysis is ready.')
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <Card className="p-6">
      {/* Usage / plan banner */}
      {usage.unlimited ? (
        <div className="mb-5 flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm text-accent-foreground">
          <Zap className="size-4 shrink-0" />
          <span>
            <span className="font-semibold">Pro plan</span> — unlimited CV
            analyses.
          </span>
        </div>
      ) : (
        <div
          className={`mb-5 flex flex-wrap items-center justify-between gap-2 rounded-lg border px-4 py-2.5 text-sm ${
            limitReached
              ? 'border-destructive/30 bg-destructive/10 text-destructive'
              : 'border-border bg-secondary/60 text-muted-foreground'
          }`}
        >
          <span>
            {limitReached ? (
              <>You&apos;ve used all {usage.limit} free analyses this month.</>
            ) : (
              <>
                <span className="font-medium text-foreground">
                  {usage.remaining} of {usage.limit}
                </span>{' '}
                free analyses left this month.
              </>
            )}
          </span>
          <Link
            href="/dashboard/billing"
            className="inline-flex items-center gap-1 font-medium text-accent underline-offset-2 hover:underline"
          >
            <Sparkles className="size-3.5" />
            Upgrade for unlimited
          </Link>
        </div>
      )}

      <div className="mb-5">
        <Label htmlFor="role" className="text-sm">
          The role you want next{' '}
          <span className="text-muted-foreground">(optional)</span>
        </Label>
        <Input
          id="role"
          value={desiredRole}
          onChange={(e) => setDesiredRole(e.target.value)}
          placeholder="e.g. Senior Data Scientist"
          className="mt-2"
          disabled={analyzing}
        />
        <p className="mt-1.5 text-xs text-muted-foreground">
          We&apos;ll show the certifications and skills you need to qualify for it.
        </p>
      </div>

      <Tabs defaultValue="paste">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="paste">
            <FileText className="size-4" />
            Paste text
          </TabsTrigger>
          <TabsTrigger value="upload">
            <FileUp className="size-4" />
            Upload file
          </TabsTrigger>
        </TabsList>

        <TabsContent value="paste" className="mt-4">
          <Textarea
            value={cvText}
            onChange={(e) => setCvText(e.target.value)}
            placeholder="Paste the full text of your CV here..."
            className="min-h-64 resize-y font-mono text-sm leading-relaxed"
            disabled={analyzing}
          />
        </TabsContent>

        <TabsContent value="upload" className="mt-4">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={extracting || analyzing}
            className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-secondary/40 px-6 py-12 text-center transition-colors hover:border-primary/50 hover:bg-secondary disabled:opacity-60"
          >
            {extracting ? (
              <Loader2 className="size-6 animate-spin text-primary" />
            ) : (
              <FileUp className="size-6 text-muted-foreground" />
            )}
            <span className="text-sm font-medium">
              {extracting
                ? 'Reading your file...'
                : fileName
                  ? fileName
                  : 'Click to upload PDF, DOCX, or image'}
            </span>
            <span className="text-xs text-muted-foreground">
              We extract the text so you can review it before analyzing.
            </span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED}
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) handleFile(f)
              e.target.value = ''
            }}
          />

          {cvText && !extracting && (
            <div className="mt-4">
              <Label className="text-xs text-muted-foreground">
                Extracted text — edit if needed
              </Label>
              <Textarea
                value={cvText}
                onChange={(e) => setCvText(e.target.value)}
                className="mt-2 min-h-48 resize-y font-mono text-sm leading-relaxed"
                disabled={analyzing}
              />
            </div>
          )}
        </TabsContent>
      </Tabs>

      <div className="mt-6 flex items-center justify-between gap-4">
        <p className="text-xs text-muted-foreground">
          {cvText.trim().length > 0
            ? `${cvText.trim().length.toLocaleString()} characters`
            : 'Add your CV to get started'}
        </p>
        {limitReached ? (
          <Button asChild>
            <Link href="/dashboard/billing">
              <Lock className="size-4" />
              Upgrade to analyze
            </Link>
          </Button>
        ) : (
          <Button onClick={handleAnalyze} disabled={analyzing || extracting}>
            {analyzing ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="size-4" />
                Analyze my CV
              </>
            )}
          </Button>
        )}
      </div>
    </Card>
  )
}
