import { TasksClient } from '@/components/tasks/TasksClient'
import { Suspense } from 'react'

export default function TasksPage() {
  return (
    <Suspense fallback={null}>
      <TasksClient />
    </Suspense>
  )
}
