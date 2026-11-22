import { User } from 'waldur-js-client';

import { forgetDrawerSession } from '@/drawer/drawerSession';
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
import { DEFAULT_REDIRECT_STATE, getLandingState } from './landingState';
import { resetSessionState } from './sessionReset';
import { getOauthURL } from './utils';

/**
 * Homeport-specific adapter over ./AuthService: everything here talks to
 * @uirouter/react and the global Redux store, so it stays in homeport rather
 * than the portable auth core. A future standalone auth app implements its
 * own thin equivalent instead of importing this file.
 */

// Pages a fresh login is routed through before it resumes the intended one
const PASSKEY_GATE_STATE = 'profile-passkeys-required';
const PROFILE_GATE_STATE = 'profile-manage';

/**
 * Whether `stateName` is a step of signing in rather than a page the user
 * chose: the login form, the SSO callbacks under `home.`, and the gates
 * resolvePostLoginTarget sends a fresh login through.
 */
export const isSignInStep = (stateName: string) =>
  stateName === 'login' ||
  stateName.startsWith('home.') ||
  stateName === PASSKEY_GATE_STATE ||
  stateName === PROFILE_GATE_STATE;

/**
 * A plain copy of the pending toParams that JSON.stringify can always take.
 * router.globals.params is a StateParams that ui-router rewrites in place on
 * every transition, so a caller that passed it to go('login') as toParams
 * leaves it pointing at itself; its own values are the login page's by then,
 * so nothing of the intended page is left to keep.
 */
const toPlainParams = (toParams: object | undefined): object => {
  if (!toParams || toParams === router.globals.params) {
    return {};
  }
  return Object.fromEntries(
    Object.entries(toParams).filter(([, value]) => value !== toParams),
  );
};

export function storeRedirect() {
  if (
    router.globals.params?.toState &&
    router.globals.params?.toState !== DEFAULT_REDIRECT_STATE &&
    !router.globals.params?.toState.startsWith('error')
  ) {
    RedirectStorage.set({
      toState: router.globals.params.toState,
      toParams: toPlainParams(router.globals.params.toParams),
    });
  }
}

/**
 * Sign in again through an OIDC provider and come back to the current page.
 * For a signed-in user whose identity provider token is no longer usable
 * (e.g. HPC services after the provider's session ended): the login callback
 * resumes the page from RedirectStorage, as it does after any login.
 */
export function signInAgainHere(provider: string) {
  const current = router.globals.current;
  if (current?.name && !isSignInStep(current.name)) {
    RedirectStorage.set({
      toState: current.name,
      toParams: toPlainParams({ ...router.globals.params }),
    });
  }
  window.location.assign(getOauthURL({ provider }));
}

// Where an app outside the portal's router asked to return after sign-in
// (a micro-app sends `/login/?next=<its page>`). Kept for the tab, so it
// survives a round trip through an identity provider.
const RETURN_URL_KEY = 'waldur/auth/next';

/**
 * `value` as an address to return to after sign-in, or undefined. Only this
 * origin's pages qualify, and not the sign-in or sign-out pages themselves:
 * anything else would let a link send people off-site after they log in.
 */
export function safeReturnUrl(
  value: string | null | undefined,
  origin = window.location.origin,
): string | undefined {
  if (!value) return undefined;
  let url: URL;
  try {
    url = new URL(value, origin);
  } catch {
    return undefined;
  }
  if (url.origin !== origin) return undefined;
  if (/^\/(login|logout)(\/|$)/.test(url.pathname)) return undefined;
  return url.href;
}

/** Remember the sign-in page's `?next=`, when it is one of this origin's. */
export function rememberReturnUrl(search = window.location.search) {
  const next = safeReturnUrl(new URLSearchParams(search).get('next'));
  if (next) {
    window.sessionStorage.setItem(RETURN_URL_KEY, next);
  }
}

const takeReturnUrl = () => {
  const next = safeReturnUrl(window.sessionStorage.getItem(RETURN_URL_KEY));
  window.sessionStorage.removeItem(RETURN_URL_KEY);
  return next;
};

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
    return { toState: PASSKEY_GATE_STATE, toParams: {} };
  }
  if (!isUserValid(user)) {
    rememberBlockedNavigation(intended.toState, intended.toParams);
    return { toState: PROFILE_GATE_STATE, toParams: {} };
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
  const returnUrl = takeReturnUrl();
  const redirect = RedirectStorage.get();
  let intended: NavigationTarget = {
    toState: getLandingState(),
    toParams: {},
  };
  if (redirect && redirect.toState && redirect.toParams) {
    RedirectStorage.remove();
    if (!redirect.toState.startsWith('error')) {
      intended = { toState: redirect.toState, toParams: redirect.toParams };
    }
  }
  const target = resolvePostLoginTarget(getUser(store.getState()), intended);
  // A page outside the portal (a micro-app) asked to come back, and no gate
  // stands in the way: leave the portal for it.
  if (returnUrl && target === intended) {
    RedirectStorage.remove();
    window.location.replace(returnUrl);
    return;
  }
  try {
    await router.stateService.go(
      target.toState,
      target.toParams,
      REPLACE_LOCATION,
    );
  } catch {
    await router.stateService.go(getLandingState(), {}, REPLACE_LOCATION);
  }
}

export function clearAuthCache() {
  // The chat drawer and what a reload would restore of it belong to the
  // session that is ending.
  forgetDrawerSession();
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
