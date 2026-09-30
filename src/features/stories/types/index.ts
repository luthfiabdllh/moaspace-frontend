import * as z from 'zod';

export const storyItemSchema = z.object({
  id: z.string(),
  epicId: z.string().nullable().optional(),
  epicTitle: z.string().nullable().optional(),
  divisionId: z.string(),
  divisionName: z.string().optional(),
  divisionSlug: z.string().optional(),
  title: z.string(),
  doneCriteria: z.string().nullable().optional(),
  targetDate: z.string().nullable().optional(),
  prokerTag: z.string().nullable().optional(),
  sourceRequestId: z.string().nullable().optional(),
  closedAt: z.string().nullable().optional(),
  isClosed: z.boolean().default(false),
  totalTasks: z.number().default(0),
  doneTasks: z.number().default(0),
  progressPercentage: z.number().default(0),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const createStorySchema = z.object({
  divisionId: z.string().min(1, { error: 'Divisi wajib dipilih.' }),
  epicId: z.string().optional(),
  title: z
    .string()
    .trim()
    .min(1, { error: 'Judul story tidak boleh kosong.' })
    .max(255, { error: 'Judul story maksimal 255 karakter.' }),
  doneCriteria: z.string().optional(),
  targetDate: z.string().optional(),
  prokerTag: z.string().max(100).optional(),
  sourceRequestId: z.string().optional(),
});

export const updateStorySchema = z.object({
  epicId: z.string().nullable().optional(),
  title: z.string().trim().min(1).max(255).optional(),
  doneCriteria: z.string().optional(),
  targetDate: z.string().optional(),
  prokerTag: z.string().max(100).optional(),
  isClosed: z.boolean().optional(),
});

export type StoryItem = z.infer<typeof storyItemSchema>;
export type CreateStoryDTO = z.infer<typeof createStorySchema>;
export type UpdateStoryDTO = z.infer<typeof updateStorySchema>;
