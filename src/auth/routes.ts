import { lazyComponent } from '@waldur/core/lazyComponent';
import { StateDeclaration } from '@waldur/core/types';

const AnonymousLayout = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "AnonymousLayout" */ '@waldur/navigation/AnonymousLayout'
    ),
  'AnonymousLayout',
);

const LandingPage = lazyComponent(
  () => import(/* webpackChunkName: "LandingPage" */ './LandingPage'),
  'LandingPage',
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
    component: LandingPage,
    params: {
      toState: '',
      toParams: {},
    },
    data: {
      anonymous: true,
    },
  },

  {
    name: 'initialdata',
    parent: 'home',
    url: '/initial-data/',
    component: AuthInit,
    data: {
      auth: true,
    },
  },
];
