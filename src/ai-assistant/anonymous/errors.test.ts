import { describe, it, expect } from 'vitest';

import { isAnonymousSessionExpired, mapAnonymousChatError } from './errors';

describe('mapAnonymousChatError', () => {
  it('maps 503 to an at-capacity message', () => {
    expect(mapAnonymousChatError({ status: 503 })).toMatch(/capacity/i);
  });
  it('reads the status off the SDK response shape ({ response: { status } })', () => {
    // This is the actual shape streamAnonymousChat propagates from the SDK.
    expect(
      mapAnonymousChatError({
        detail: 'per_ip_monthly_token',
        response: { status: 409 },
      }),
    ).toMatch(/usage limit/i);
  });
  it('maps 429 to a busy message', () => {
    expect(mapAnonymousChatError({ status: 429 })).toMatch(/try again/i);
  });
  it('maps 403 to a new-conversation message', () => {
    expect(mapAnonymousChatError({ status: 403 })).toMatch(/new conversation/i);
  });
  it('surfaces the backend detail for 403 (e.g. temporary block) over the generic fallback', () => {
    expect(
      mapAnonymousChatError({
        detail:
          'Your access to the anonymous marketplace assistant is temporarily blocked.',
        response: { status: 403 },
      }),
    ).toMatch(/temporarily blocked/i);
  });
  it('ignores non-message 403 detail shapes (arrays/codes) and uses the fallback', () => {
    expect(
      mapAnonymousChatError({ detail: ['x'], response: { status: 403 } }),
    ).toMatch(/new conversation/i);
  });
  it('shows the friendly connect message for a network error, not the raw Error.message', () => {
    // fetch rejects with a TypeError on a network failure — surface the curated
    // copy rather than a raw 'Failed to fetch' / 'Load failed'.
    const message = mapAnonymousChatError(new TypeError('Failed to fetch'));
    expect(message).toMatch(/Failed to connect/i);
    expect(message).not.toMatch(/Failed to fetch/i);
  });
  it('never surfaces "[object Object]" for an unmapped status with an object detail', () => {
    const message = mapAnonymousChatError({
      detail: { input: ['bad'] },
      response: { status: 500 },
    });
    expect(message).not.toContain('[object Object]');
    expect(message).toMatch(/Failed to connect/i);
  });
});

describe('isAnonymousSessionExpired', () => {
  it('is true for a bare 403', () => {
    expect(isAnonymousSessionExpired({ response: { status: 403 } })).toBe(true);
  });
  it('is true for the session-binding 403 even though it carries a detail', () => {
    // The backend raises this with a localized sentence and no machine code; a
    // fresh session id is exactly the recovery, so we must still reset.
    expect(
      isAnonymousSessionExpired({
        detail:
          'Session is bound to a different network. Please start a new conversation.',
        response: { status: 403 },
      }),
    ).toBe(true);
  });
  it('is false for non-403 statuses', () => {
    expect(isAnonymousSessionExpired({ status: 409 })).toBe(false);
  });
});
