import { lazyComponent } from '@waldur/core/lazyComponent';
import { StateDeclaration } from '@waldur/core/types';

const AuthLoginCompleted = lazyComponent(
  () =>
    import(/* webpackChunkName: "AuthLoginCompleted" */ './AuthLoginCompleted'),
  'AuthLoginCompleted',
);

const OauthLoginCompleted = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "OauthLoginCompleted" */ './OauthLoginCompleted'
    ),
  'OauthLoginCompleted',
);

const SAML2DiscoveryCompleted = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "SAML2DiscoveryCompleted" */ './SAML2DiscoveryCompleted'
    ),
  'SAML2DiscoveryCompleted',
);

const AuthLoginFailed = lazyComponent(
  () => import(/* webpackChunkName: "AuthLoginFailed" */ './AuthLoginFailed'),
  'AuthLoginFailed',
);

const AuthLogoutCompleted = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "AuthLogoutCompleted" */ './AuthLogoutCompleted'
    ),
  'AuthLogoutCompleted',
);

const AuthLogoutFailed = lazyComponent(
  () => import(/* webpackChunkName: "AuthLogoutFailed" */ './AuthLogoutFailed'),
  'AuthLogoutFailed',
);

export const states: StateDeclaration[] = [
  {
    name: 'home.login_completed',
    url: '/login_completed/:token/:method/',
    component: AuthLoginCompleted,
    data: {
      anonymous: true,
      bodyClass: 'old',
    },
  },

  {
    name: 'home.oauth_login_completed',
    url: '/oauth_login_completed/:provider/',
    component: OauthLoginCompleted,
    data: {
      anonymous: true,
      bodyClass: 'old',
    },
  },

  {
    name: 'home.saml2_discovery_completed',
    url: '/saml2_discovery_completed/',
    component: SAML2DiscoveryCompleted,
    data: {
      anonymous: true,
      bodyClass: 'old',
    },
  },

  {
    name: 'home.login_failed',
    url: '/login_failed/',
    component: AuthLoginFailed,
    data: {
      bodyClass: 'old',
      erred: true,
    },
  },

  {
    name: 'home.logout_completed',
    url: '/logout_completed/',
    component: AuthLogoutCompleted,
    data: {
      bodyClass: 'old',
    },
  },

  {
    name: 'home.logout_failed',
    url: '/logout_failed/',
    component: AuthLogoutFailed,
    data: {
      bodyClass: 'old',
      erred: true,
    },
  },
];
