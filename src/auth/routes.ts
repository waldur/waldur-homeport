import { lazyComponent } from '@waldur/core/lazyComponent';
import { StateDeclaration } from '@waldur/core/types';

const AnonymousLayout = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "AnonymousLayout" */ '@waldur/navigation/AnonymousLayout'
    ),
  'AnonymousLayout',
);

const AuthLogin = lazyComponent(
  () => import(/* webpackChunkName: "AuthLogin" */ './AuthLogin'),
  'AuthLogin',
);

const AuthActivation = lazyComponent(
  () => import(/* webpackChunkName: "AuthActivation" */ './AuthActivation'),
  'AuthActivation',
);

const AuthInit = lazyComponent(
  () => import(/* webpackChunkName: "AuthInit" */ './AuthInit'),
  'AuthInit',
);

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
  },
];
