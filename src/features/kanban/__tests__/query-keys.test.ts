import { describe, it, expect } from 'vitest';
import { kanbanKeys } from '../api/query-keys';

describe('kanbanKeys', () => {
  it('generates the base all key', () => {
    expect(kanbanKeys.all).toEqual(['kanban']);
  });

  it('generates the boards key', () => {
    expect(kanbanKeys.boards()).toEqual(['kanban', 'board']);
  });

  it('generates the board key with params', () => {
    const params = { priority: 'HIGH' };
    expect(kanbanKeys.board('div-1', params)).toEqual(['kanban', 'board', 'div-1', params]);
  });

  it('generates the me tasks key', () => {
    expect(kanbanKeys.me()).toEqual(['kanban', 'me']);
  });
});
