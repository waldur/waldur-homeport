import { UIView } from '@uirouter/react';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { StateDeclaration } from '@waldur/core/types';

const InvalidObjectPage = lazyComponent(
  () => import('./InvalidObjectPage'),
  'InvalidObjectPage',
);
const InvalidRoutePage = lazyComponent(
  () => import('./InvalidRoutePage'),
  'InvalidRoutePage',
);

export const states: StateDeclaration[] = [
  {
    name: 'errorPage',
    component: UIView,
    abstract: true,
  },

  {
    name: 'errorPage.notFound',
    component: InvalidObjectPage,
  },

  {
    name: 'errorPage.otherwise',
    url: '*path',
    component: InvalidRoutePage,
  },
  {
    name: 'legacy',
    component: UIView,
    onEnter: () => {
      window.location.pathname = '/legacy/';
    },
  },
];
