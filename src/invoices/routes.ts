import { StateDeclaration } from '@waldur/core/types';

import { BillingDetails } from './details/BillingDetails';
import { BillingTabs } from './list/BillingTabs';

export const states: StateDeclaration[] = [
  {
    name: 'organization.billing',
    url: 'billing/',
    component: BillingTabs,
  },

  {
    name: 'billingDetails',
    url: '/billing/:uuid/',
    component: BillingDetails,
  },
];
