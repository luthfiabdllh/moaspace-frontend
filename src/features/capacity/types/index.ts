import * as z from 'zod';

export const capacityRequestStatusEnum = z.enum([
  'NONE',
  'PENDING',
  'APPROVED',
  'REJECTED',
]);
export type CapacityRequestStatus = z.infer<typeof capacityRequestStatusEnum>;

export const memberUtilizationSchema = z.object({
  userId: z.string(),
  userName: z.string(),
  userEmail: z.string(),
  avatarUrl: z.string().nullable().optional(),
  weekStart: z.string(),
  capacitySp: z.number(),
  activeSp: z.number(),
  utilizationPercentage: z.number(),
  status: z.enum(['NORMAL', 'WARNING', 'OVERLOAD']),
  requestStatus: capacityRequestStatusEnum,
  requestedSp: z.number().nullable().optional(),
  note: z.string().nullable().optional(),
  capacityId: z.string(),
});
export type MemberUtilization = z.infer<typeof memberUtilizationSchema>;

export const createCapacityRequestSchema = z.object({
  requestedSp: z
    .number({ error: 'Kapasitas harus berupa angka' })
    .int()
    .min(1, 'Kapasitas minimal 1 SP')
    .max(40, 'Kapasitas maksimal 40 SP'),
  note: z
    .string()
    .trim()
    .min(3, 'Alasan pengajuan minimal 3 karakter')
    .max(500, 'Alasan pengajuan maksimal 500 karakter'),
});
export type CreateCapacityRequestDTO = z.infer<typeof createCapacityRequestSchema>;

export const reviewCapacityRequestSchema = z.object({
  action: z.enum(['APPROVE', 'REJECT']),
  approvedSp: z.number().int().min(1).max(40).optional(),
  note: z.string().optional(),
});
export type ReviewCapacityRequestDTO = z.infer<typeof reviewCapacityRequestSchema>;

export interface OvercapacityWarningData {
  assigneeId: string;
  assigneeName: string;
  currentActiveSp: number;
  taskSp: number;
  capacitySp: number;
  projectedSp: number;
  utilizationPercentage: number;
}
