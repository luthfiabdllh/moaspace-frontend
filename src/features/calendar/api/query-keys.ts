export const calendarKeys = {
  all: ['calendar'] as const,
  status: () => [...calendarKeys.all, 'status'] as const,
};
