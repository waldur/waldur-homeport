import { UIView } from '@uirouter/react';

import { StateDeclaration } from '@waldur/core/types';
import { AnonymousLayout } from '@waldur/navigation/AnonymousLayout';
import { withStore } from '@waldur/store/connect';
import { UsersService } from '@waldur/user/UsersService';

import { AuthActivation } from './AuthActivation';
import { AuthInit } from './AuthInit';
import { AuthLogin } from './AuthLogin';

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
    component: UIView,
    abstract: true,
  },

  {
    name: 'initialdata.view',
    url: '',
    component: withStore(AuthInit),
    data: {
      auth: true,
      bodyClass: 'old',
    },
    resolve: {
      currentUser: () => UsersService.getCurrentUser(),
    },
  },
];

export default function registerRoutes($stateProvider) {
  states.forEach(({ name, ...rest }) => $stateProvider.state(name, rest));
}
registerRoutes.$inject = ['$stateProvider'];
