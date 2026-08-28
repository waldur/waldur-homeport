import { configureAuthCore } from 'waldur-auth-core';

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
