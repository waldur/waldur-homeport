// waldur-js-client is deliberately absent from this package's package.json —
// see the comment on the same import in
// packages/api-client/src/requestHelpers.ts.
import {
  apiAuthPassword,
  apiAuthTokenExchange,
  type AuthTokenChallenge,
} from 'waldur-js-client';

import { initApiClient } from './client';
import { getAuthCoreConfig } from './config';

export async function exchangeToken(code: string) {
  const response = await apiAuthTokenExchange({ body: { code } });
  return response.data.token;
}

export async function loginUser(token: string, method: string) {
  const config = getAuthCoreConfig();
  config.storage.token.set(token);
  config.storage.method.set(method);
  initApiClient();
  // onLogin refreshes the host's cached current user as a side effect; a
  // host with no user store (e.g. a standalone auth app) simply omits it.
  await config.onLogin?.();
}

export function isAuthenticated() {
  return !!getAuthCoreConfig().storage.token.get();
}

/**
 * Outcome of a password sign-in.
 *
 * A correct password is not necessarily a completed login: when the
 * deployment requires a passkey second factor the backend answers 401 with a
 * pending handle and *no token*. That handle names a challenge still to be
 * satisfied — it is not a credential and cannot be used as one.
 */
export type SigninResult =
  | { status: 'authenticated' }
  | { status: 'passkey-required'; ceremony: string };

/**
 * Read a pending passkey challenge out of a 401 body.
 *
 * The backend answers 401 rather than a 200 carrying the handle, so that
 * `token` stays required in the shared response schema and consumers that
 * never enable passkeys see no change. The consequence is that a rejected
 * password and an outstanding second factor share a status code, and only
 * the body tells them apart — hence the explicit `passkey_required` flag
 * rather than inferring it from the presence of a uuid.
 */
const readPasskeyChallenge = (error: any): string | undefined => {
  const body: Partial<AuthTokenChallenge> =
    error?.response?.data ?? error?.data ?? error ?? {};
  return body.passkey_required ? body.pending_passkey_ceremony : undefined;
};

export async function signin(
  username: string,
  password: string,
): Promise<SigninResult> {
  try {
    const response = await apiAuthPassword({
      body: {
        username,
        password,
      },
    });
    await loginUser(response.data.token, 'local');
    return { status: 'authenticated' };
  } catch (error) {
    const ceremony = readPasskeyChallenge(error);
    if (ceremony) {
      return { status: 'passkey-required', ceremony };
    }
    // A genuine rejection — wrong password, lockout, disabled account.
    throw error;
  }
}

export async function signinByToken(token: string) {
  await loginUser(token, 'local');
}

export function clearAuthTokens() {
  const config = getAuthCoreConfig();
  config.storage.token.remove();
  config.storage.method.remove();
}
