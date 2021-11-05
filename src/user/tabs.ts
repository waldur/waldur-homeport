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
const KeysListContainer = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "KeysListContainer" */ './keys/KeysListContainer'
    ),
  'KeysListContainer',
);
const UserDashboard = lazyComponent(
  () =>
    import(/* webpackChunkName: "UserDashboard" */ './dashboard/UserDashboard'),
  'UserDashboard',
);
const UserEventsWrapper = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "UserEventsWrapper" */ './dashboard/UserEventsWrapper'
    ),
  'UserEventsWrapper',
);
const UserManage = lazyComponent(
  () => import(/* webpackChunkName: "UserManage" */ './UserManage'),
  'UserManage',
);
const UserOfferingListContainer = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "UserOfferingListContainer" */ './UserOfferingListContainer'
    ),
  'UserOfferingListContainer',
);
const FlowListContainer = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "FlowListContainer" */ '@waldur/marketplace-flows/FlowListContainer'
    ),
  'FlowListContainer',
);
const FlowEditForm = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "FlowEditForm" */ '@waldur/marketplace-flows/FlowEditForm'
    ),
  'FlowEditForm',
);
const UserPermissionsListContainer = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "UserPermissionsListContainer" */ './UserPermissionsListContainer'
    ),
  'UserPermissionsListContainer',
);

export const tabs = {
  dashboard: {
    url: '',
    component: UserDashboard,
    data: {
      pageClass: 'gray-bg',
      hideBreadcrumbs: true,
    },
  },
  events: {
    url: 'events/',
    component: UserEventsWrapper,
  },
  keys: {
    url: 'keys/',
    component: KeysListContainer,
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
  },
  offerings: {
    url: 'remote-accounts/',
    component: UserOfferingListContainer,
  },
  flowsList: {
    url: 'resources/',
    component: FlowListContainer,
  },
  flowEdit: {
    url: 'resources/:flow_uuid/',
    component: FlowEditForm,
  },
  permissions: {
    url: 'permissions/',
    component: UserPermissionsListContainer,
  },
};

export function requireIdParam(transition: Transition) {
  // Abort state transition if mandatory route parameter (UUID) is not specified
  if (!transition.params().uuid) {
    return Promise.reject('UUID is mandatory parameter');
  }
}
