export const PRIVATE_USER_TABS = [
  {
    label: gettext('Dashboard'),
    icon: 'fa-th-large',
    state: 'profile.details',
  },
  {
    label: gettext('Audit logs'),
    icon: 'fa-bell-o',
    state: 'profile.events',
  },
  {
    label: gettext('SSH Keys'),
    icon: 'fa-key',
    state: 'profile.keys',
    feature: 'user.ssh-keys',
  },
  {
    label: gettext('Notifications'),
    icon: 'fa-envelope',
    state: 'profile.notifications',
    feature: 'notifications',
  },
  {
    label: gettext('Manage'),
    icon: 'fa-wrench',
    state: 'profile.manage',
  },
  {
    label: gettext('FreeIPA account'),
    icon: 'fa-user',
    state: 'profile.freeipa',
    feature: 'freeipa',
  },
];

export const getPublicUserTabs = user => [
  {
    label: gettext('Audit logs'),
    icon: 'fa-bell-o',
    state: 'users.details',
    params: {
      uuid: user.uuid,
    },
  },
  {
    label: gettext('SSH Keys'),
    icon: 'fa-key',
    state: 'users.keys',
    params: {
      uuid: user.uuid,
    },
    feature: 'user.ssh-keys',
  },
];
