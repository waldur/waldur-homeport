import { describe, expect, it } from 'vitest';

import { canWithdrawRequest } from './RequestActions';

describe('withdrawing a request', () => {
  it('is for the requester, while it waits for approval', () => {
    expect(canWithdrawRequest('pending-consumer', true, true)).toBe(true);
    expect(canWithdrawRequest('pending-consumer', false, true)).toBe(false);
    expect(canWithdrawRequest('pending-provider', true, true)).toBe(false);
    expect(canWithdrawRequest('executing', true, true)).toBe(false);
  });

  it('needs the order to be reachable: a member cannot list orders', () => {
    expect(canWithdrawRequest('pending-consumer', true, false)).toBe(false);
  });
});
