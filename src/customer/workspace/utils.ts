import { ngInjector } from '@waldur/core/services';
import { translate } from '@waldur/i18n';

export const getDefaultItems = customer => [
  {
    label: translate('Dashboard'),
    icon: 'fa-th-large',
    state: 'organization.dashboard',
    params: {
      uuid: customer.uuid,
    },
    index: 100,
  },
  {
    label: translate('Projects'),
    icon: 'fa-bookmark',
    state: 'organization.projects',
    params: {
      uuid: customer.uuid,
    },
    feature: 'projects',
    countFieldKey: 'projects',
    index: 300,
  },
  {
    label: translate('Audit logs'),
    icon: 'fa-bell-o',
    state: 'organization.details',
    params: {
      uuid: customer.uuid,
    },
    feature: 'eventlog',
    index: 600,
  },
  {
    label: translate('Issues'),
    icon: 'fa-question-circle',
    state: 'organization.issues',
    params: {
      uuid: customer.uuid,
    },
    feature: 'support',
    index: 700,
  },
  {
    label: translate('Team'),
    icon: 'fa-group',
    state: 'organization.team',
    params: {
      uuid: customer.uuid,
    },
    feature: 'team',
    key: 'team',
    countFieldKey: 'users',
    index: 900,
  },
  {
    label: ngInjector.get('BillingUtils').getTabTitle(),
    icon: 'fa-file-text-o',
    state: 'organization.billing.tabs',
    params: {
      uuid: customer.uuid,
    },
    feature: 'billing',
    index: 1000,
  },
  {
    label: translate('Manage'),
    icon: 'fa-wrench',
    state: 'organization.manage',
    params: {
      uuid: customer.uuid,
    },
    index: 9999,
  },
];
