import { auth } from '@/lib/auth'
import { generateText } from 'ai'
import { headers } from 'next/headers'
import mammoth from 'mammoth'

export const maxDuration = 60

const DOCX_MEDIA_TYPE =
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

function isDocx(mediaType?: string, filename?: string) {
  return (
    mediaType === DOCX_MEDIA_TYPE ||
    !!filename?.toLowerCase().endsWith('.docx')
  )
}

// Accepts a base64-encoded CV file (PDF/DOCX/image) and returns its plain text
// so it can be reviewed and analyzed. Text files are handled on the client.
export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { data?: string; mediaType?: string; filename?: string }
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid request' }, { status: 400 })
  }

  const { data, mediaType, filename } = body
  if (!data || !mediaType) {
    return Response.json({ error: 'Missing file data' }, { status: 400 })
  }

  // DOCX files aren't supported by the model's file input, so we extract their
  // text directly from the document XML with mammoth.
  if (isDocx(mediaType, filename)) {
    try {
      const buffer = Buffer.from(data, 'base64')
      const { value } = await mammoth.extractRawText({ buffer })
      const text = value.trim()
      if (!text) {
        return Response.json(
          { error: 'That .docx looks empty. Try pasting your CV text instead.' },
          { status: 422 },
        )
      }
      return Response.json({ text })
    } catch (err) {
      console.log(
        '[v0] docx extract error:',
        err instanceof Error ? err.message : err,
      )
      return Response.json(
        {
          error:
            'Could not read that .docx file. Try saving it as a PDF or pasting your CV text instead.',
        },
        { status: 500 },
      )
    }
  }

  // Legacy .doc (binary) isn't supported by mammoth or the model.
  if (filename?.toLowerCase().endsWith('.doc')) {
    return Response.json(
      {
        error:
          'Old .doc files aren\u2019t supported. Please save it as a .docx or PDF, or paste your CV text instead.',
      },
      { status: 415 },
    )
  }

  try {
    const { text } = await generateText({
      model: 'openai/gpt-5-mini',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Extract ALL text from this CV/resume document verbatim. Return only the raw text content, preserving section headings, bullet points, dates, and contact details. Do not summarize, comment, or add anything.',
            },
            {
              type: 'file',
              data,
              mediaType,
              filename: filename || 'cv.pdf',
            },
          ],
        },
      ],
    })

    return Response.json({ text })
  } catch (err) {
    console.log(
      '[v0] extract error:',
      err instanceof Error ? err.message : err,
    )
    return Response.json(
      { error: 'Could not read that file. Try pasting your CV text instead.' },
      { status: 500 },
    )
  }
}
