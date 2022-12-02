import { lazyComponent } from '@waldur/core/lazyComponent';
import { StateDeclaration } from '@waldur/core/types';
// import { Layout } from '@waldur/navigation/Layout';

const Layout = lazyComponent(
  () => import('@waldur/navigation/Layout'),
  'Layout',
);

const LandingPage = lazyComponent(() => import('./LandingPage'), 'LandingPage');

const AuthInit = lazyComponent(() => import('./AuthInit'), 'AuthInit');

export const states: StateDeclaration[] = [
  {
    name: 'home',
    url: '',
    abstract: true,
    component: Layout,
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

  {
    name: 'layout',
    url: '',
    abstract: true,
    component: Layout,
    data: {
      auth: true,
    },
  },
];
