import { describe, expect, it } from 'vitest';

import { formatApiError } from './formatApiError';

// The shape waldur-auth-core's interceptor rejects with: the body's keys
// spread onto a plain object, beside the response envelope.
const apiError = (body: object, status = 400) => ({
  ...body,
  status,
  statusText: 'Bad Request',
  url: '/api/x/',
  response: {},
});

describe('formatApiError', () => {
  it("reads DRF's detail, not [object Object]", () => {
    expect(
      formatApiError(apiError({ detail: 'You do not have permission.' }, 403)),
    ).toBe('You do not have permission.');
  });

  it('names the field of a validation error', () => {
    expect(
      formatApiError(
        apiError({
          non_field_errors: ['Order is already processed.'],
          comment: ['This field is required.'],
        }),
      ),
    ).toBe('Order is already processed. comment: This field is required.');
  });

  it('reads a body under data too', () => {
    expect(formatApiError({ data: { detail: 'Gone.' }, status: 410 })).toBe(
      'Gone.',
    );
  });

  it('falls back to the status without a body', () => {
    expect(formatApiError({ status: 502, statusText: 'Bad Gateway' })).toBe(
      '502 Bad Gateway',
    );
  });

  it('says the server is unreachable on a network error', () => {
    expect(formatApiError({ status: -1 })).toMatch(/Could not reach/);
  });

  it("keeps an Error's own message", () => {
    expect(formatApiError(new Error('boom'))).toBe('boom');
  });
});
