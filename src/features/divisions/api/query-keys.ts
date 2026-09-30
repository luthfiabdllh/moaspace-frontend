export const divisionKeys = {
  all: ['divisions'] as const,
  lists: () => [...divisionKeys.all, 'list'] as const,
  detail: (id: string) => [...divisionKeys.all, 'detail', id] as const,
};
