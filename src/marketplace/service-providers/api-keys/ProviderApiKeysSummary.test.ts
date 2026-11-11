import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  marketplaceResourceApiKeysCount,
  marketplaceResourceApiKeysUsageTotalsRetrieve,
} from 'waldur-js-client';

import { fetchApiKeysSummary } from './ProviderApiKeysSummary';

const counted = (count: number) =>
  ({
    response: { headers: new Headers({ 'x-result-count': String(count) }) },
  }) as any;

describe('fetchApiKeysSummary', () => {
  const signal = new AbortController().signal;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(marketplaceResourceApiKeysCount).mockImplementation(
      ({ query }: any) => {
        if (query.paused_by_limit) return Promise.resolve(counted(2));
        if (query.state?.[0] === 'Erred') return Promise.resolve(counted(1));
        return Promise.resolve(counted(9));
      },
    );
    vi.mocked(marketplaceResourceApiKeysUsageTotalsRetrieve).mockResolvedValue({
      data: { usages: {}, estimated_cost: '12.50' },
    } as any);
  });

  it('counts the keys the list filter matches', async () => {
    const summary = await fetchApiKeysSummary(
      { provider_uuid: 'provider' },
      signal,
    );
    expect(summary).toEqual({
      keys: 9,
      pausedByLimit: 2,
      erred: 1,
      estimatedCost: '12.50',
    });
    expect(marketplaceResourceApiKeysUsageTotalsRetrieve).toHaveBeenCalledWith({
      query: { provider_uuid: 'provider' },
      signal,
    });
    expect(marketplaceResourceApiKeysCount).toHaveBeenCalledWith({
      query: { provider_uuid: 'provider', state: ['Erred'] },
      signal,
    });
  });

  it('asks for no figure the filter already rules out', async () => {
    const summary = await fetchApiKeysSummary(
      { provider_uuid: 'provider', state: ['OK'], paused_by_limit: false },
      signal,
    );
    expect(summary.erred).toBe(0);
    expect(summary.pausedByLimit).toBe(0);
    expect(marketplaceResourceApiKeysCount).toHaveBeenCalledTimes(1);
  });
});
