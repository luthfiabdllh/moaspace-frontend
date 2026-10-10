import * as z from 'zod';

export const academicClusterEnum = z.enum(['SAINTEK', 'SOSHUM', 'MEDIKA', 'AGRO']);
export type AcademicCluster = z.infer<typeof academicClusterEnum>;

export const subunitRoleEnum = z.enum(['MEMBER', 'COORDINATOR']);
export type SubunitRole = z.infer<typeof subunitRoleEnum>;

export const createSubunitSchema = z.object({
  name: z.string().min(1, { error: 'Nama subunit posko wajib diisi.' }),
  slug: z.string().optional(),
  location: z.string().optional(),
  description: z.string().optional(),
});

export type CreateSubunitDTO = z.infer<typeof createSubunitSchema>;

export const updateSubunitSchema = z.object({
  name: z.string().min(1, { error: 'Nama subunit posko wajib diisi.' }).optional(),
  location: z.string().optional(),
  description: z.string().optional(),
});

export type UpdateSubunitDTO = z.infer<typeof updateSubunitSchema>;

export const addSubunitMemberSchema = z.object({
  userId: z.string().min(1, { error: 'Anggota wajib dipilih.' }),
  role: subunitRoleEnum.default('MEMBER'),
});

export type AddSubunitMemberDTO = z.infer<typeof addSubunitMemberSchema>;

export interface SubunitCoordinatorItem {
  id: string;
  name: string;
  email: string;
  cluster?: AcademicCluster | null;
  isClusterCoordinator?: boolean;
}

export interface SubunitItem {
  id: string;
  name: string;
  slug: string;
  location?: string | null;
  description?: string | null;
  createdAt: string;
  memberCount: number;
  coordinators: SubunitCoordinatorItem[];
}

export interface SubunitMemberItem {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userStatus: 'ACTIVE' | 'INACTIVE';
  cluster?: AcademicCluster | null;
  isClusterCoordinator?: boolean;
  role: SubunitRole;
  joinedAt: string;
}

export interface SubunitDetail extends SubunitItem {
  members: SubunitMemberItem[];
}
