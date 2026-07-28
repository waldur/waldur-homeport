import { apiAuthPassword, apiAuthTokenExchange } from 'waldur-js-client';

import { initApiClient } from '@/core/api';
import { UsersService } from '@/user/UsersService';

import { AuthTokenStorage, AuthMethodStorage } from '../core/StorageManager';

/**
 * Pure auth core: token exchange, credential checks, and session bootstrap.
 * Deliberately has no dependency on @/router or @/store/store so it can run
 * in any host app (homeport today, a standalone auth app later). Navigation
 * and app-wide session state live in ./authNavigation, which homeport wires
 * on top of this module.
 */

export async function exchangeToken(code: string) {
  const response = await apiAuthTokenExchange({ body: { code } });
  return response.data.token;
}

export async function loginUser(token: string, method: string) {
  AuthTokenStorage.set(token);
  AuthMethodStorage.set(method);
  initApiClient();
  // UsersService.getCurrentUser() caches the fetched user into the host
  // app's store as a side effect; a host with no store (e.g. a standalone
  // auth app that never calls UsersService) simply won't get that caching.
  await UsersService.getCurrentUser();
}

export function isAuthenticated() {
  return !!AuthTokenStorage.get();
}

export async function signin(username, password) {
  const response = await apiAuthPassword({
    body: {
      username,
      password,
    },
  });
  await loginUser(response.data.token, 'local');
}

export async function signinByToken(token) {
  await loginUser(token, 'local');
}

export function clearAuthTokens() {
  AuthTokenStorage.remove();
  AuthMethodStorage.remove();
}
