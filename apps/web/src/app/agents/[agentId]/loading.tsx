import { PageContainer } from '@/components/app/page-shell'
import { Skeleton } from '@/components/ui/skeleton'

export default function AgentDetailLoading() {
  return (
    <PageContainer>
      <div className="flex flex-col gap-6">
        <Skeleton className="h-8 w-28 rounded-xl" />
        <Skeleton className="h-40 rounded-3xl" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-32 rounded-3xl" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-72 rounded-3xl" />
          <Skeleton className="h-72 rounded-3xl" />
        </div>
        <Skeleton className="h-[28rem] rounded-3xl" />
      </div>
    </PageContainer>
  )
}
