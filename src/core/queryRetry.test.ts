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

  // While a demo preset loads the API answers 503; the reset overlay polls
  // the load's status instead.
  it('never retries the 503 of a demo reset', () => {
    expect(
      retryServerErrors()(0, { status: 503, demo_reset: true, preset: 'x' }),
    ).toBe(false);
    expect(
      retryServerErrors()(0, { status: 503, data: { demo_reset: true } }),
    ).toBe(false);
    expect(retryServerErrors()(0, { status: 503 })).toBe(true);
  });
});
