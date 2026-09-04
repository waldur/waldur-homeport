import { User } from 'waldur-js-client';

import { router } from '@/router';
import store from '@/store/store';
import { rememberBlockedNavigation } from '@/user/blockedNavigation';
import { needsPasskeyEnrollment } from '@/user/passkeys/enforcement';
import { clearImpersonationData, isUserValid } from '@/user/UsersService';
import { getUser } from '@/workspace/selectors';

import {
  AuthTokenExpiryStorage,
  RedirectStorage,
} from '../core/StorageManager';

import { clearAuthTokens } from './AuthService';
import { resetSessionState } from './sessionReset';

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

interface NavigationTarget {
  toState: string;
  toParams: object;
}

/**
 * Where a freshly logged-in user should land. Mirrors the profile-validity
 * guard in transitions.ts, but runs *before* navigating so the gate page is
 * reached in one hop instead of via a rejected transition. The intended page
 * is remembered the same way the guard remembers it, so the gate resumes it.
 */
export function resolvePostLoginTarget(
  user: User | undefined,
  intended: NavigationTarget,
): NavigationTarget {
  if (!user) {
    return intended;
  }
  if (needsPasskeyEnrollment(user)) {
    rememberBlockedNavigation(intended.toState, intended.toParams);
    return { toState: 'profile-passkeys-required', toParams: {} };
  }
  if (!isUserValid(user)) {
    rememberBlockedNavigation(intended.toState, intended.toParams);
    return { toState: 'profile-manage', toParams: {} };
  }
  return intended;
}

// The login and callback URLs are replaced rather than pushed, so "back"
// never returns to a spent OAuth code or an empty sign-in form.
const REPLACE_LOCATION = { location: 'replace' as const };

/**
 * Navigates to the page the user wanted before logging in (or the default
 * one). Session state was already reset and the user refreshed by the login
 * hook (see core/authCoreSetup.ts), so no document reload is needed.
 */
export async function redirectOnSuccess() {
  const redirect = RedirectStorage.get();
  let intended: NavigationTarget = {
    toState: DEFAULT_REDIRECT_STATE,
    toParams: {},
  };
  if (redirect && redirect.toState && redirect.toParams) {
    RedirectStorage.remove();
    if (!redirect.toState.startsWith('error')) {
      intended = { toState: redirect.toState, toParams: redirect.toParams };
    }
  }
  const target = resolvePostLoginTarget(getUser(store.getState()), intended);
  try {
    await router.stateService.go(
      target.toState,
      target.toParams,
      REPLACE_LOCATION,
    );
  } catch {
    await router.stateService.go(DEFAULT_REDIRECT_STATE, {}, REPLACE_LOCATION);
  }
}

export function clearAuthCache() {
  resetSessionState({ queries: false });
  clearImpersonationData();
  clearAuthTokens();
  // Belongs to the token that has just been dropped; leaving it behind would
  // describe the next account's session.
  AuthTokenExpiryStorage.remove();
}

export function localLogout() {
  clearAuthCache();
  router.stateService.go('login');
}

export function explicitLogout() {
  RedirectStorage.remove();
  localLogout();
}
