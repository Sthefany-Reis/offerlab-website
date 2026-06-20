import {
  Briefcase,
  MessagesSquare,
  FileText,
  Target,
  GraduationCap,
} from 'lucide-react'
import { Card } from '@/components/ui/card'

const tools = [
  {
    icon: Briefcase,
    title: 'AI Job Hunter',
    desc: 'Surfaces the roles you should be targeting and scores how well you match each one today.',
  },
  {
    icon: FileText,
    title: 'CV Optimizer',
    desc: 'Reads your CV, finds what is dragging it down, and rewrites tailored summaries for each role.',
  },
  {
    icon: Target,
    title: 'Skill Gap Analyzer',
    desc: 'Pinpoints the exact skills standing between you and your target role, ranked by impact.',
  },
  {
    icon: GraduationCap,
    title: 'Learning Coach',
    desc: 'Turns those gaps into a sequenced, week-by-week roadmap with concrete resources.',
  },
  {
    icon: MessagesSquare,
    title: 'Interview Coach',
    desc: 'Predicts the questions you will face and drills strong, tailored answers with you.',
  },
]

export function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="max-w-2xl">
        <p className="text-sm font-medium text-primary">Five tools, one upload</p>
        <h2 className="mt-2 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          Everything you need to go from CV to offer
        </h2>
        <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
          OfferLab reads your CV once and runs five specialized career engines on
          it, so every recommendation is consistent and grounded in your real
          experience.
        </p>
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <Card
            key={tool.title}
            className="group p-6 transition-colors hover:border-primary/40"
          >
            <div className="grid size-11 place-items-center rounded-lg bg-secondary text-primary">
              <tool.icon className="size-5" aria-hidden="true" />
            </div>
            <h3 className="mt-5 text-lg font-semibold">{tool.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {tool.desc}
            </p>
          </Card>
        ))}
        <Card className="flex flex-col justify-center bg-primary p-6 text-primary-foreground">
          <p className="text-2xl font-semibold tracking-tight">+38%</p>
          <p className="mt-2 text-sm leading-relaxed text-primary-foreground/80">
            Average salary upside our roadmap unlocks once your top skill gaps are
            closed.
          </p>
        </Card>
      </div>
    </section>
  )
}
