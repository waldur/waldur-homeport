import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { FC, PropsWithChildren } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { marketplaceResourceApiKeysRevealRetrieve } from 'waldur-js-client';

import { useRevealedApiKey } from './useResourceApiKeys';

const wrapper = (): FC<PropsWithChildren> => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
};

describe('useRevealedApiKey', () => {
  beforeEach(() => vi.clearAllMocks());

  it('reveals a key value only on demand', async () => {
    vi.mocked(marketplaceResourceApiKeysRevealRetrieve).mockResolvedValue({
      data: { uuid: 'k1', api_key: 'sk-secret' },
    } as any);

    const { result } = renderHook(() => useRevealedApiKey('k1'), {
      wrapper: wrapper(),
    });

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
