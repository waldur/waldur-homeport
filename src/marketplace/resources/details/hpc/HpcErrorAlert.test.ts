import { describe, expect, it } from 'vitest';

import { getSignInProvider } from './HpcErrorAlert';

describe('getSignInProvider', () => {
  it('names the provider when signing in again is the remedy', () => {
    expect(
      getSignInProvider({
        detail: 'Your identity provider session has expired.',
        code: 'identity_provider_sign_in_required',
        identity_provider: 'keycloak',
        status: 400,
        response: {},
      }),
    ).toBe('keycloak');
  });

  it('is undefined for other failures', () => {
    expect(
      getSignInProvider({ detail: 'FirecREST request failed.', status: 502 }),
    ).toBeUndefined();
    expect(getSignInProvider(undefined)).toBeUndefined();
  });
});
