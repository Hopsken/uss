import type {
  ArchivedTasksResponse,
  CreateTaskRequest,
  CreateTaskTemplateRequest,
  TaskReassignRequest,
  TaskStatusChangeRequest,
  TasksDashboardResponse,
  UpdateTaskRequest,
  UpdateTaskTemplateRequest,
} from '@uss/shared'
import { tasksService } from './tasks.service.js'

export const tasksController = {
  getDashboard: async (agentId?: string): Promise<TasksDashboardResponse> =>
    await tasksService.loadDashboard(agentId),
  getArchivedTasks: async (agentId?: string): Promise<ArchivedTasksResponse> =>
    await tasksService.loadArchivedTasks(agentId),
  postTask: async (body: CreateTaskRequest) => await tasksService.createTask(body),
  patchTask: async (taskId: string, body: UpdateTaskRequest) => await tasksService.updateTask(taskId, body),
  deleteTask: async (taskId: string) => await tasksService.deleteTask(taskId),
  postRunNow: async (taskId: string) => await tasksService.runNow(taskId),
  patchTaskStatus: async (taskId: string, body: TaskStatusChangeRequest) =>
    await tasksService.changeStatus(taskId, body),
  patchTaskReassign: async (taskId: string, body: TaskReassignRequest) =>
    await tasksService.reassignTask(taskId, body),
  getTaskRuns: async (taskId: string) => await tasksService.listTaskRuns(taskId),
  postTemplate: async (body: CreateTaskTemplateRequest) => await tasksService.createTemplate(body),
  patchTemplate: async (templateId: string, body: UpdateTaskTemplateRequest) =>
    await tasksService.updateTemplate(templateId, body),
  deleteTemplate: async (templateId: string) => await tasksService.deleteTemplate(templateId),
}
