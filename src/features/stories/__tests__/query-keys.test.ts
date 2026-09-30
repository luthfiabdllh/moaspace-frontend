import { describe, it, expect } from 'vitest';
import { storyKeys } from '../api/query-keys';

describe('storyKeys', () => {
  it('generates the base all key', () => {
    expect(storyKeys.all).toEqual(['stories']);
  });

  it('generates the lists key', () => {
    expect(storyKeys.lists()).toEqual(['stories', 'list']);
  });

  it('generates the list key with params', () => {
    const params = { divisionId: 'div-1', isClosed: false };
    expect(storyKeys.list(params)).toEqual(['stories', 'list', params]);
  });

  it('generates the detail key', () => {
    expect(storyKeys.detail('story-123')).toEqual(['stories', 'detail', 'story-123']);
  });
});
