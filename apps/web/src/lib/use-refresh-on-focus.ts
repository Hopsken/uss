'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'

interface UseRefreshOnFocusOptions {
  enabled?: boolean
  minIntervalMs?: number
}

export function useRefreshOnFocus({ enabled = true, minIntervalMs = 30_000 }: UseRefreshOnFocusOptions = {}) {
  const router = useRouter()
  const lastRefreshRef = useRef(0)

  useEffect(() => {
    if (!enabled) {
      return
    }

    const maybeRefresh = () => {
      const now = Date.now()
      if (now - lastRefreshRef.current < minIntervalMs) {
        return
      }

      lastRefreshRef.current = now
      router.refresh()
    }

    const onFocus = () => {
      maybeRefresh()
    }

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        maybeRefresh()
      }
    }

    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [enabled, minIntervalMs, router])
}
