import { StateDeclaration } from '@waldur/core/types';
import { AnonymousLayout } from '@waldur/navigation/AnonymousLayout';

import { InvalidObjectPage } from './InvalidObjectPage';
import { InvalidQuotaPage } from './InvalidQuotaPage';
import { InvalidRoutePage } from './InvalidRoutePage';

export const states: StateDeclaration[] = [
  {
    name: 'errorPage',
    component: AnonymousLayout,
    abstract: true,
    data: {
      bodyClass: 'old',
    },
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
    name: 'errorPage.limitQuota',
    component: InvalidQuotaPage,
  },
];
