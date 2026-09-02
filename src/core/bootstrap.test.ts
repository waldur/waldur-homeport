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
