import { UIView } from '@uirouter/react';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { StateDeclaration } from '@waldur/core/types';
import { translate } from '@waldur/i18n';
import { getConfig } from '@waldur/store/config';
import { USER_WORKSPACE } from '@waldur/workspace/types';

import { UsersService } from './UsersService';

const FreeIpaAccount = lazyComponent(
  () => import('@waldur/freeipa/FreeIPAAccount'),
  'FreeIpaAccount',
);
const HooksList = lazyComponent(() => import('./hooks/HooksList'), 'HooksList');
const KeysList = lazyComponent(() => import('./keys/KeysList'), 'KeysList');
const UserDashboard = lazyComponent(
  () => import('./dashboard/UserDashboard'),
  'UserDashboard',
);
const UserEventsWrapper = lazyComponent(
  () => import('./dashboard/UserEventsWrapper'),
  'UserEventsWrapper',
);
const UserManage = lazyComponent(() => import('./UserManage'), 'UserManage');
const UserOfferingListContainer = lazyComponent(
  () => import('./UserOfferingListContainer'),
  'UserOfferingListContainer',
);
const FlowListContainer = lazyComponent(
  () => import('@waldur/marketplace-flows/FlowListContainer'),
  'FlowListContainer',
);
const FlowEditForm = lazyComponent(
  () => import('@waldur/marketplace-flows/FlowEditForm'),
  'FlowEditForm',
);
const UserPermissionRequestsListContainer = lazyComponent(
  () => import('./UserPermissionRequestsListContainer'),
  'UserPermissionRequestsListContainer',
);
const UserApiKey = lazyComponent(
  () => import('./api-key/UserApiKey'),
  'UserApiKey',
);
const EmptyOrganizationsPlaceholder = lazyComponent(
  () => import('@waldur/navigation/workspace/EmptyOrganizationsPlaceholder'),
  'EmptyOrganizationsPlaceholder',
);
const EmptyProjectPlaceholder = lazyComponent(
  () => import('@waldur/navigation/workspace/EmptyProjectPlaceholder'),
  'EmptyProjectPlaceholder',
);

const UserEmailChangeCallback = lazyComponent(
  () => import('./support/UserEmailChangeCallback'),
  'UserEmailChangeCallback',
);
const UserDetails = lazyComponent(() => import('./UserDetails'), 'UserDetails');

export const states: StateDeclaration[] = [
  {
    name: 'profile',
    url: '/profile/',
    abstract: true,
    data: {
      auth: true,
      workspace: USER_WORKSPACE,
      title: () => UsersService.getCachedUser().full_name,
    },
    component: UserDetails,
  },

  {
    name: 'profile-credentials',
    abstract: true,
    parent: 'profile',
    component: UIView,
    url: '',
    data: {
      breadcrumb: () => translate('Credentials'),
    },
  },

  {
    name: 'profile.details',
    url: '',
    component: UserDashboard,
    data: {
      breadcrumb: () => translate('Dashboard'),
      priority: 100,
    },
  },
  {
    name: 'profile.events',
    url: 'events/',
    component: UserEventsWrapper,
    data: {
      breadcrumb: () => translate('Audit logs'),
      skipBreadcrumb: true,
    },
  },
  {
    name: 'profile-keys',
    url: 'keys/',
    component: KeysList,
    parent: 'profile-credentials',
    data: {
      feature: 'user.ssh_keys',
      breadcrumb: () => translate('SSH keys'),
    },
  },
  {
    name: 'profile.notifications',
    url: 'notifications/',
    component: HooksList,
    data: {
      feature: 'user.notifications',
      breadcrumb: () => translate('Notifications'),
    },
  },
  {
    name: 'profile.manage',
    url: 'manage/',
    component: UserManage,
    data: {
      breadcrumb: () => translate('Settings'),
      skipBreadcrumb: true,
    },
  },
  {
    name: 'profile-freeipa',
    url: 'freeipa-account/',
    component: FreeIpaAccount,
    parent: 'profile-credentials',
    data: {
      feature: 'user.freeipa',
      breadcrumb: () => translate('FreeIPA account'),
      permissions: [
        (state) => getConfig(state).plugins.WALDUR_FREEIPA?.ENABLED,
      ],
    },
  },
  {
    name: 'profile-remote-accounts',
    url: 'remote-accounts/',
    component: UserOfferingListContainer,
    parent: 'profile-credentials',
    data: {
      breadcrumb: () => translate('Remote accounts'),
    },
  },
  {
    name: 'profile.flows-list',
    url: 'resources/',
    component: FlowListContainer,
    data: {
      feature: 'marketplace.flows',
      breadcrumb: () => translate('Resources'),
    },
  },
  {
    name: 'profile.flow-edit',
    url: 'resources/:flow_uuid/',
    component: FlowEditForm,
  },
  {
    name: 'profile.permission-requests',
    url: 'permission-requests/',
    component: UserPermissionRequestsListContainer,
    data: {
      feature: 'invitations.show_group_invitations',
      breadcrumb: () => translate('Permission requests'),
    },
  },
  {
    name: 'profile-api-key',
    url: 'api-key/',
    component: UserApiKey,
    parent: 'profile-credentials',
    data: {
      breadcrumb: () => translate('API key'),
    },
  },
  {
    name: 'profile.no-customer',
    url: 'no-customer/',
    component: EmptyOrganizationsPlaceholder,
  },
  {
    name: 'profile.no-project',
    url: 'no-project/',
    component: EmptyProjectPlaceholder,
  },
  {
    name: 'user-email-change',
    url: '/user_email_change/:token/',
    component: UserEmailChangeCallback,
  },
];
