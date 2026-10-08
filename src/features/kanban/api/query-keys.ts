export const kanbanKeys = {
  all: ['kanban'] as const,
  boards: () => [...kanbanKeys.all, 'board'] as const,
  board: (divisionId: string, params?: object) =>
    [...kanbanKeys.boards(), divisionId, params] as const,
  me: () => [...kanbanKeys.all, 'me'] as const,
};
