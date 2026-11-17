import {
  focusManager,
  onlineManager,
  QueryClient,
  QueryClientProvider,
  useSuspenseQuery,
} from '@tanstack/react-query';
import { act, render, waitFor } from '@testing-library/react';
import { Suspense } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { configurationRetrieve } from 'waldur-js-client';

const afterBootstrap = vi.fn();

vi.mock('@/afterBootstrap', () => ({
  afterBootstrap: () => afterBootstrap(),
}));
vi.mock('./api', () => ({
  initApiClient: vi.fn(),
}));

beforeEach(() => {
  vi.mocked(configurationRetrieve).mockReset();
  afterBootstrap.mockReset();
  document.head.innerHTML =
    '<meta name="api-url" content="http://localhost:8080/">';
});

describe('loadConfig — error wrapping', () => {
  // Full branch coverage of the error-classification logic itself lives in
  // packages/runtime-config/src/configError.test.ts; this just checks the
  // wiring — that a fetch failure actually propagates through loadConfig()
  // with its cause preserved.
  it('wraps an object-shaped SDK error so the original is preserved on Error.cause', async () => {
    const sdkError = { response: undefined, message: 'underlying failure' };
    vi.mocked(configurationRetrieve).mockRejectedValueOnce(sdkError);

    const { loadConfig } = await import('./bootstrap');

    await expect(loadConfig()).rejects.toMatchObject({
      message:
        'Unable to fetch server configuration from http://localhost:8080/.',
      cause: sdkError,
    });
  });

  it('keeps the network-failure message for TypeError and carries the cause', async () => {
    const networkError = new TypeError('Failed to fetch');
    vi.mocked(configurationRetrieve).mockRejectedValueOnce(networkError);

    const { loadConfig } = await import('./bootstrap');

    await expect(loadConfig()).rejects.toMatchObject({
      message: expect.stringContaining(
        'The request did not complete. Please check that you can open ' +
          'http://localhost:8080/ directly in this browser',
      ),
      cause: networkError,
    });
  });
});

describe('bootstrapQueryOptions', () => {
  it('loads once per page load, however often the window regains focus', async () => {
    const { bootstrapQueryOptions } = await import('./bootstrap');
    const loadConfig = vi.fn(() => Promise.resolve(true));
    const client = new QueryClient();
    const Bootstrap = () => {
      useSuspenseQuery({ ...bootstrapQueryOptions, queryFn: loadConfig });
      return null;
    };
    render(
      <QueryClientProvider client={client}>
        <Suspense fallback={null}>
          <Bootstrap />
        </Suspense>
      </QueryClientProvider>,
    );
    await waitFor(() => expect(loadConfig).toHaveBeenCalledTimes(1));

    // React Query treats a suspense query as stale after a second; refocus
    // and reconnect past that point.
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      for (let i = 0; i < 3; i++) {
        await act(async () => {
          vi.advanceTimersByTime(1500);
          focusManager.setFocused(false);
          focusManager.setFocused(true);
          onlineManager.setOnline(false);
          onlineManager.setOnline(true);
          await vi.runOnlyPendingTimersAsync();
        });
      }
    } finally {
      vi.useRealTimers();
      focusManager.setFocused(undefined);
    }

    expect(loadConfig).toHaveBeenCalledTimes(1);
    client.clear();
  });
});
