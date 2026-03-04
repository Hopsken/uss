import type { NextRequest } from 'next/server'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8787'

async function proxyAuth(request: NextRequest, path: string[]): Promise<Response> {
  const target = new URL(`/v1/auth/${path.join('/')}`, API_BASE_URL)
  target.search = request.nextUrl.search

  const headers = new Headers(request.headers)
  headers.delete('host')

  const upstream = await fetch(target, {
    method: request.method,
    headers,
    body: request.body,
    redirect: 'manual',
    duplex: 'half',
  } as RequestInit)

  const responseHeaders = new Headers()
  upstream.headers.forEach((value, key) => {
    if (key.toLowerCase() !== 'set-cookie') {
      responseHeaders.set(key, value)
    }
  })

  const setCookieValues =
    typeof (upstream.headers as Headers & { getSetCookie?: () => string[] }).getSetCookie === 'function'
      ? (upstream.headers as Headers & { getSetCookie: () => string[] }).getSetCookie()
      : []

  if (setCookieValues.length > 0) {
    for (const value of setCookieValues) {
      responseHeaders.append('set-cookie', value)
    }
  } else {
    const setCookie = upstream.headers.get('set-cookie')
    if (setCookie) {
      responseHeaders.append('set-cookie', setCookie)
    }
  }

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  })
}

function buildHandler() {
  return async (request: NextRequest, context: { params: Promise<{ path: string[] }> }) => {
    const params = await context.params
    return proxyAuth(request, params.path ?? [])
  }
}

export const GET = buildHandler()
export const POST = buildHandler()
export const PUT = buildHandler()
export const PATCH = buildHandler()
export const DELETE = buildHandler()
export const OPTIONS = buildHandler()
