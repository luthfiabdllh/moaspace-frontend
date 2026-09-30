export const requestsKeys = {
  all: ['requests'] as const,
  lists: () => [...requestsKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...requestsKeys.lists(), filters] as const,
  details: () => [...requestsKeys.all, 'detail'] as const,
  detail: (id: string) => [...requestsKeys.details(), id] as const,
  templates: (divisionId: string) => ['request-templates', divisionId] as const,
  template: (id: string) => ['request-template', id] as const,
};
