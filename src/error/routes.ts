import { UIView } from '@uirouter/react';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { StateDeclaration } from '@waldur/core/types';

export const states: StateDeclaration[] = [
  {
    name: 'errorPage',
    component: UIView,
    abstract: true,
  },

  {
    name: 'errorPage.notFound',
    component: lazyComponent(() =>
      import('./InvalidObjectPage').then((module) => ({
        default: module.InvalidObjectPage,
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
    name: 'errorPage.otherwise',
    url: '*path',
    component: lazyComponent(() =>
      import('./InvalidRoutePage').then((module) => ({
        default: module.InvalidRoutePage,
      })),
    ),
  },
];
