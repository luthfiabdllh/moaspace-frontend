export const userKeys = {
  all: ['users'] as const,
  list: () => [...userKeys.all, 'list'] as const,
  detail: (id: string) => [...userKeys.all, 'detail', id] as const,
  activityLogs: (entityType?: string, entityId?: string) =>
    ['activity-logs', entityType, entityId] as const,
  activityLogsInfinite: (params?: Record<string, any>) =>
    ['activity-logs', 'infinite', params] as const,
};

export const divisionKeys = {
  all: ['divisions'] as const,
};
