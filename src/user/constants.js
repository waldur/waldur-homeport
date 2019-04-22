export const PRIVATE_USER_TABS = [
  {
    label: gettext('Dashboard'),
    icon: 'fa-th-large',
    link: 'profile.details'
  },
  {
    label: gettext('Audit logs'),
    icon: 'fa-bell-o',
    link: 'profile.events'
  },
  {
    label: gettext('SSH Keys'),
    icon: 'fa-key',
    link: 'profile.keys',
    feature: 'user.ssh-keys',
  },
  {
    label: gettext('Notifications'),
    icon: 'fa-envelope',
    link: 'profile.notifications',
    feature: 'notifications'
  },
  {
    label: gettext('Manage'),
    icon: 'fa-wrench',
    link: 'profile.manage'
  },
  {
    label: gettext('FreeIPA account'),
    icon: 'fa-user',
    link: 'profile.freeipa',
    feature: 'freeipa'
  }
];

export const PUBLIC_USER_TABS = [
  {
    label: gettext('Audit logs'),
    icon: 'fa-bell-o',
    link: 'users.details({uuid: $ctrl.context.user.uuid})'
  },
  {
    label: gettext('SSH Keys'),
    icon: 'fa-key',
    link: 'users.keys({uuid: $ctrl.context.user.uuid})',
    feature: 'user.ssh-keys',
  }
];
