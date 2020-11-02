import { StateDeclaration } from '@waldur/core/types';

import { AuthLoginCompleted } from './AuthLoginCompleted';
import { AuthLoginFailed } from './AuthLoginFailed';
import { AuthLogoutCompleted } from './AuthLogoutCompleted';
import { AuthLogoutFailed } from './AuthLogoutFailed';
import { OauthLoginCompleted } from './OauthLoginCompleted';

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
