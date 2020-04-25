import { StateDeclaration } from '@waldur/core/types';
import { gettext } from '@waldur/i18n';
import { AnonymousLayout } from '@waldur/navigation/AnonymousLayout';
import { withStore } from '@waldur/store/connect';

import { InvalidObjectPage } from './InvalidObjectPage';
import { InvalidQuotaPage } from './InvalidQuotaPage';
import { InvalidRoutePage } from './InvalidRoutePage';

export const states: StateDeclaration[] = [
  {
    name: 'errorPage',
    component: withStore(AnonymousLayout),
    abstract: true,
    data: {
      bodyClass: 'old',
    },
  },

  {
    name: 'errorPage.notFound',
    component: withStore(InvalidObjectPage),
    data: {
      pageTitle: gettext('Page is not found.'),
    },
  },

  {
    name: 'errorPage.otherwise',
    url: '*path',
    component: withStore(InvalidRoutePage),
    data: {
      pageTitle: gettext('Object is not found.'),
    },
  },

  {
    name: 'errorPage.limitQuota',
    component: withStore(InvalidQuotaPage),
    data: {
      pageTitle: gettext('Quota has been reached.'),
    },
  },
];

export default function registerRoutes($stateProvider) {
  states.forEach(({ name, ...rest }) => $stateProvider.state(name, rest));
}
registerRoutes.$inject = ['$stateProvider'];
