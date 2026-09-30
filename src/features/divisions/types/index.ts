import * as z from 'zod';

export const coordinatorSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
});

export const divisionItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  requestApprovalEnabled: z.boolean(),
  createdAt: z.string().optional(),
  memberCount: z.number().default(0),
  coordinators: z.array(coordinatorSchema).default([]),
});

export const divisionMemberItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  status: z.enum(['ACTIVE', 'INACTIVE']),
  role: z.enum(['MEMBER', 'COORDINATOR']),
  joinedAt: z.string().optional(),
});

export const divisionDetailSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  requestApprovalEnabled: z.boolean(),
  createdAt: z.string().optional(),
  memberCount: z.number().default(0),
  members: z.array(divisionMemberItemSchema).default([]),
});

export const createDivisionSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { error: 'Nama divisi tidak boleh kosong.' })
    .max(100, { error: 'Nama divisi maksimal 100 karakter.' }),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message: 'Slug hanya boleh memuat huruf kecil, angka, dan tanda hubung (-).',
    })
    .optional()
    .or(z.literal('')),
  requestApprovalEnabled: z.boolean(),
});

export const updateDivisionSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { error: 'Nama divisi tidak boleh kosong.' })
    .max(100, { error: 'Nama divisi maksimal 100 karakter.' })
    .optional(),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message: 'Slug hanya boleh memuat huruf kecil, angka, dan tanda hubung (-).',
    })
    .optional()
    .or(z.literal('')),
  requestApprovalEnabled: z.boolean().optional(),
});

export type Coordinator = z.infer<typeof coordinatorSchema>;
export type DivisionItem = z.infer<typeof divisionItemSchema>;
export type DivisionMemberItem = z.infer<typeof divisionMemberItemSchema>;
export type DivisionDetail = z.infer<typeof divisionDetailSchema>;
export type CreateDivisionDTO = z.infer<typeof createDivisionSchema>;
export type UpdateDivisionDTO = z.infer<typeof updateDivisionSchema>;
