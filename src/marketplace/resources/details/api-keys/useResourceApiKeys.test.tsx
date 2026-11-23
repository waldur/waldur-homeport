import { beforeEach, describe, expect, it, vi } from 'vitest';
import { marketplaceResourceApiKeysReveal } from 'waldur-js-client';

import { renderHookWithProviders } from '@/test/harness';

import { useRevealedApiKey } from './useResourceApiKeys';

describe('useRevealedApiKey', () => {
  beforeEach(() => vi.clearAllMocks());

  it('reveals a key value only on demand', async () => {
    vi.mocked(marketplaceResourceApiKeysReveal).mockResolvedValue({
      data: { uuid: 'k1', api_key: 'sk-secret' },
    } as any);

    const { result } = renderHookWithProviders(() => useRevealedApiKey('k1'));

    expect(vi.mocked(marketplaceResourceApiKeysReveal)).not.toHaveBeenCalled();

    const value = await result.current.reveal();

    expect(value).toBe('sk-secret');
    expect(vi.mocked(marketplaceResourceApiKeysReveal)).toHaveBeenCalledTimes(
      1,
    );
  });
});
