export const epicKeys = {
  all: ['epics'] as const,
  lists: () => [...epicKeys.all, 'list'] as const,
  list: (params?: object) => [...epicKeys.lists(), params] as const,
  detail: (id: string) => [...epicKeys.all, 'detail', id] as const,
};
