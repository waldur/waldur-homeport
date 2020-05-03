import { StateDeclaration } from '@waldur/core/types';
import { gettext } from '@waldur/i18n';
import { withStore } from '@waldur/store/connect';

import { BillingDetails } from './details/BillingDetails';
import { BillingTabs } from './list/BillingTabs';

export const states: StateDeclaration[] = [
  {
    name: 'organization.billing',
    url: 'billing/',
    template: '<ui-view></ui-view>',
    abstract: true,
    data: {
      pageTitle: gettext('Accounting'),
    },
  },

  {
    name: 'organization.billing.tabs',
    url: '',
    component: withStore(BillingTabs),
  },

  {
    name: 'billingDetails',
    url: '/billing/:uuid/',
    component: withStore(BillingDetails),
  },
];

export default function registerRoutes($stateProvider) {
  states.forEach(({ name, ...rest }) => $stateProvider.state(name, rest));
}
registerRoutes.$inject = ['$stateProvider'];
