import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'OfferLab — Land your next role with AI',
  description:
    'Upload your CV and get a market-value estimate, missing-skills analysis, a personalized learning roadmap, tailored applications, and interview prep — all in one place.',
  generator: 'v0.app',
  icons: {
    icon: '/offerlab-mark.png',
    apple: '/offerlab-mark.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#2b2540',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`dark ${geistSans.variable} ${geistMono.variable} bg-background`}
    >
      <body className="font-sans antialiased">
        {children}
        <Toaster richColors position="top-center" />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
