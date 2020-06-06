import { StateDeclaration } from '@waldur/core/types';
import { AnonymousLayout } from '@waldur/navigation/AnonymousLayout';
import { UsersService } from '@waldur/user/UsersService';

import { AuthActivation } from './AuthActivation';
import { AuthInit } from './AuthInit';
import { AuthLogin } from './AuthLogin';

export const states: StateDeclaration[] = [
  {
    name: 'home',
    url: '',
    abstract: true,
    component: AnonymousLayout,
  },

  {
    name: 'login',
    url: '/login/',
    component: AuthLogin,
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
    component: AuthLogin,
    data: {
      bodyClass: 'old',
      anonymous: true,
    },
  },

  {
    name: 'home.activate',
    url: '/activate/:user_uuid/:token/',
    component: AuthActivation,
    data: {
      anonymous: true,
      bodyClass: 'old',
    },
  },

  {
    name: 'initialdata',
    parent: 'home',
    url: '/initial-data/',
    component: AuthInit,
    data: {
      auth: true,
      bodyClass: 'old',
    },
    resolve: {
      currentUser: () => UsersService.getCurrentUser(),
    },
  },
];
