import { tasksService, type TasksService } from './tasks.service.js'

let timer: ReturnType<typeof setInterval> | null = null
let running = false

export function startTasksScheduler(service: TasksService = tasksService): void {
  if (timer) return

  timer = setInterval(async () => {
    if (running) return
    running = true
    try {
      await service.runDueTasks()
    } catch (error) {
      console.error('Tasks scheduler tick failed', error)
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
