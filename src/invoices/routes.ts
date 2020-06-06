import { StateDeclaration } from '@waldur/core/types';
import { gettext } from '@waldur/i18n';

import { BillingDetails } from './details/BillingDetails';
import { BillingTabs } from './list/BillingTabs';

export const states: StateDeclaration[] = [
  {
    name: 'organization.billing',
    url: 'billing/',
    component: BillingTabs,
    data: {
      pageTitle: gettext('Accounting'),
    },
  },

  {
    name: 'billingDetails',
    url: '/billing/:uuid/',
    component: BillingDetails,
  },
];
