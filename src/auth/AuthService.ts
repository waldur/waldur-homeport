import { apiAuthPassword } from 'waldur-js-client';

import { initApiClient } from '@/core/api';
import { router } from '@/router';
import store from '@/store/store';
import { clearImpersonationData, UsersService } from '@/user/UsersService';
import { setCurrentUser } from '@/workspace/actions';

import {
  RedirectStorage,
  AuthTokenStorage,
  AuthMethodStorage,
} from '../core/StorageManager';

const DEFAULT_REDIRECT_STATE = 'profile.details';

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
    router.globals.params?.toState !== DEFAULT_REDIRECT_STATE &&
    !router.globals.params?.toState.startsWith('error')
  ) {
    RedirectStorage.set({
      toState: router.globals.params.toState,
      toParams: router.globals.params.toParams,
    });
  }
}

export async function redirectOnSuccess() {
  const redirect = RedirectStorage.get();
  let targetState = DEFAULT_REDIRECT_STATE;
  let targetParams = {};
  if (redirect && redirect.toState && redirect.toParams) {
    RedirectStorage.remove();
    if (!targetState.startsWith('error')) {
      targetState = redirect.toState;
      targetParams = redirect.toParams;
    }
  }
  try {
    await router.stateService.go(targetState, targetParams);
  } catch {
    await router.stateService.go(DEFAULT_REDIRECT_STATE);
  }
  document.location.reload();
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
