import { lazyComponent } from '@/core/lazyComponent';
import { StateDeclaration } from '@/core/types';

export const states: StateDeclaration[] = [
  {
    name: 'home.login_completed',
    url: '/login_completed/:code/:method/',
    component: lazyComponent(() =>
      import('./AuthLoginCompleted').then((module) => ({
        default: module.AuthLoginCompleted,
      })),
    ),
    data: {
      anonymous: true,
    },
  },

  {
    name: 'home.oauth_login_completed',
    url: '/oauth_login_completed/:provider/',
    component: lazyComponent(() =>
      import('./OauthLoginCompleted').then((module) => ({
        default: module.OauthLoginCompleted,
      })),
    ),
    data: {
      anonymous: true,
    },
  },

  {
    name: 'home.saml2_discovery_completed',
    url: '/saml2_discovery_completed/',
    component: lazyComponent(() =>
      import('./SAML2DiscoveryCompleted').then((module) => ({
        default: module.SAML2DiscoveryCompleted,
      })),
    ),
    data: {
      anonymous: true,
    },
  },

  {
    name: 'home.login_failed',
    url: '/login_failed/',
    component: lazyComponent(() =>
      import('./AuthLoginFailed').then((module) => ({
        default: module.AuthLoginFailed,
      })),
    ),
    data: {
      erred: true,
    },
  },

  {
    name: 'home.logout_completed',
    url: '/logout_completed/',
    component: lazyComponent(() =>
      import('./AuthLogoutCompleted').then((module) => ({
        default: module.AuthLogoutCompleted,
      })),
    ),
  },

  {
    name: 'home.logout_failed',
    url: '/logout_failed/',
    component: lazyComponent(() =>
      import('./AuthLogoutFailed').then((module) => ({
        default: module.AuthLogoutFailed,
      })),
    ),
    data: {
      erred: true,
    },
  },
];
