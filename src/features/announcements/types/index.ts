export type AnnouncementCategory = 'URGENT' | 'MEETING' | 'INFO' | 'ACTIVITY';
export type AnnouncementTarget = 'ALL' | 'DIVISION';

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

export interface Announcement {
  id: string;
  title: string;
  content: Record<string, unknown>;
  category: AnnouncementCategory;
  targetType: AnnouncementTarget;
  targetDivisionId: string | null;
  isPinned: boolean;
  eventStartDate: string | null;
  eventEndDate: string | null;
  location: string | null;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  author: AnnouncementAuthor;
  targetDivision: AnnouncementTargetDivision | null;
}

export interface CreateAnnouncementDTO {
  title: string;
  content: Record<string, unknown>;
  category?: AnnouncementCategory;
  targetType?: AnnouncementTarget;
  targetDivisionId?: string;
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
  search?: string;
}

export interface AnnouncementPermissionsResponse {
  canCreate: boolean;
  isGlobalManager?: boolean;
  coordinatedDivisionIds?: string[];
}
