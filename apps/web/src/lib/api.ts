import type { BridgeResponse } from '@uss/shared'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8787'

export async function fetchBridgeData(): Promise<BridgeResponse> {
  const res = await fetch(`${API_BASE_URL}/v1/bridge`, { cache: 'no-store' })

  if (!res.ok) {
    throw new Error(`Failed to fetch bridge data: ${res.status}`)
  }

  return (await res.json()) as BridgeResponse
}
