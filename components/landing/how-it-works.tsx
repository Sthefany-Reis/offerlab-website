import { Upload, Sparkles, Rocket } from 'lucide-react'

const steps = [
  {
    icon: Upload,
    title: 'Upload your CV',
    desc: 'Paste your CV or drop in a PDF, DOCX, or image. Add a dream role if you have one in mind.',
  },
  {
    icon: Sparkles,
    title: 'See where you stand',
    desc: 'OfferLab detects your best-fit roles, scores how well you match, and maps the gaps to your dream role in seconds.',
  },
  {
    icon: Rocket,
    title: 'Apply, prep, and land',
    desc: 'Apply to tailored openings in one click, rehearse with real interview questions, and turn the application into an offer.',
  },
]

export function HowItWorks() {
  return (
    <section id="how" className="border-y border-border bg-secondary/40">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-primary">How it works</p>
          <h2 className="mt-2 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Three steps to your next role
          </h2>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {steps.map((step, i) => (
            <div key={step.title} className="relative">
              <div className="flex items-center gap-3">
                <div className="grid size-11 place-items-center rounded-lg bg-background text-primary shadow-sm">
                  <step.icon className="size-5" aria-hidden="true" />
                </div>
                <span className="font-mono text-sm text-muted-foreground">
                  0{i + 1}
                </span>
              </div>
              <h3 className="mt-5 text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
