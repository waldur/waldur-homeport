import { lazyComponent } from '@waldur/core/lazyComponent';
import { StateDeclaration } from '@waldur/core/types';

const Layout = lazyComponent(
  () => import('@waldur/navigation/Layout'),
  'Layout',
);

const LandingPage = lazyComponent(() => import('./LandingPage'), 'LandingPage');

export const states: StateDeclaration[] = [
  {
    name: 'home',
    url: '',
    abstract: true,
    component: Layout,
  },

  {
    name: 'login',
    url: '/login/?disableAutoLogin',
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
    name: 'layout',
    url: '',
    abstract: true,
    component: Layout,
    data: {
      auth: true,
    },
  },
];
