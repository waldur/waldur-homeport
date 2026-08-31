import { describe, expect, it } from 'vitest';

import { getRequestErrorMessage } from './utils';

const throttled = (retryAfter?: string) => ({
  response: {
    status: 429,
    headers: {
      get: (name: string) => (name === 'Retry-After' ? retryAfter : null),
    },
  },
});

describe('getRequestErrorMessage', () => {
  it('tells the operator to retry when the failure is transient', () => {
    expect(getRequestErrorMessage({ response: { status: 500 } })).toBe(
      'The request failed. Please try again.',
    );
  });

  it('does not advise retrying when the throttle is what refused', () => {
    expect(getRequestErrorMessage(throttled())).toBe(
      'Rate limit reached: these checks are limited to 20 per hour. Try again later.',
    );
  });

  it('names the wait when the server sends Retry-After', () => {
    expect(getRequestErrorMessage(throttled('90'))).toBe(
      'Rate limit reached: these checks are limited to 20 per hour. Try again in 2 minutes.',
    );
  });

  it('survives an error carrying no response at all', () => {
    expect(getRequestErrorMessage(undefined)).toBe(
      'The request failed. Please try again.',
    );
  });
});
