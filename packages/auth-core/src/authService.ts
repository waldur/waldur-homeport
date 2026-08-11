// waldur-js-client is deliberately absent from this package's package.json —
// see the comment on the same import in
// packages/api-client/src/requestHelpers.ts.
import { apiAuthPassword, apiAuthTokenExchange } from 'waldur-js-client';

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

export async function signin(username: string, password: string) {
  const response = await apiAuthPassword({
    body: {
      username,
      password,
    },
  });
  await loginUser(response.data.token, 'local');
}

export async function signinByToken(token: string) {
  await loginUser(token, 'local');
}

export function clearAuthTokens() {
  const config = getAuthCoreConfig();
  config.storage.token.remove();
  config.storage.method.remove();
}
