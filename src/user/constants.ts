import { ENV } from '@waldur/configs/default';
import { translate } from '@waldur/i18n';

export const getPrivateUserTabs = () => [
  {
    label: translate('Dashboard'),
    icon: 'fa-th-large',
    state: 'profile.details',
    key: 'details',
  },
  {
    label: translate('Audit logs'),
    icon: 'fa-bell-o',
    state: 'profile.events',
    key: 'events',
  },
  {
    label: translate('SSH Keys'),
    icon: 'fa-key',
    state: 'profile.keys',
    key: 'keys',
    feature: 'user.ssh_keys',
  },
  {
    label: translate('Notifications'),
    icon: 'fa-envelope',
    state: 'profile.notifications',
    key: 'notifications',
    feature: 'user.notifications',
  },
  {
    label: translate('Manage'),
    icon: 'fa-wrench',
    state: 'profile.manage',
    key: 'manage',
  },
  {
    label: translate('API key'),
    icon: 'fa-key',
    state: 'profile.api-key',
    key: 'api-key',
  },
  ENV.plugins.WALDUR_FREEIPA?.ENABLED
    ? {
        label: translate('FreeIPA account'),
        icon: 'fa-user',
        state: 'profile.freeipa',
        key: 'freeipa',
      }
    : undefined,
  {
    label: translate('Remote accounts'),
    icon: 'fa-file',
    state: 'profile.remote-accounts',
    key: 'remote-accounts',
  },
  {
    label: translate('Resources'),
    icon: 'fa-plus',
    state: 'profile.flows-list',
    key: 'flows-list',
    feature: 'marketplace.flows',
  },
  {
    label: translate('Permission requests'),
    icon: 'fa-file',
    state: 'profile.permission-requests',
    key: 'permission-requests',
    feature: 'invitations.show_group_invitations',
  },
];

export const getPublicUserTabs = (user) => [
  {
    label: translate('Audit logs'),
    icon: 'fa-bell-o',
    state: 'users.details',
    key: 'details',
    params: {
      uuid: user.uuid,
    },
  },
  {
    label: translate('SSH Keys'),
    icon: 'fa-key',
    state: 'users.keys',
    key: 'keys',
    params: {
      uuid: user.uuid,
    },
    feature: 'user.ssh_keys',
  },
];

export const SELECT_AFFILIATION_FORM_ID = 'SelectAffiliation';
export const ORGANIZATION_ROUTE = 'marketplace-category-customer';
export const PROJECT_ROUTE = 'marketplace-category-project';
export const USER_PERMISSION_REQUESTS_TABLE_ID =
  'user-permission-requests-table';
export const USER_PERMISSION_REQUESTS_FILTER_FORM_ID =
  'user-permission-requests-table-filter-form';
