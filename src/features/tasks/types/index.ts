import * as z from 'zod';

export const taskStatusEnum = z.enum([
  'BACKLOG',
  'TODO',
  'IN_PROGRESS',
  'REVIEW',
  'DONE',
]);
export type TaskStatus = z.infer<typeof taskStatusEnum>;

export const taskPriorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']);
export type TaskPriority = z.infer<typeof taskPriorityEnum>;

export const taskActivityLogSchema = z.object({
  id: z.string(),
  entityType: z.string(),
  entityId: z.string(),
  action: z.string(),
  actorId: z.string().nullable().optional(),
  actorName: z.string().optional(),
  actorEmail: z.string().optional(),
  before: z.any().optional(),
  after: z.any().optional(),
  createdAt: z.string(),
});
export type TaskActivityLog = z.infer<typeof taskActivityLogSchema>;

export const STORY_POINTS_SCALE = [1, 2, 3, 5, 8] as const;
export type StoryPointValue = (typeof STORY_POINTS_SCALE)[number];

export const taskSpLogSchema = z.object({
  id: z.string(),
  oldSp: z.number().nullable().optional(),
  newSp: z.number(),
  reason: z.string(),
  changedById: z.string(),
  changedByName: z.string().nullable().optional(),
  createdAt: z.string(),
});
export type TaskSpLog = z.infer<typeof taskSpLogSchema>;

export const taskItemSchema = z.object({
  id: z.string(),
  storyId: z.string(),
  storyTitle: z.string().optional(),
  epicId: z.string().nullable().optional(),
  epicTitle: z.string().nullable().optional(),
  sourceRequestId: z.string().nullable().optional(),
  requestTitle: z.string().nullable().optional(),
  divisionId: z.string().optional(),
  divisionName: z.string().optional(),
  title: z.string(),
  description: z.string().nullable().optional(),
  status: taskStatusEnum,
  priority: taskPriorityEnum,
  storyPoints: z.number().nullable().optional(),
  spLockedAt: z.string().nullable().optional(),
  dueDate: z.string().nullable().optional(),
  position: z.string().optional(),
  isBlocked: z.boolean().default(false),
  blockedReason: z.string().nullable().optional(),
  assigneeId: z.string().nullable().optional(),
  assigneeName: z.string().nullable().optional(),
  assigneeEmail: z.string().nullable().optional(),
  startedAt: z.string().nullable().optional(),
  completedAt: z.string().nullable().optional(),
  revisionCount: z.number().default(0),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});
export type TaskItem = z.infer<typeof taskItemSchema>;

export const taskDetailSchema = taskItemSchema.extend({
  activityLogs: z.array(taskActivityLogSchema).default([]),
  spLogs: z.array(taskSpLogSchema).default([]),
});
export type TaskDetailItem = z.infer<typeof taskDetailSchema>;

export const createTaskSchema = z.object({
  storyId: z.string().min(1, { error: 'Story wajib dipilih.' }),
  title: z
    .string()
    .trim()
    .min(1, { error: 'Judul task tidak boleh kosong.' })
    .max(255, { error: 'Judul task maksimal 255 karakter.' }),
  description: z.string().optional(),
  assigneeId: z.string().optional(),
  status: taskStatusEnum.optional(),
  priority: taskPriorityEnum.optional(),
  storyPoints: z.number().optional(),
  override: z.boolean().optional(),
  dueDate: z.string().optional(),
  isBlocked: z.boolean().optional(),
  blockedReason: z.string().optional(),
});
export type CreateTaskDTO = z.infer<typeof createTaskSchema>;

export const updateTaskSchema = z.object({
  title: z.string().trim().min(1).max(255).optional(),
  description: z.string().optional(),
  assigneeId: z.string().nullable().optional(),
  status: taskStatusEnum.optional(),
  priority: taskPriorityEnum.optional(),
  storyPoints: z.number().nullable().optional(),
  spReason: z.string().optional(),
  override: z.boolean().optional(),
  dueDate: z.string().nullable().optional(),
  position: z.string().optional(),
  isBlocked: z.boolean().optional(),
  blockedReason: z.string().nullable().optional(),
});
export type UpdateTaskDTO = z.infer<typeof updateTaskSchema>;

