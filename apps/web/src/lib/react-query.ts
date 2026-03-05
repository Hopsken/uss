import { isServer, QueryClient } from '@tanstack/react-query'

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 10 * 60_000,
        retry: 1,
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
      },
    },
  })
}

let browserQueryClient: QueryClient | undefined

export function getQueryClient() {
  if (isServer) {
    return createQueryClient()
  }

  if (!browserQueryClient) {
    browserQueryClient = createQueryClient()
  }

  return browserQueryClient
}
