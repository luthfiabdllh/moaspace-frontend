export const storyKeys = {
  all: ['stories'] as const,
  lists: () => [...storyKeys.all, 'list'] as const,
  list: (params?: Record<string, any>) => [...storyKeys.lists(), params] as const,
  detail: (id: string) => [...storyKeys.all, 'detail', id] as const,
};
