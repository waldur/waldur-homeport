import { ENV } from '@waldur/configs/default';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { StateDeclaration } from '@waldur/core/types';
import { translate } from '@waldur/i18n';

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
    data: {
      breadcrumb: () =>
        ENV.accountingMode === 'accounting'
          ? translate('Accounting')
          : translate('Billing'),
    },
  },

  {
    name: 'billingDetails',
    url: 'billing/:invoice_uuid/?status',
    component: BillingDetails,
    parent: 'organization',
    data: {
      breadcrumb: () =>
        ENV.accountingMode === 'accounting'
          ? translate('Accounting record')
          : translate('Invoice'),
      skipBreadcrumb: true,
    },
  },

  {
    name: 'invoicesGrowth',
    url: 'growth/',
    component: GrowthContainer,
    parent: 'reporting',
    data: {
      breadcrumb: () => translate('Growth'),
    },
  },
];
