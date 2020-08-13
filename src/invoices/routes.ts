import { StateDeclaration } from '@waldur/core/types';
import { GrowthContainer } from '@waldur/invoices/growth/GrowthContainer';
import { checkPermission } from '@waldur/issues/utils';

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

  {
    name: 'invoicesGrowth',
    url: 'growth/',
    component: GrowthContainer,
    parent: 'support',
    resolve: {
      permission: checkPermission,
    },
  },
];
