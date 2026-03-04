'use client'

import { passkeyClient } from '@better-auth/passkey/client'
import { createAuthClient } from 'better-auth/client'

const AUTH_BASE_URL = typeof window === 'undefined' ? 'http://localhost:3000' : window.location.origin

export const authClient = createAuthClient({
  baseURL: AUTH_BASE_URL,
  basePath: '/api/auth',
  fetchOptions: {
    credentials: 'include',
  },
  plugins: [passkeyClient()],
})
