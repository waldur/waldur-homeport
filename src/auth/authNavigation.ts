import { router } from '@/router';
import store from '@/store/store';
import { clearImpersonationData } from '@/user/UsersService';
import { setCurrentUser } from '@/workspace/actions';

import { RedirectStorage } from '../core/StorageManager';

import { clearAuthTokens } from './AuthService';

/**
 * Homeport-specific adapter over ./AuthService: everything here talks to
 * @uirouter/react and the global Redux store, so it stays in homeport rather
 * than the portable auth core. A future standalone auth app implements its
 * own thin equivalent instead of importing this file.
 */

const DEFAULT_REDIRECT_STATE = 'profile.details';

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
  clearAuthTokens();
}

export function localLogout() {
  clearAuthCache();
  router.stateService.go('login');
}

export function explicitLogout() {
  RedirectStorage.remove();
  localLogout();
}
