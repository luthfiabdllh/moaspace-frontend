import * as z from 'zod';

export const createUserSchema = z.object({
  name: z.string().min(1, { error: 'Nama lengkap wajib diisi.' }),
  email: z.email({ error: 'Masukkan alamat email yang valid.' }),
  divisionId: z.string().min(1, { error: 'Divisi wajib dipilih.' }),
  role: z.enum(['MEMBER', 'COORDINATOR', 'KORMANIT', 'KOORDINATOR_MAHASISWA_UNIT']),
});

export type CreateUserDTO = z.infer<typeof createUserSchema>;

export interface DivisionItem {
  id: string;
  name: string;
  slug: string;
  requestApprovalEnabled?: boolean;
}

export interface UserDivision {
  id?: string;
  userId?: string;
  divisionId: string;
  role: 'MEMBER' | 'COORDINATOR';
  divisionName: string;
  divisionSlug: string;
}

export interface UserListItem {
  id: string;
  name: string;
  email: string;
  isSuperAdmin: boolean;
  isKormanit?: boolean;
  status: 'ACTIVE' | 'INACTIVE';
  isActivated: boolean;
  createdAt: string;
  divisions: UserDivision[];
}

export interface AddUserDivisionDTO {
  divisionId: string;
  role: 'MEMBER' | 'COORDINATOR';
}

export interface UpdateUserDivisionRoleDTO {
  role: 'MEMBER' | 'COORDINATOR';
}

export interface MoveUserDivisionDTO {
  fromDivisionId: string;
  toDivisionId: string;
  role?: 'MEMBER' | 'COORDINATOR';
}

export interface UpdateUserGlobalRoleDTO {
  isKormanit: boolean;
}

export interface ActivityLogItem {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  actorId?: string | null;
  actorName?: string | null;
  actorEmail?: string | null;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
  createdAt: string;
}

export interface QueryActivityLogsParams {
  search?: string;
  action?: string;
  entityType?: string;
  entityId?: string;
  sortBy?: 'createdAt' | 'action' | 'actorName';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface ActivityLogsResponse {
  items: ActivityLogItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasMore: boolean;
  };
}
