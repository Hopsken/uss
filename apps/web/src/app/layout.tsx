import '@/styles/global.css'

import type { Metadata } from 'next'
import { JetBrains_Mono, Manrope, Sora } from 'next/font/google'
import { ShellFrame } from '@/components/ShellFrame'
import { ReactQueryProvider } from '@/components/providers/ReactQueryProvider'
import { TooltipProvider } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

const headingFont = Sora({
  subsets: ['latin'],
  variable: '--font-heading-google',
  display: 'swap',
})

const bodyFont = Manrope({
  subsets: ['latin'],
  variable: '--font-body-google',
  display: 'swap',
})

const monoFont = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono-google',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'USS',
  description: 'OpenClaw AI agent command center',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(headingFont.variable, bodyFont.variable, monoFont.variable, 'font-sans')}
    >
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <ReactQueryProvider>
          <TooltipProvider delayDuration={120}>
            <ShellFrame>{children}</ShellFrame>
          </TooltipProvider>
        </ReactQueryProvider>
      </body>
    </html>
  )
}
