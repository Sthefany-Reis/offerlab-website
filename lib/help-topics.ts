// Page-aware context for the OfferLab help bot. The widget matches the current
// pathname to one of these entries so the assistant can answer questions that
// are specific to the page the user is currently on.

export type HelpTopic = {
  // Human-readable name of the page/area.
  label: string
  // Short description + the most common questions, fed to the model as context.
  context: string
  // Suggested starter questions shown as quick-tap chips.
  starters: string[]
}

// Ordered most-specific first. Matching is done with `startsWith`, so place
// nested routes before their parents.
const TOPICS: { match: string; topic: HelpTopic }[] = [
  {
    match: '/dashboard/analyze',
    topic: {
      label: 'Analyze CV',
      context:
        'This is the Analyze CV page. The user pastes their CV text or uploads a file (PDF, DOCX, image, or TXT) and optionally enters a dream role. OfferLab then detects their best-fit roles, scores how well they match real jobs, lists skill gaps, assesses CV quality, and shows what is needed to reach their dream role. Common questions: which file types are supported (PDF, DOCX, images, and plain text), why an upload failed (try a PDF or paste the text), what the match score means, the difference between qualified roles and the dream role tab, and how to improve a low CV-quality score.',
      starters: [
        'What file types can I upload?',
        'What does the match score mean?',
        'My upload failed — what should I do?',
      ],
    },
  },
  {
    match: '/dashboard/jobs',
    topic: {
      label: 'Find Jobs',
      context:
        'This is the Find Jobs page. The user types a search query (role, skills, location) and OfferLab generates tailored job openings comparable to LinkedIn and Indeed listings, each with a match score, requirements, and nice-to-haves. They can apply in one click, which saves it to their Applications, and can compare each role on LinkedIn or Indeed. Common questions: how to search effectively, what apply does, and how the listings are generated.',
      starters: [
        'How do I search for the right jobs?',
        'What happens when I apply?',
        'How are these listings created?',
      ],
    },
  },
  {
    match: '/dashboard/applications',
    topic: {
      label: 'Applications',
      context:
        'This is the Applications page. It tracks every job the user has applied to, with an editable status (applied, interviewing, offer, rejected, etc.). Each application has a "View description" button to re-read the role details, plus links to view the role on LinkedIn and Indeed, and a withdraw button to remove it. Common questions: how to change a status, where to see the job description, and how to withdraw an application.',
      starters: [
        'How do I update an application status?',
        'Where can I see what I applied for?',
        'How do I withdraw an application?',
      ],
    },
  },
  {
    match: '/dashboard/interview',
    topic: {
      label: 'Interview Practice',
      context:
        'This is the Interview Practice page. The user enters a target role to generate realistic, role-tailored interview questions. For each question they can type their own answer and get back guidance on how to approach that kind of question, the strongest model answer, the framework it uses, personalized feedback, a score, and delivery tips. Common questions: how to start a session, how the feedback works, and how to get the best model answer.',
      starters: [
        'How do I start practicing?',
        'How does the answer feedback work?',
        'What kinds of questions will I get?',
      ],
    },
  },
  {
    match: '/dashboard/specialists',
    topic: {
      label: 'Specialists',
      context:
        'This is the Specialists page. The user can search for or browse AI career specialists (each with a photo, title, and specialty), see recommended ones, and open a streaming chat to get career guidance. Each specialist can also be connected with on LinkedIn. Common questions: how to find the right specialist, what the specialists can help with, and how the chat works.',
      starters: [
        'How do I find the right specialist?',
        'What can the specialists help with?',
        'How do I connect on LinkedIn?',
      ],
    },
  },
  {
    match: '/dashboard/history',
    topic: {
      label: 'CV History',
      context:
        'This is the CV History page. It lists every CV analysis the user has run, newest first, and clicking one reopens the full report. Common questions: how to revisit a past analysis and how to run a new one (go to Analyze CV).',
      starters: [
        'How do I reopen a past analysis?',
        'How do I run a new analysis?',
      ],
    },
  },
  {
    match: '/dashboard/profile',
    topic: {
      label: 'Profile & Settings',
      context:
        'This is the Profile & settings page. The user can view their account and edit their display name. Common questions: how to change their name, and where to find CV history or sign out (both are in the account menu in the top-right).',
      starters: [
        'How do I change my name?',
        'Where do I sign out?',
      ],
    },
  },
  {
    match: '/dashboard/report',
    topic: {
      label: 'CV Report',
      context:
        'This is a saved CV analysis report. It shows the detected best-fit role, qualified roles with match scores, salary ranges, skill gaps, companies hiring, a generated improved CV, and dream-role guidance. Each role has a "View role & companies hiring" button. Common questions: what the sections mean, how to copy the improved CV, and how to go back to history.',
      starters: [
        'What do these sections mean?',
        'How do I copy the improved CV?',
      ],
    },
  },
  {
    match: '/dashboard',
    topic: {
      label: 'Dashboard',
      context:
        'This is the OfferLab dashboard home. It summarizes the user\u2019s latest CV analysis and links out to the main tools: Analyze CV, Find Jobs, Applications, Interview Practice, and Specialists. Common questions: where to start (Analyze CV), and what each tool does.',
      starters: [
        'Where should I start?',
        'What can OfferLab do for me?',
        'How does the CV analysis work?',
      ],
    },
  },
]

const DEFAULT_TOPIC: HelpTopic = {
  label: 'OfferLab',
  context:
    'OfferLab is an AI-powered job-hunting platform. Its main features are: Analyze CV (detect best-fit roles, match scores, skill gaps, CV quality, and dream-role guidance), Find Jobs (AI-generated tailored openings), Applications (track and manage applications), Interview Practice (role-tailored questions with model answers and feedback), and Specialists (chat with AI career experts).',
  starters: [
    'What can OfferLab do?',
    'Where should I start?',
  ],
}

export function getHelpTopic(pathname: string): HelpTopic {
  const found = TOPICS.find((t) => pathname.startsWith(t.match))
  return found?.topic ?? DEFAULT_TOPIC
}
