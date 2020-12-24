import { Transition } from '@uirouter/react';

import { lazyComponent } from '@waldur/core/lazyComponent';

const FreeIpaAccount = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "FreeIPAAccount" */ '@waldur/freeipa/FreeIPAAccount'
    ),
  'FreeIpaAccount',
);
const HooksList = lazyComponent(
  () => import(/* webpackChunkName: "HooksList" */ './hooks/HooksList'),
  'HooksList',
);
const KeysList = lazyComponent(
  () => import(/* webpackChunkName: "KeysList" */ './keys/KeysList'),
  'KeysList',
);
const UserDashboard = lazyComponent(
  () => import(/* webpackChunkName: "UserDashboard" */ './list/UserDashboard'),
  'UserDashboard',
);
const UserEventsWrapper = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "UserEventsWrapper" */ './list/UserEventsWrapper'
    ),
  'UserEventsWrapper',
);
const UserManage = lazyComponent(
  () => import(/* webpackChunkName: "UserManage" */ './UserManage'),
  'UserManage',
);

export const tabs = {
  dashboard: {
    url: '',
    component: UserDashboard,
    data: {
      pageClass: 'gray-bg',
    },
  },
  events: {
    url: 'events/',
    component: UserEventsWrapper,
  },
  keys: {
    url: 'keys/',
    component: KeysList,
  },
  notifications: {
    url: 'notifications/',
    component: HooksList,
  },
  manage: {
    url: 'manage/',
    component: UserManage,
  },
  freeipa: {
    url: 'freeipa-account/',
    component: FreeIpaAccount,
    data: {
      feature: 'freeipa',
    },
  },
};

export function requireIdParam(transition: Transition) {
  // Abort state transition if mandatory route parameter (UUID) is not specified
  if (!transition.params().uuid) {
    return Promise.reject('UUID is mandatory parameter');
  }
}
