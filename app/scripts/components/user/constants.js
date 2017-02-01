export const PRIVATE_USER_TABS = [
  {
    label: 'Dashboard',
    icon: 'fa-th-large',
    link: 'profile.details'
  },
  {
    label: 'Audit logs',
    icon: 'fa-bell-o',
    link: 'profile.events'
  },
  {
    label: 'SSH Keys',
    icon: 'fa-key',
    link: 'profile.keys'
  },
  {
    label: 'Notifications',
    icon: 'fa-envelope',
    link: 'profile.notifications',
    feature: 'notifications'
  },
  {
    label: 'Manage',
    icon: 'fa-wrench',
    link: 'profile.manage'
  }
];

export const PUBLIC_USER_TABS = [
  {
    label: 'Audit logs',
    icon: 'fa-bell-o',
    link: 'users.details({uuid: $ctrl.context.user.uuid})'
  },
  {
    label: 'SSH Keys',
    icon: 'fa-key',
    link: 'users.keys({uuid: $ctrl.context.user.uuid})'
  }
];
