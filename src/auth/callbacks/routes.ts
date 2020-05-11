import { StateDeclaration } from '@waldur/core/types';
import { withStore } from '@waldur/store/connect';

import { AuthLoginCompleted } from './AuthLoginCompleted';
import { AuthLoginFailed } from './AuthLoginFailed';
import { AuthLogoutCompleted } from './AuthLogoutCompleted';
import { AuthLogoutFailed } from './AuthLogoutFailed';

export const states: StateDeclaration[] = [
  {
    name: 'home.login_completed',
    url: '/login_completed/:token/:method/',
    component: withStore(AuthLoginCompleted),
    data: {
      anonymous: true,
      bodyClass: 'old',
    },
  },

  {
    name: 'home.login_failed',
    url: '/login_failed/',
    component: withStore(AuthLoginFailed),
    data: {
      bodyClass: 'old',
      erred: true,
    },
  },

  {
    name: 'home.logout_completed',
    url: '/logout_completed/',
    component: withStore(AuthLogoutCompleted),
    data: {
      bodyClass: 'old',
    },
  },

  {
    name: 'home.logout_failed',
    url: '/logout_failed/',
    component: withStore(AuthLogoutFailed),
    data: {
      bodyClass: 'old',
      erred: true,
    },
  },
];

export default function registerRoutes($stateProvider) {
  states.forEach(({ name, ...rest }) => $stateProvider.state(name, rest));
}
registerRoutes.$inject = ['$stateProvider'];
