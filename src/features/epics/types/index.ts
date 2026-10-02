import * as z from 'zod';

export const epicDivisionSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
});

export const epicItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable().optional(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  prokerTag: z.string().nullable().optional(),
  scope: z.enum(['DIVISION', 'CROSS']),
  ownerDivisionId: z.string().nullable().optional(),
  ownerDivisionName: z.string().nullable().optional(),
  createdById: z.string(),
  creatorName: z.string().optional(),
  sourceRequestId: z.string().nullable().optional(),
  requestTitle: z.string().nullable().optional(),
  closedAt: z.string().nullable().optional(),
  isClosed: z.boolean().default(false),
  participatingDivisions: z.array(epicDivisionSchema).default([]),
  storyCount: z.number().default(0),
  totalTasks: z.number().default(0),
  doneTasks: z.number().default(0),
  progressPercentage: z.number().default(0),
  createdAt: z.string().optional(),
});

export const createEpicSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, { error: 'Judul epic tidak boleh kosong.' })
    .max(255, { error: 'Judul epic maksimal 255 karakter.' }),
  description: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  prokerTag: z.string().max(100).optional(),
  scope: z.enum(['DIVISION', 'CROSS']),
  ownerDivisionId: z.string().optional(),
  participatingDivisionIds: z.array(z.string()).optional(),
});

export const updateEpicSchema = z.object({
  title: z.string().trim().min(1).max(255).optional(),
  description: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  prokerTag: z.string().max(100).optional(),
  ownerDivisionId: z.string().optional(),
  participatingDivisionIds: z.array(z.string()).optional(),
  isClosed: z.boolean().optional(),
});

export type EpicDivision = z.infer<typeof epicDivisionSchema>;
export type EpicItem = z.infer<typeof epicItemSchema>;
export type CreateEpicDTO = z.infer<typeof createEpicSchema>;
export type UpdateEpicDTO = z.infer<typeof updateEpicSchema>;
