import { FreeIpaAccount } from '@waldur/freeipa/FreeIPAAccount';
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
      pageClass: 'gray-bg',
      hideBreadcrumbs: true,
    },
  },
  events: {
    url: 'events/',
    component: withStore(CurrentUserEvents),
  },
  keys: {
    url: 'keys/',
    component: withStore(KeysList),
  },
  notifications: {
    url: 'notifications/',
    component: withStore(HooksList),
  },
  manage: {
    url: 'manage/',
    component: withStore(UserManage),
  },
  freeipa: {
    url: 'freeipa-account/',
    component: withStore(FreeIpaAccount),
    data: {
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
