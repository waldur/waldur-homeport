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
    feature: 'user.ssh-keys',
  },
  {
    label: translate('Notifications'),
    icon: 'fa-envelope',
    state: 'profile.notifications',
    key: 'notifications',
    feature: 'notifications',
  },
  {
    label: translate('Manage'),
    icon: 'fa-wrench',
    state: 'profile.manage',
    key: 'manage',
  },
  {
    label: translate('FreeIPA account'),
    icon: 'fa-user',
    state: 'profile.freeipa',
    key: 'freeipa',
    feature: 'freeipa',
  },
];

export const getPublicUserTabs = user => [
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
    feature: 'user.ssh-keys',
  },
];
