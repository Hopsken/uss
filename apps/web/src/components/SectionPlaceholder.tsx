import { PageContainer, SectionCard } from '@/components/app/page-shell'

export function SectionPlaceholder({
  title,
  subtitle,
}: {
  title: string
  subtitle: string
}) {
  return (
    <PageContainer>
      <SectionCard title={title} description={subtitle}>
        <div className="font-mono text-sm text-muted-foreground">Shell milestone placeholder</div>
      </SectionCard>
    </PageContainer>
  )
}
