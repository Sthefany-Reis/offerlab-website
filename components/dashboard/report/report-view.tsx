'use client'

import type { AnalysisResult } from '@/lib/analysis-schema'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MarketValueCard } from './market-value-card'
import { SkillGaps } from './skill-gaps'
import { Roadmap } from './roadmap'
import { Applications } from './applications'
import { InterviewPrep } from './interview-prep'
import { CheckCircle2 } from 'lucide-react'

export function ReportView({ result }: { result: AnalysisResult }) {
  return (
    <div className="space-y-6">
      <MarketValueCard result={result} />

      <Card className="p-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="capitalize">
            {result.seniority}
          </Badge>
          <span className="text-sm text-muted-foreground">
            Best fit: <span className="text-foreground">{result.detectedRole}</span>
          </span>
        </div>
        <p className="mt-3 leading-relaxed">{result.summary}</p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {result.strengths.map((s) => (
            <div key={s} className="flex items-start gap-2 text-sm">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
              <span className="text-muted-foreground">{s}</span>
            </div>
          ))}
        </div>
      </Card>

      <Tabs defaultValue="skills">
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">
          <TabsTrigger value="skills">Skill gaps</TabsTrigger>
          <TabsTrigger value="roadmap">Learning roadmap</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="interview">Interview prep</TabsTrigger>
        </TabsList>

        <TabsContent value="skills" className="mt-5">
          <SkillGaps result={result} />
        </TabsContent>
        <TabsContent value="roadmap" className="mt-5">
          <Roadmap result={result} />
        </TabsContent>
        <TabsContent value="applications" className="mt-5">
          <Applications result={result} />
        </TabsContent>
        <TabsContent value="interview" className="mt-5">
          <InterviewPrep result={result} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
