import * as z from 'zod';
import type { AcademicCluster } from '@/features/subunits/types';

export const programScopeEnum = z.enum(['UNIT', 'SUBUNIT']);
export type ProgramScope = z.infer<typeof programScopeEnum>;

export const programClusterEnum = z.enum([
  'SAINTEK',
  'SOSHUM',
  'MEDIKA',
  'AGRO',
  'UNIT_SHARED',
]);
export type ProgramCluster = z.infer<typeof programClusterEnum>;

export const programStatusEnum = z.enum([
  'PROPOSED',
  'ACTIVE',
  'COMPLETED',
  'CANCELLED',
]);
export type ProgramStatus = z.infer<typeof programStatusEnum>;

export const programApprovalStatusEnum = z.enum(['PENDING', 'APPROVED', 'REJECTED']);
export type ProgramApprovalStatus = z.infer<typeof programApprovalStatusEnum>;

export const createProgramSchema = z.object({
  title: z.string().min(1, { error: 'Judul program kerja wajib diisi.' }).max(255),
  description: z.string().optional(),
  scope: programScopeEnum,
  subunitId: z.string().optional(),
  cluster: programClusterEnum,
  primaryPicId: z.string().min(1, { error: 'PIC Utama wajib dipilih.' }),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  coPicIds: z.array(z.string()).optional(),
  memberIds: z.array(z.string()).optional(),
});

export type CreateProgramDTO = z.infer<typeof createProgramSchema>;

export const updateProgramSchema = z.object({
  title: z.string().min(1, { error: 'Judul program kerja wajib diisi.' }).max(255).optional(),
  description: z.string().optional(),
  scope: programScopeEnum.optional(),
  subunitId: z.string().optional(),
  cluster: programClusterEnum.optional(),
  primaryPicId: z.string().optional(),
  status: programStatusEnum.optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type UpdateProgramDTO = z.infer<typeof updateProgramSchema>;

export const reviewProgramSchema = z.object({
  decision: z.enum(['APPROVED', 'REJECTED']),
  reason: z.string().optional(),
});

export type ReviewProgramDTO = z.infer<typeof reviewProgramSchema>;

export interface ProgramUserSummary {
  id: string;
  name: string;
  email: string;
  cluster?: AcademicCluster | null;
  isClusterCoordinator?: boolean;
}

export interface ProgramMemberItem {
  id: string;
  userId: string;
  role: 'CO_PIC' | 'MEMBER';
  user: ProgramUserSummary | null;
}

export interface ProgramMetrics {
  totalEpics: number;
  completedEpics: number;
  totalTasks: number;
  completedTasks: number;
  totalPoints: number;
  completedPoints: number;
  progressPercentage: number;
}

export interface ProgramItem {
  id: string;
  title: string;
  description?: string | null;
  scope: ProgramScope;
  subunitId?: string | null;
  cluster: ProgramCluster;
  primaryPicId: string;
  startDate?: string | null;
  endDate?: string | null;
  status: ProgramStatus;

  clusterApprovalStatus: ProgramApprovalStatus;
  clusterApprovedById?: string | null;
  clusterApprovedAt?: string | null;
  clusterRejectionReason?: string | null;
  clusterApprovedBy?: ProgramUserSummary | null;

  governanceApprovalStatus: ProgramApprovalStatus;
  governanceApprovedById?: string | null;
  governanceApprovedAt?: string | null;
  governanceRejectionReason?: string | null;
  governanceApprovedBy?: ProgramUserSummary | null;

  createdById: string;
  createdAt: string;
  updatedAt: string;

  subunit?: {
    id: string;
    name: string;
    slug: string;
    location?: string | null;
  } | null;

  primaryPic: ProgramUserSummary | null;
  members: ProgramMemberItem[];
  metrics: ProgramMetrics;
}

export interface ProgramDetail extends ProgramItem {
  epics: {
    id: string;
    title: string;
    description?: string | null;
    scope: 'DIVISION' | 'CROSS';
    startDate?: string | null;
    endDate?: string | null;
    closedAt?: string | null;
    createdAt: string;
  }[];
}

export interface QueryProgramsParams {
  scope?: ProgramScope;
  subunitId?: string;
  cluster?: ProgramCluster;
  status?: ProgramStatus;
  primaryPicId?: string;
  search?: string;
}
