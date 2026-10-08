export const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  list: (params?: object) => [...taskKeys.lists(), params] as const,
  detail: (id: string) => [...taskKeys.all, 'detail', id] as const,
};
