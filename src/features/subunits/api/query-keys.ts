export const subunitKeys = {
  all: ['subunits'] as const,
  lists: () => [...subunitKeys.all, 'list'] as const,
  details: () => [...subunitKeys.all, 'detail'] as const,
  detail: (idOrSlug: string) => [...subunitKeys.details(), idOrSlug] as const,
};
