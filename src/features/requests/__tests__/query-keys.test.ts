import { describe, it, expect } from 'vitest';
import { requestsKeys } from '../api/query-keys';

describe('requestsKeys', () => {
  it('generates consistent hierarchical query keys', () => {
    expect(requestsKeys.all).toEqual(['requests']);
    expect(requestsKeys.lists()).toEqual(['requests', 'list']);
    expect(requestsKeys.list({ direction: 'incoming' })).toEqual([
      'requests',
      'list',
      { direction: 'incoming' },
    ]);
    expect(requestsKeys.details()).toEqual(['requests', 'detail']);
    expect(requestsKeys.detail('req-1')).toEqual(['requests', 'detail', 'req-1']);
    expect(requestsKeys.templates('div-1')).toEqual(['request-templates', 'div-1']);
    expect(requestsKeys.template('tmpl-1')).toEqual(['request-template', 'tmpl-1']);
  });
});
