import { lazyComponent } from '@waldur/core/lazyComponent';
import { StateDeclaration } from '@waldur/core/types';
import { checkPermission } from '@waldur/issues/utils';

const GrowthContainer = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "GrowthContainer" */ '@waldur/invoices/growth/GrowthContainer'
    ),
  'GrowthContainer',
);
const BillingDetails = lazyComponent(
  () =>
    import(/* webpackChunkName: "BillingDetails" */ './details/BillingDetails'),
  'BillingDetails',
);
const BillingTabs = lazyComponent(
  () => import(/* webpackChunkName: "BillingTabs" */ './list/BillingTabs'),
  'BillingTabs',
);

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
