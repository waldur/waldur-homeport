import { configureAuthCore, isAuthenticated } from 'waldur-auth-core';

import { localLogout } from '@/auth/authNavigation';
import { resetSessionState } from '@/auth/sessionReset';
import { router } from '@/router';
import { UsersService } from '@/user/UsersService';

import { ENV } from './config';
import {
  AuthTokenStorage,
  AuthMethodStorage,
  ImpersonationStorage,
  LanguageStorage,
  RedirectStorage,
} from './StorageManager';
import { cleanObject } from './utils';

/**
 * Wires waldur-auth-core to this app's router/storage/store. Must run once,
 * before the first API request goes out — loadPublicConfig() calls this as
 * its first step, ahead of initApiClient().
 */
export function setupAuthCore() {
  configureAuthCore({
    storage: {
      token: AuthTokenStorage,
      method: AuthMethodStorage,
      impersonation: ImpersonationStorage,
      language: LanguageStorage,
    },
    getApiEndpoint: () => ENV.apiEndpoint,
    isConfigLoaded: () => !!ENV.plugins,
    isOidcAccessTokenEnabled: () =>
      !!ENV.plugins?.WALDUR_CORE?.OIDC_ACCESS_TOKEN_ENABLED,
    onSessionExpired: () => {
      // /users/me/ and /roles/ are requested together, so one expired token
      // answers with two 401s. Once the first has dropped the token and is on
      // its way to the login page, the second has nothing left to do — and
      // running it anyway would overwrite the remembered destination with
      // the login page's own params.
      const pending = router.globals.transition;
      const headingToLogin = pending
        ? pending.to().name === 'login'
        : router.globals.$current.name === 'login';
      if (!isAuthenticated() && headingToLogin) {
        return;
      }
      if (router.globals.transition) {
        const target = router.globals.transition.targetState();
        RedirectStorage.set({
          toState: target.name(),
          toParams: target.params(),
        });
      } else if (router.globals.$current.name === 'login') {
        RedirectStorage.set(router.globals.params as any);
      } else if (router.globals.$current.name) {
        RedirectStorage.set({
          toState: router.globals.$current.name,
          toParams: router.globals.params
            ? cleanObject(router.globals.params)
            : undefined,
        });
      }
      localLogout();
    },
    // Start every session from a clean slate, then load the *new* user — the
    // cached getCurrentUser() would hand back whoever was signed in before.
    onLogin: async () => {
      resetSessionState();
      await UsersService.refreshCurrentUser();
    },
  });
}
