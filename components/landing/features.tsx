import {
  Search,
  MessagesSquare,
  FileText,
  Target,
  GraduationCap,
  Users,
} from 'lucide-react'
import { Card } from '@/components/ui/card'

const tools = [
  {
    icon: FileText,
    title: 'CV Analyzer',
    desc: 'Reads your CV and shows exactly which roles you qualify for today, scored by match.',
  },
  {
    icon: Target,
    title: 'Path to Your Dream Role',
    desc: 'Wanting a role your CV does not fit yet? Get the certifications and skills to qualify.',
  },
  {
    icon: GraduationCap,
    title: 'CV Regenerator',
    desc: 'If your CV is holding you back, regenerate a clean, well-structured version from your info.',
  },
  {
    icon: Search,
    title: 'Search & Apply',
    desc: 'Search openings tailored to your profile and apply in one click, with every application tracked.',
  },
  {
    icon: MessagesSquare,
    title: 'Interview Practice',
    desc: 'Answer realistic questions and get the most successful, tailored response for your target career.',
  },
  {
    icon: Users,
    title: 'Specialist Chat',
    desc: 'Chat with AI career specialists and connect with them on LinkedIn when you are ready.',
  },
]

export function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="max-w-2xl">
        <p className="text-sm font-medium text-primary">One platform, six tools</p>
        <h2 className="mt-2 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          Everything you need to go from CV to offer
        </h2>
        <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
          OfferLab reads your CV once and runs your entire job hunt from it —
          matching roles, closing skill gaps, applying, and prepping you for the
          interview, all grounded in your real experience.
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
