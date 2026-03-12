import { PageContainer } from '@/components/app/page-shell'
import { Skeleton } from '@/components/ui/skeleton'

export default function SkillsLoading() {
  return (
    <PageContainer size="wide">
      <div className="flex h-full flex-col gap-6">
        <div className="max-w-sm space-y-2">
          <Skeleton className="h-10 w-52 rounded-xl" />
          <Skeleton className="h-4 w-72 rounded-xl" />
        </div>
        <Skeleton className="min-h-[34rem] flex-1 rounded-3xl" />
      </div>
    </PageContainer>
  )
}
