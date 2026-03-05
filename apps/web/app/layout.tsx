import '@mantine/core/styles.css'
import '@/styles/global.css'

import { ColorSchemeScript, MantineProvider } from '@mantine/core'
import type { Metadata } from 'next'
import { Inter, JetBrains_Mono, Space_Grotesk } from 'next/font/google'
import { ussTheme } from '@/lib/theme'
import { ShellFrame } from '@/components/ShellFrame'
import { ReactQueryProvider } from '@/components/providers/ReactQueryProvider'

export const metadata: Metadata = {
  title: 'USS',
  description: 'OpenClaw AI agent command center',
}

const headingFont = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-heading-google',
  display: 'swap',
})

const bodyFont = Inter({
  subsets: ['latin'],
  variable: '--font-body-google',
  display: 'swap',
})

const monoFont = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono-google',
  display: 'swap',
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${headingFont.variable} ${bodyFont.variable} ${monoFont.variable}`}
    >
      <head>
        <ColorSchemeScript defaultColorScheme="light" />
      </head>
      <body>
        <MantineProvider theme={ussTheme} defaultColorScheme="light">
          <ReactQueryProvider>
            <ShellFrame>{children}</ShellFrame>
          </ReactQueryProvider>
        </MantineProvider>
      </body>
    </html>
  )
}
