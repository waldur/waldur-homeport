import { describe, expect, it, vi } from 'vitest';
import {
  marketplaceProviderOfferingsList,
  proposalProtectedCallsList,
} from 'waldur-js-client';

import { mockListResponse } from '@/test/utils';

import { grantScopeLoaders } from './grantScopeLoaders';

describe('grantScopeLoaders', () => {
  it('asks for shared provider offerings in any state', async () => {
    vi.mocked(marketplaceProviderOfferingsList).mockResolvedValue(
      mockListResponse([]),
    );

    await grantScopeLoaders.offering('', [], { page: 1 });

    const query = vi.mocked(marketplaceProviderOfferingsList).mock.calls[0][0]
      .query;
    expect(query.shared).toBe(true);
    expect(query.state).toBeUndefined();
    expect(query.field).toEqual([
      'uuid',
      'name',
      'customer_uuid',
      'customer_name',
    ]);
  });

  it('uses the protected call list so a draft call can be selected', async () => {
    vi.mocked(proposalProtectedCallsList).mockResolvedValue(
      mockListResponse([]),
    );

    await grantScopeLoaders.call('', [], { page: 1 });

    expect(proposalProtectedCallsList).toHaveBeenCalled();
    expect(
      vi.mocked(proposalProtectedCallsList).mock.calls[0][0].query?.state,
    ).toBeUndefined();
  });
});
