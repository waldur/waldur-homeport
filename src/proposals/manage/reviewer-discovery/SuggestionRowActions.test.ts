import { describe, expect, it } from 'vitest';

import { isOpenSuggestion } from './SuggestionRowActions';

const row = (status: string, pool_invitation_status: string | null) =>
  ({ status, pool_invitation_status }) as any;

describe('isOpenSuggestion', () => {
  it('leaves a pending suggestion to decide', () => {
    expect(isOpenSuggestion(row('pending', null))).toBe(true);
  });

  it.each(['accepted', 'pending', 'declined', 'expired'])(
    'has nothing to decide once its reviewer is in the pool (%s)',
    (pool) => {
      expect(isOpenSuggestion(row('pending', pool))).toBe(false);
    },
  );

  it('has nothing to decide once decided', () => {
    expect(isOpenSuggestion(row('rejected', null))).toBe(false);
    expect(isOpenSuggestion(row('invited', 'accepted'))).toBe(false);
  });
});
