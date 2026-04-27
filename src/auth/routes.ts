import { lazyComponent } from '@/core/lazyComponent';
import { StateDeclaration } from '@/core/types';

export const states: StateDeclaration[] = [
  {
    name: 'home',
    url: '',
    abstract: true,
    component: lazyComponent(() =>
      import('@/navigation/Layout').then((module) => ({
        default: module.Layout,
      })),
    ),
  },

  {
    name: 'login',
    url: '/login/?disableAutoLogin&_invitation',
    component: lazyComponent(() =>
      import('./LandingPage').then((module) => ({
        default: module.LandingPage,
      })),
    ),
    params: {
      toState: '',
      toParams: {},
    },
    data: {
      anonymous: true,
    },
  },

  {
    name: 'layout',
    url: '',
    abstract: true,
    component: lazyComponent(() =>
      import('@/navigation/Layout').then((module) => ({
        default: module.Layout,
      })),
    ),
    data: {
      auth: true,
    },
  },

  {
    name: 'logout',
    url: '/logout/',
    component: lazyComponent(() =>
      import('./LogoutPage').then((module) => ({ default: module.LogoutPage })),
    ),
  },
];
