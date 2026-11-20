import { describe, expect, it } from 'vitest';

import { emptyIfNotFound } from './emptyIfNotFound';

const apiError = (status: number) => ({ response: { status }, status });

describe('emptyIfNotFound', () => {
  it('reads a 404 as nothing reported', async () => {
    await expect(
      Promise.reject(apiError(404)).catch(emptyIfNotFound([])),
    ).resolves.toEqual([]);
  });

  it('reads the status the SDK puts on the error itself', async () => {
    await expect(
      Promise.reject({ status: 404 }).catch(emptyIfNotFound([])),
    ).resolves.toEqual([]);
  });

  it('lets any other failure through', async () => {
    const error = apiError(500);

    await expect(Promise.reject(error).catch(emptyIfNotFound([]))).rejects.toBe(
      error,
    );
  });
});
