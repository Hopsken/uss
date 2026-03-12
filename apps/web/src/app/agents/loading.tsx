import { PageContainer } from '@/components/app/page-shell'
import { Skeleton } from '@/components/ui/skeleton'

export default function AgentsLoading() {
  return (
    <PageContainer>
      <div className="flex flex-col gap-6">
        <div className="max-w-sm space-y-2">
          <Skeleton className="h-10 w-56 rounded-xl" />
          <Skeleton className="h-4 w-72 rounded-xl" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="h-48 rounded-3xl" />
          ))}
        </div>
      </div>
    </PageContainer>
  )
}
