import { createTheme } from '@mantine/core'

export const ussTheme = createTheme({
  fontFamily: 'Inter, system-ui, sans-serif',
  headings: {
    fontFamily: 'Space Grotesk, system-ui, sans-serif',
  },
  fontFamilyMonospace: 'JetBrains Mono, Fira Code, monospace',
  primaryColor: 'sky',
  colors: {
    sky: ['#f0f9ff', '#e0f2fe', '#bae6fd', '#7dd3fc', '#38bdf8', '#0ea5e9', '#0284c7', '#0369a1', '#075985', '#0c4a6e'],
    amber: ['#fffbeb', '#fef3c7', '#fde68a', '#fcd34d', '#fbbf24', '#f59e0b', '#d97706', '#b45309', '#92400e', '#78350f'],
    slate: ['#f8fafc', '#f1f5f9', '#e2e8f0', '#cbd5e1', '#94a3b8', '#64748b', '#475569', '#334155', '#1e293b', '#0f172a'],
  },
})
