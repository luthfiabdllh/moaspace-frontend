export type AnnouncementCategory = 'URGENT' | 'MEETING' | 'INFO' | 'ACTIVITY';
export type AnnouncementTarget = 'ALL' | 'DIVISION' | 'SUBUNIT' | 'CLUSTER';
export type AcademicCluster = 'SAINTEK' | 'SOSHUM' | 'MEDIKA' | 'AGRO';

export interface AnnouncementAuthor {
  id: string;
  name: string;
  email: string;
}

export interface AnnouncementTargetDivision {
  id: string;
  name: string;
  slug: string;
}

export interface AnnouncementTargetSubunit {
  id: string;
  name: string;
  slug: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: Record<string, unknown>;
  category: AnnouncementCategory;
  targetType: AnnouncementTarget;
  targetDivisionId: string | null;
  targetSubunitId: string | null;
  targetCluster: AcademicCluster | null;
  isPinned: boolean;
  eventStartDate: string | null;
  eventEndDate: string | null;
  location: string | null;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  author: AnnouncementAuthor;
  targetDivision: AnnouncementTargetDivision | null;
  targetSubunit: AnnouncementTargetSubunit | null;
}

export interface CreateAnnouncementDTO {
  title: string;
  content: Record<string, unknown>;
  category?: AnnouncementCategory;
  targetType?: AnnouncementTarget;
  targetDivisionId?: string;
  targetSubunitId?: string;
  targetCluster?: AcademicCluster;
  isPinned?: boolean;
  eventStartDate?: string;
  eventEndDate?: string;
  location?: string;
  sendEmail?: boolean;
}

export interface UpdateAnnouncementDTO {
  title?: string;
  content?: Record<string, unknown>;
  category?: AnnouncementCategory;
  targetType?: AnnouncementTarget;
  targetDivisionId?: string;
  targetSubunitId?: string;
  targetCluster?: AcademicCluster;
  isPinned?: boolean;
  eventStartDate?: string;
  eventEndDate?: string;
  location?: string;
  sendEmail?: boolean;
}

export interface QueryAnnouncementsParams {
  category?: AnnouncementCategory;
  targetType?: AnnouncementTarget;
  divisionId?: string;
  subunitId?: string;
  cluster?: string;
  search?: string;
}

export interface AnnouncementPermissionsResponse {
  canCreate: boolean;
  isGlobalManager?: boolean;
  coordinatedDivisionIds?: string[];
  coordinatedSubunitIds?: string[];
  isClusterCoordinator?: boolean;
  coordinatedCluster?: string | null;
}
