import { StateDeclaration } from '@waldur/core/types';

export const states: StateDeclaration[] = [
  {
    name: 'home.login_completed',
    url: '/login_completed/:token/:method/',
    template: '<auth-login-completed></auth-login-completed>',
    data: {
      anonymous: true,
      bodyClass: 'old',
    },
  },

  {
    name: 'home.login_failed',
    url: '/login_failed/',
    template: '<auth-login-failed></auth-login-failed>',
    data: {
      bodyClass: 'old',
      erred: true,
    },
  },

  {
    name: 'home.logout_completed',
    url: '/logout_completed/',
    template: '<auth-logout-completed></auth-logout-completed>',
    data: {
      bodyClass: 'old',
    },
  },

  {
    name: 'home.logout_failed',
    url: '/logout_failed/',
    template: '<auth-logout-failed></auth-logout-failed>',
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
