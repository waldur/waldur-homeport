import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  proposalProtectedCallsResourcePoolsDestroy,
  proposalProtectedCallsResourcePoolsPartialUpdate,
  proposalProtectedCallsResourcePoolsSet,
} from 'waldur-js-client';

import { savePoolChanges } from './PoolEditDialog';

// A component the call has no rule for yet: each new pool names it by its
// offering and type, and the backend adds the rule with the first one.
const row = {
  offering_component_uuid: null,
  requested_offering_uuid: 'ro-1',
  component_type: 'cpu',
} as any;

const newPool = (round_uuid: string | null) =>
  ({ round_uuid, pool_uuid: null, offered_total: null }) as any;

const deferred = () => {
  let resolve: () => void;
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve: () => resolve() };
};

afterEach(() => {
  vi.clearAllMocks();
});

describe('savePoolChanges', () => {
  it('adds the second pool only once the first has added the rule', async () => {
    const first = deferred();
    vi.mocked(proposalProtectedCallsResourcePoolsSet)
      .mockReturnValueOnce(first.promise as any)
      .mockResolvedValueOnce({} as any);

    const saving = savePoolChanges('call-1', row, [
      { cell: newPool(null), offered_total: 100 },
      { cell: newPool('round-1'), offered_total: 40 },
    ]);
    await Promise.resolve();
    expect(proposalProtectedCallsResourcePoolsSet).toHaveBeenCalledTimes(1);

    first.resolve();
    await saving;
    expect(proposalProtectedCallsResourcePoolsSet).toHaveBeenCalledTimes(2);
    expect(
      vi.mocked(proposalProtectedCallsResourcePoolsSet).mock.calls[1][0],
    ).toEqual({
      path: { uuid: 'call-1' },
      body: {
        requested_offering: 'ro-1',
        component: 'cpu',
        round_uuid: 'round-1',
        offered_total: 40,
      },
    });
  });

  it('stops at the first pool refused', async () => {
    vi.mocked(proposalProtectedCallsResourcePoolsSet).mockRejectedValueOnce(
      new Error('refused'),
    );

    await expect(
      savePoolChanges('call-1', row, [
        { cell: newPool(null), offered_total: 100 },
        { cell: newPool('round-1'), offered_total: 40 },
      ]),
    ).rejects.toThrow('refused');
    expect(proposalProtectedCallsResourcePoolsSet).toHaveBeenCalledTimes(1);
  });

  it('updates and removes existing pools', async () => {
    const existing = (pool_uuid: string) =>
      ({ round_uuid: null, pool_uuid, offered_total: '10' }) as any;
    vi.mocked(
      proposalProtectedCallsResourcePoolsPartialUpdate,
    ).mockResolvedValue({} as any);
    vi.mocked(proposalProtectedCallsResourcePoolsDestroy).mockResolvedValue(
      {} as any,
    );

    await savePoolChanges('call-1', row, [
      { cell: existing('pool-1'), offered_total: 20 },
      { cell: existing('pool-2'), offered_total: null },
    ]);
    expect(
      proposalProtectedCallsResourcePoolsPartialUpdate,
    ).toHaveBeenCalledWith({
      path: { uuid: 'call-1', obj_uuid: 'pool-1' },
      body: { offered_total: 20 },
    });
    expect(proposalProtectedCallsResourcePoolsDestroy).toHaveBeenCalledWith({
      path: { uuid: 'call-1', obj_uuid: 'pool-2' },
    });
  });
});
