import { get } from '@waldur/core/api';
import { ngInjector } from '@waldur/core/services';
import { translate } from '@waldur/i18n';
import { getTabTitle } from '@waldur/invoices/utils';
import { MenuItemType } from '@waldur/navigation/sidebar/types';
import { Customer } from '@waldur/workspace/types';

export const getSidebarItems = (customer: Customer): MenuItemType[] => [
  {
    key: 'dashboard',
    label: translate('Dashboard'),
    icon: 'fa-th-large',
    state: 'organization.dashboard',
    params: {
      uuid: customer.uuid,
    },
    index: 100,
  },
  {
    key: 'projects',
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
    key: 'events',
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
    key: 'issues',
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
    key: 'team',
    label: translate('Team'),
    icon: 'fa-group',
    state: 'organization.team',
    params: {
      uuid: customer.uuid,
    },
    feature: 'team',
    countFieldKey: 'users',
    index: 900,
  },
  {
    key: 'billing',
    label: getTabTitle(),
    icon: 'fa-file-text-o',
    state: 'organization.billing.tabs',
    params: {
      uuid: customer.uuid,
    },
    feature: 'billing',
    index: 1000,
  },
  {
    key: 'manage',
    label: translate('Manage'),
    icon: 'fa-wrench',
    state: 'organization.manage',
    params: {
      uuid: customer.uuid,
    },
    index: 9999,
  },
];

export const getCustomerCounters = (customer: Customer, fields: string[]) =>
  get(`/customers/${customer.uuid}/counters/`, { params: { fields } }).then(
    response => response.data,
  );

export const getExtraSidebarItems = (): Promise<MenuItemType[]> => {
  const SidebarExtensionService = ngInjector.get('SidebarExtensionService');
  return SidebarExtensionService.getItems('customer');
};
