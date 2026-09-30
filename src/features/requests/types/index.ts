import * as z from 'zod';

export const requestStatusEnum = z.enum([
  'DRAFT',
  'WAITING_ORIGIN_APPROVAL',
  'SUBMITTED',
  'NEED_INFO',
  'REJECTED',
  'ACCEPTED',
  'IN_PROGRESS',
  'DELIVERED',
  'REVISION',
  'CONFIRMED',
]);
export type RequestStatus = z.infer<typeof requestStatusEnum>;

export interface TemplateFieldDefinition {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'date' | 'number';
  required: boolean;
  options?: string[];
  placeholder?: string;
}

export interface RequestTemplate {
  id: string;
  divisionId: string;
  name: string;
  description?: string | null;
  fields: TemplateFieldDefinition[];
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryAttachment {
  title: string;
  url: string;
}

export interface RequestEventItem {
  id: string;
  fromStatus: RequestStatus | null;
  toStatus: RequestStatus;
  note: string | null;
  createdAt: string;
  actorId: string;
  actorName: string;
  actorAvatar?: string | null;
}

export interface LinkedStorySummary {
  id: string;
  title: string;
  epicTitle: string | null;
  tasksCount: number;
  doneTasksCount: number;
}

export interface RequestPermissions {
  canApproveOrigin: boolean;
  canTriage: boolean;
  canRespondInfo: boolean;
  canConvertToStory: boolean;
  canDeliver: boolean;
  canConfirmOrRevise: boolean;
}

export const requestListItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: requestStatusEnum,
  deadline: z.string().nullable().optional(),
  fromDivisionId: z.string(),
  toDivisionId: z.string(),
  requesterId: z.string(),
  templateId: z.string().nullable().optional(),
  linkedStoryId: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  fromDivisionName: z.string(),
  toDivisionName: z.string(),
  requesterName: z.string(),
  requesterAvatar: z.string().nullable().optional(),
  templateName: z.string().nullable().optional(),
});
export type RequestListItem = z.infer<typeof requestListItemSchema>;

export const requestDetailSchema = requestListItemSchema.extend({
  brief: z.record(z.string(), z.unknown()),
  reason: z.string().nullable().optional(),
  deliveryNotes: z.string().nullable().optional(),
  deliveryAttachments: z
    .array(
      z.object({
        title: z.string(),
        url: z.string(),
      })
    )
    .nullable()
    .optional(),
  sourceTaskId: z.string().nullable().optional(),
  sourceStoryId: z.string().nullable().optional(),
  requesterEmail: z.string().optional(),
  events: z.array(z.any()).default([]),
  linkedStory: z.any().nullable().optional(),
  permissions: z.object({
    canApproveOrigin: z.boolean(),
    canTriage: z.boolean(),
    canRespondInfo: z.boolean(),
    canConvertToStory: z.boolean(),
    canDeliver: z.boolean(),
    canConfirmOrRevise: z.boolean(),
  }),
});
export type RequestDetail = z.infer<typeof requestDetailSchema>;

export const createRequestSchema = z.object({
  fromDivisionId: z.string().min(1, 'Divisi asal wajib dipilih'),
  toDivisionId: z.string().min(1, 'Divisi tujuan wajib dipilih'),
  templateId: z.string().optional(),
  title: z.string().trim().min(3, 'Judul permohonan minimal 3 karakter').max(255),
  brief: z.record(z.string(), z.unknown()),
  deadline: z.string().optional(),
  sourceTaskId: z.string().optional(),
  sourceStoryId: z.string().optional(),
});
export type CreateRequestDTO = z.infer<typeof createRequestSchema>;

export const originApprovalSchema = z.object({
  action: z.enum(['APPROVE', 'REJECT']),
  reason: z.string().optional(),
});
export type OriginApprovalDTO = z.infer<typeof originApprovalSchema>;

export const triageRequestSchema = z.object({
  action: z.enum(['ACCEPT', 'REJECT', 'NEED_INFO']),
  reason: z.string().optional(),
});
export type TriageRequestDTO = z.infer<typeof triageRequestSchema>;

export const respondInfoSchema = z.object({
  brief: z.record(z.string(), z.unknown()),
  note: z.string().optional(),
});
export type RespondInfoDTO = z.infer<typeof respondInfoSchema>;

export const convertToStorySchema = z.object({
  title: z.string().optional(),
  epicId: z.string().optional(),
  doneCriteria: z.string().optional(),
  targetDate: z.string().optional(),
  prokerTag: z.string().optional(),
});
export type ConvertToStoryDTO = z.infer<typeof convertToStorySchema>;

export const deliverRequestSchema = z.object({
  deliveryNotes: z.string().min(3, 'Catatan pengiriman wajib diisi'),
  deliveryAttachments: z
    .array(
      z.object({
        title: z.string().min(1, 'Judul lampiran wajib diisi'),
        url: z.string().url('URL lampiran tidak valid'),
      })
    )
    .min(1, 'Minimal harus ada 1 lampiran hasil kerja'),
});
export type DeliverRequestDTO = z.infer<typeof deliverRequestSchema>;

export const confirmRequestSchema = z.object({
  action: z.enum(['CONFIRM', 'REVISION']),
  reason: z.string().optional(),
});
export type ConfirmRequestDTO = z.infer<typeof confirmRequestSchema>;
