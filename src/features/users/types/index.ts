import * as z from 'zod';

export const createUserSchema = z.object({
  name: z.string().min(1, { error: 'Nama lengkap wajib diisi.' }),
  email: z.email({ error: 'Masukkan alamat email yang valid.' }),
  divisionId: z.string().min(1, { error: 'Divisi wajib dipilih.' }),
  role: z.enum(['MEMBER', 'COORDINATOR']),
});

export type CreateUserDTO = z.infer<typeof createUserSchema>;

export interface DivisionItem {
  id: string;
  name: string;
  slug: string;
  requestApprovalEnabled?: boolean;
}

export interface UserDivision {
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
  status: 'ACTIVE' | 'INACTIVE';
  isActivated: boolean;
  createdAt: string;
  divisions: UserDivision[];
}
