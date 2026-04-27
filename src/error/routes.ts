import { UIView } from '@uirouter/react';

import { lazyComponent } from '@/core/lazyComponent';
import { StateDeclaration } from '@/core/types';

export const states: StateDeclaration[] = [
  {
    name: 'errorPage',
    component: UIView,
    abstract: true,
    parent: 'layout',
  },

  {
    name: 'errorPage.notFound',
    component: lazyComponent(() =>
      import('./InvalidRoutePage').then((module) => ({
        default: module.InvalidRoutePage,
      })),
    ),
  },

  {
    name: 'errorPage.noPermission',
    component: lazyComponent(() =>
      import('./AccessDeniedPage').then((module) => ({
        default: module.AccessDeniedPage,
      })),
    ),
  },

  {
    name: 'errorPage.serverError',
    component: lazyComponent(() =>
      import('./ServerErrorPage').then((module) => ({
        default: module.ServerErrorPage,
      })),
    ),
  },

  {
    name: 'errorPage.serviceNotAvailable',
    component: lazyComponent(() =>
      import('./ServiceNotAvailablePage').then((module) => ({
        default: module.ServiceNotAvailablePage,
      })),
    ),
  },

  {
    name: 'errorPage.otherwise',
    url: '*path',
    component: lazyComponent(() =>
      import('./InvalidRoutePage').then((module) => ({
        default: module.InvalidRoutePage,
      })),
    ),
  },
];
