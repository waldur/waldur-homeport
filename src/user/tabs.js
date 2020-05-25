import { withStore } from '@waldur/store/connect';

import { HooksList } from './hooks/HooksList';
import { KeysList } from './keys/KeysList';
import { CurrentUserEvents } from './list/CurrentUserEvents';
import { UserDashboard } from './list/UserDashboard';
import { UserManage } from './UserManage';

export const tabs = {
  dashboard: {
    url: '',
    component: withStore(UserDashboard),
    data: {
      pageTitle: gettext('User dashboard'),
      pageClass: 'gray-bg',
      hideBreadcrumbs: true,
    },
  },
  events: {
    url: 'events/',
    component: withStore(CurrentUserEvents),
    data: {
      pageTitle: gettext('Audit logs'),
    },
  },
  keys: {
    url: 'keys/',
    component: withStore(KeysList),
    data: {
      pageTitle: gettext('SSH keys'),
    },
  },
  notifications: {
    url: 'notifications/',
    component: withStore(HooksList),
    data: {
      pageTitle: gettext('Notifications'),
    },
  },
  manage: {
    url: 'manage/',
    component: withStore(UserManage),
    data: {
      pageTitle: gettext('Manage'),
    },
  },
  freeipa: {
    url: 'freeipa-account/',
    template: '<freeipa-account></freeipa-account>',
    data: {
      pageTitle: gettext('FreeIPA account'),
      feature: 'freeipa',
    },
  },
};

// @ngInject
export function requireIdParam($stateParams, $q) {
  // Abort state transition if mandatory route parameter (UUID) is not specified
  if (!$stateParams.uuid) {
    return $q.reject('UUID is mandatory parameter');
  }
}
