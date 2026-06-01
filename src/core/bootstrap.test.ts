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
  it('wraps an object-shaped SDK error so the original is preserved on Error.cause', async () => {
    const sdkError = { response: undefined, message: 'underlying failure' };
    vi.mocked(configurationRetrieve).mockRejectedValueOnce(sdkError);

    const { loadConfig } = await import('./bootstrap');

    await expect(loadConfig()).rejects.toMatchObject({
      message: 'Unable to fetch server configuration.',
      cause: sdkError,
    });
  });

  it('keeps the network-failure message for TypeError and carries the cause', async () => {
    const networkError = new TypeError('Failed to fetch');
    vi.mocked(configurationRetrieve).mockRejectedValueOnce(networkError);

    const { loadConfig } = await import('./bootstrap');

    await expect(loadConfig()).rejects.toMatchObject({
      message: expect.stringContaining(
        'Please check if you can connect to http://localhost:8080/',
      ),
      cause: networkError,
    });
  });

  it('keeps the HTTP-status message for response errors and carries the cause', async () => {
    const httpError = { response: { status: 503 }, statusText: 'Bad Gateway' };
    vi.mocked(configurationRetrieve).mockRejectedValueOnce(httpError);

    const { loadConfig } = await import('./bootstrap');

    await expect(loadConfig()).rejects.toMatchObject({
      message: expect.stringContaining('Error message: Bad Gateway'),
      cause: httpError,
    });
  });
});
