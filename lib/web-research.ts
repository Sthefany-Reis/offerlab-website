import { generateText } from 'ai'

// Model with live web access (Perplexity Sonar via the Vercel AI Gateway).
// It searches the open web at request time and returns real, current results
// with source citations.
const SEARCH_MODEL = 'perplexity/sonar'

export type WebResearch = {
  text: string
  sources: { title: string; url: string }[]
}

/**
 * Runs a live web search and returns the model's synthesized answer plus the
 * real source URLs it cited. Used to ground job listings and CV/cover-letter
 * optimization in what is actually published online right now.
 */
export async function researchWeb(prompt: string): Promise<WebResearch> {
  const { text, sources } = await generateText({
    model: SEARCH_MODEL,
    prompt,
  })

  const seen = new Set<string>()
  const cleaned: { title: string; url: string }[] = []
  for (const s of sources ?? []) {
    // Only URL sources carry a usable link.
    if (s.sourceType !== 'url' || !s.url || seen.has(s.url)) continue
    seen.add(s.url)
    cleaned.push({ title: s.title || s.url, url: s.url })
  }

  return { text, sources: cleaned }
}
