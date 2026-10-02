import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  marketplaceProviderResourcesDetailsRetrieve,
  marketplaceProviderResourcesOfferingRetrieve,
  marketplaceResourcesDetailsRetrieve,
  marketplaceResourcesOfferingRetrieve,
} from 'waldur-js-client';

import { fetchProviderData, getProviderResourceTabs } from './fetchData';

const offering = { uuid: 'offering-uuid', components: [], plans: [] };

describe('fetchProviderData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(marketplaceProviderResourcesOfferingRetrieve).mockResolvedValue({
      data: offering,
    } as any);
    vi.mocked(marketplaceProviderResourcesDetailsRetrieve).mockResolvedValue({
      data: { uuid: 'scope-uuid' },
    } as any);
  });

  it('reads the offering and the scope through the provider endpoints', async () => {
    const result = await fetchProviderData({
      uuid: 'resource-uuid',
      scope: 'https://example.com/api/scope/',
    } as any);

    expect(marketplaceProviderResourcesDetailsRetrieve).toHaveBeenCalledWith({
      path: { uuid: 'resource-uuid' },
    });
    expect(marketplaceProviderResourcesOfferingRetrieve).toHaveBeenCalledWith({
      path: { uuid: 'resource-uuid' },
    });
    expect(marketplaceResourcesDetailsRetrieve).not.toHaveBeenCalled();
    expect(marketplaceResourcesOfferingRetrieve).not.toHaveBeenCalled();
    expect(result.offering).toBe(offering);
    expect(result.scope).toEqual({ uuid: 'scope-uuid' });
  });

  it('does not ask for a scope the resource does not have', async () => {
    const result = await fetchProviderData({ uuid: 'resource-uuid' } as any);

    expect(marketplaceProviderResourcesDetailsRetrieve).not.toHaveBeenCalled();
    expect(result.scope).toBeUndefined();
  });
});

describe('getProviderResourceTabs', () => {
  const keys = (resource) =>
    getProviderResourceTabs({ resource }).map((tab) => tab.key);

  it('offers only tabs readable by provider-side roles', () => {
    expect(keys({ uuid: 'resource-uuid' })).toEqual([
      'resource-details',
      'order-history',
    ]);
  });

  it('adds the report when the resource has one', () => {
    expect(
      keys({ uuid: 'resource-uuid', report: [{ header: 'h', body: 'b' }] }),
    ).toContain('report');
  });
});
