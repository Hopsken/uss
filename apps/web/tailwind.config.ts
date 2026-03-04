import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: ['class', '[data-mantine-color-scheme="dark"]'],
  theme: {
    extend: {},
  },
  plugins: [],
}

export default config
