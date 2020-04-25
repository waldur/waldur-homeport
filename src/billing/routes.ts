import { StateDeclaration } from '@waldur/core/types';
import { gettext } from '@waldur/i18n';

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
    template: '<billing-tabs></billing-tabs>',
  },

  {
    name: 'billingDetails',
    url: '/billing/:uuid/',
    template: '<billing-details></billing-details>',
  },
];

export default function registerRoutes($stateProvider) {
  states.forEach(({ name, ...rest }) => $stateProvider.state(name, rest));
}
registerRoutes.$inject = ['$stateProvider'];
