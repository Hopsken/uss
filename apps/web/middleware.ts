import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8787'

async function loadBootstrapStatus(request: NextRequest): Promise<{ needsBootstrap: boolean }> {
  const response = await fetch(`${API_BASE_URL}/v1/auth/bootstrap/status`, {
    headers: {
      cookie: request.headers.get('cookie') ?? '',
    },
    cache: 'no-store',
  })

  if (!response.ok) {
    return { needsBootstrap: false }
  }

  return (await response.json()) as { needsBootstrap: boolean }
}

async function loadSession(request: NextRequest): Promise<unknown | null> {
  const response = await fetch(`${API_BASE_URL}/v1/auth/get-session?disableCookieCache=true`, {
    headers: {
      cookie: request.headers.get('cookie') ?? '',
    },
    cache: 'no-store',
  })

  if (!response.ok) {
    return null
  }

  const payload = await response.json()
  if (!payload) {
    return null
  }

  if (typeof payload === 'object' && payload !== null && 'session' in payload) {
    return (payload as { session: unknown }).session ? payload : null
  }

  return payload
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/_next') || pathname.startsWith('/favicon') || pathname.startsWith('/api')) {
    return NextResponse.next()
  }

  const { needsBootstrap } = await loadBootstrapStatus(request)

  if (needsBootstrap && pathname !== '/auth/bootstrap') {
    return NextResponse.redirect(new URL('/auth/bootstrap', request.url))
  }

  if (!needsBootstrap && pathname === '/auth/bootstrap') {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  const session = await loadSession(request)

  if (!needsBootstrap && !session && !pathname.startsWith('/auth/login')) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  if (session && pathname.startsWith('/auth')) {
    return NextResponse.redirect(new URL('/bridge', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
