export interface CalendarStatusResponse {
  isConnected: boolean;
  syncEnabled: boolean;
  calendarName: string | null;
  updatedAt: string | null;
}

export interface CalendarAuthUrlResponse {
  url: string;
}

export interface ToggleSyncRequest {
  enabled: boolean;
}
