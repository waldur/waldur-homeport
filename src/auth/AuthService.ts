import { apiAuthPassword } from 'waldur-js-client';

import { initApiClient } from '@waldur/core/api';
import { router } from '@waldur/router';
import store from '@waldur/store/store';
import {
  clearImpersonationData,
  UsersService,
} from '@waldur/user/UsersService';
import { setCurrentUser } from '@waldur/workspace/actions';

import {
  RedirectStorage,
  AuthTokenStorage,
  AuthMethodStorage,
} from '../core/StorageManager';

export async function loginUser(token: string, method: string) {
  AuthTokenStorage.set(token);
  AuthMethodStorage.set(method);
  initApiClient();
  const user = await UsersService.getCurrentUser();
  store.dispatch(setCurrentUser(user));
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

export function storeRedirect() {
  if (
    router.globals.params?.toState &&
    router.globals.params?.toState !== 'profile.details'
  ) {
    RedirectStorage.set({
      toState: router.globals.params.toState,
      toParams: router.globals.params.toParams,
    });
  }
}

export function redirectOnSuccess() {
  const redirect = RedirectStorage.get();
  if (redirect) {
    RedirectStorage.remove();
    // If redirect is not possible, go to default state
    const href = router.stateService.href(redirect.toState, redirect.toParams);
    if (!href) {
      return router.stateService.go('profile.details', { reload: true });
    }
    // TODO: Use router.stateService.go(redirect.toState, redirect.toParams) instead
    document.location = href;
  } else {
    return router.stateService.go('profile.details', { reload: true });
  }
}

export function clearAuthCache() {
  store.dispatch(setCurrentUser(undefined));
  clearImpersonationData();
  AuthTokenStorage.remove();
  AuthMethodStorage.remove();
}

export function localLogout() {
  clearAuthCache();
  router.stateService.go('login');
}
