export const capacityKeys = {
  all: ['capacity'] as const,
  me: () => [...capacityKeys.all, 'me'] as const,
  division: (divisionId: string, weekStart?: string) =>
    [...capacityKeys.all, 'division', divisionId, { weekStart }] as const,
};
