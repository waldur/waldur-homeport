import { StateDeclaration } from '@waldur/core/types';
import { gettext } from '@waldur/i18n';
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
    data: {
      pageTitle: gettext('Page is not found.'),
    },
  },

  {
    name: 'errorPage.otherwise',
    url: '*path',
    component: InvalidRoutePage,
    data: {
      pageTitle: gettext('Object is not found.'),
    },
  },

  {
    name: 'errorPage.limitQuota',
    component: InvalidQuotaPage,
    data: {
      pageTitle: gettext('Quota has been reached.'),
    },
  },
];
