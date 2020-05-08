import { StateDeclaration } from '@waldur/core/types';
import { AnonymousLayout } from '@waldur/navigation/AnonymousLayout';
import { withStore } from '@waldur/store/connect';

import { AuthActivation } from './AuthActivation';
import { AuthLogin } from './AuthLogin';

function resolveCurrentUser(usersService) {
  return usersService.getCurrentUser();
}
resolveCurrentUser.$inject = ['usersService'];

export const states: StateDeclaration[] = [
  {
    name: 'home',
    url: '',
    abstract: true,
    component: withStore(AnonymousLayout),
  },

  {
    name: 'login',
    url: '/login/',
    component: withStore(AuthLogin),
    params: {
      toState: '',
      toParams: {},
    },
    data: {
      bodyClass: 'old',
      anonymous: true,
    },
  },

  {
    name: 'register',
    url: '/register/',
    component: withStore(AuthLogin),
    data: {
      bodyClass: 'old',
      anonymous: true,
    },
  },

  {
    name: 'home.activate',
    url: '/activate/:user_uuid/:token/',
    component: withStore(AuthActivation),
    data: {
      anonymous: true,
      bodyClass: 'old',
    },
  },

  {
    name: 'initialdata',
    parent: 'home',
    url: '/initial-data/',
    template: '<ui-view></ui-view>',
    abstract: true,
  },

  {
    name: 'initialdata.view',
    url: '',
    template: '<auth-init></auth-init>',
    data: {
      auth: true,
      bodyClass: 'old',
    },
    resolve: {
      currentUser: resolveCurrentUser,
    },
  },
];

export default function registerRoutes($stateProvider) {
  states.forEach(({ name, ...rest }) => $stateProvider.state(name, rest));
}
registerRoutes.$inject = ['$stateProvider'];
