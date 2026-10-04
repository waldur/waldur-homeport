import { describe, expect, it } from 'vitest';

import { retryServerErrors } from './queryRetry';

describe('retryServerErrors', () => {
  it('retries server and network errors up to the limit', () => {
    const retry = retryServerErrors(1);
    expect(retry(0, { response: { status: 500 } })).toBe(true);
    expect(retry(1, { response: { status: 500 } })).toBe(false);
    expect(retry(0, new TypeError('Failed to fetch'))).toBe(true);
  });

  it('never retries a 4xx', () => {
    expect(retryServerErrors()(0, { status: 404 })).toBe(false);
    expect(retryServerErrors()(0, { response: { status: 403 } })).toBe(false);
  });
});
