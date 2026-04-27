import { ENV } from '@/core/config';
import { lazyComponent } from '@/core/lazyComponent';
import { StateDeclaration } from '@/core/types';
import { translate } from '@/i18n';
import { isOwnerOrStaff } from '@/workspace/selectors';

export const states: StateDeclaration[] = [
  {
    name: 'organization-billing.billing',
    url: 'billing/',
    component: lazyComponent(() =>
      import('./list/BillingTabs').then((module) => ({
        default: module.BillingTabs,
      })),
    ),
    data: {
      breadcrumb: () => translate('Invoices'),
      permissions: [isOwnerOrStaff],
      priority: 130,
    },
  },

  {
    name: 'billingDetails',
    url: 'billing/:invoice_uuid/?status',
    component: lazyComponent(() =>
      import('./details/BillingDetails').then((module) => ({
        default: module.BillingDetails,
      })),
    ),
    parent: 'organization',
    data: {
      breadcrumb: () =>
        ENV.accountingMode === 'accounting'
          ? translate('Accounting record')
          : translate('Invoice'),
      skipBreadcrumb: true,
    },
  },
];
