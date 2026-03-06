import { tasksService, type TasksService } from './tasks.service.js'
import { logger } from '../../infra/logging/logger.js'

let timer: ReturnType<typeof setInterval> | null = null
let running = false
const schedulerLogger = logger.child({ module: 'tasks-scheduler' })

export function startTasksScheduler(service: TasksService = tasksService): void {
  if (timer) return

  timer = setInterval(async () => {
    if (running) return
    running = true
    try {
      await service.runDueTasks()
    } catch (error) {
      schedulerLogger.error({ error }, 'tasks_scheduler.tick_failed')
    } finally {
      running = false
    }
  }, 5_000)
}

export function stopTasksScheduler(): void {
  if (!timer) return
  clearInterval(timer)
  timer = null
}
