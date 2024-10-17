import { lazyComponent } from '@waldur/core/lazyComponent';
import { StateDeclaration } from '@waldur/core/types';

const AuthLoginCompleted = lazyComponent(
  () => import('./AuthLoginCompleted'),
  'AuthLoginCompleted',
);

const OauthLoginCompleted = lazyComponent(
  () => import('./OauthLoginCompleted'),
  'OauthLoginCompleted',
);

const SAML2DiscoveryCompleted = lazyComponent(
  () => import('./SAML2DiscoveryCompleted'),
  'SAML2DiscoveryCompleted',
);

const AuthLoginFailed = lazyComponent(
  () => import('./AuthLoginFailed'),
  'AuthLoginFailed',
);

const AuthLogoutCompleted = lazyComponent(
  () => import('./AuthLogoutCompleted'),
  'AuthLogoutCompleted',
);

const AuthLogoutFailed = lazyComponent(
  () => import('./AuthLogoutFailed'),
  'AuthLogoutFailed',
);

export const states: StateDeclaration[] = [
  {
    name: 'home.login_completed',
    url: '/login_completed/:token/:method/',
    component: AuthLoginCompleted,
    data: {
      anonymous: true,
    },
  },

  {
    name: 'home.oauth_login_completed',
    url: '/oauth_login_completed/:provider/',
    component: OauthLoginCompleted,
    data: {
      anonymous: true,
    },
  },

  {
    name: 'home.saml2_discovery_completed',
    url: '/saml2_discovery_completed/',
    component: SAML2DiscoveryCompleted,
    data: {
      anonymous: true,
    },
  },

  {
    name: 'home.login_failed',
    url: '/login_failed/',
    component: AuthLoginFailed,
    data: {
      erred: true,
    },
  },

  {
    name: 'home.logout_completed',
    url: '/logout_completed/',
    component: AuthLogoutCompleted,
  },

  {
    name: 'home.logout_failed',
    url: '/logout_failed/',
    component: AuthLogoutFailed,
    data: {
      erred: true,
    },
  },
];
