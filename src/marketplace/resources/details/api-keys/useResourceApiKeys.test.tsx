import { beforeEach, describe, expect, it, vi } from 'vitest';
import { marketplaceResourceApiKeysRevealRetrieve } from 'waldur-js-client';

import { renderHookWithProviders } from '@/test/harness';

import { useRevealedApiKey } from './useResourceApiKeys';

describe('useRevealedApiKey', () => {
  beforeEach(() => vi.clearAllMocks());

  it('reveals a key value only on demand', async () => {
    vi.mocked(marketplaceResourceApiKeysRevealRetrieve).mockResolvedValue({
      data: { uuid: 'k1', api_key: 'sk-secret' },
    } as any);

    const { result } = renderHookWithProviders(() => useRevealedApiKey('k1'));

    expect(
      vi.mocked(marketplaceResourceApiKeysRevealRetrieve),
    ).not.toHaveBeenCalled();

    const value = await result.current.reveal();

    expect(value).toBe('sk-secret');
    expect(
      vi.mocked(marketplaceResourceApiKeysRevealRetrieve),
    ).toHaveBeenCalledTimes(1);
  });
});
