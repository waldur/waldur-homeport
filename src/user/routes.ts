import { UIView } from '@uirouter/react';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { StateDeclaration } from '@waldur/core/types';
import { MarketplaceFeatures, UserFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { hasSupport } from '@waldur/issues/hooks';
import { getConfig } from '@waldur/store/config';
import { WorkspaceType } from '@waldur/workspace/types';

import { UsersService } from './UsersService';

const FreeIpaAccount = lazyComponent(
  () => import('@waldur/freeipa/FreeIPAAccount'),
  'FreeIpaAccount',
);
const HooksList = lazyComponent(() => import('./hooks/HooksList'), 'HooksList');
const MyKeysList = lazyComponent(
  () => import('./keys/MyKeysList'),
  'MyKeysList',
);
const UserDashboard = lazyComponent(
  () => import('./dashboard/UserDashboard'),
  'UserDashboard',
);
const UserEventsWrapper = lazyComponent(
  () => import('./dashboard/UserEventsWrapper'),
  'UserEventsWrapper',
);
const UserManage = lazyComponent(() => import('./UserManage'), 'UserManage');
const UserOfferingList = lazyComponent(
  () => import('./UserOfferingList'),
  'UserOfferingList',
);
const UserPermissionRequestsList = lazyComponent(
  () => import('./UserPermissionRequestsList'),
  'UserPermissionRequestsList',
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
const ProjectsList = lazyComponent(
  () => import('@waldur/user/affiliations/ProjectsList'),
  'ProjectsList',
);
const ResourcesListContainer = lazyComponent(
  () => import('@waldur/user/resources/ResourcesListContainer'),
  'ResourcesListContainer',
);
const UserIssuesList = lazyComponent(
  () => import('./UserIssuesList'),
  'UserIssuesList',
);
const OrganizationsList = lazyComponent(
  () => import('@waldur/user/affiliations/OrganizationsList'),
  'OrganizationsList',
);

const UserEmailChangeCallback = lazyComponent(
  () => import('./support/UserEmailChangeCallback'),
  'UserEmailChangeCallback',
);
const IssueDetailsContainer = lazyComponent(
  () => import('../issues/IssueDetails'),
  'IssueDetails',
);

const UserDetails = lazyComponent(() => import('./UserDetails'), 'UserDetails');

export const states: StateDeclaration[] = [
  {
    name: 'profile',
    url: '/profile/',
    abstract: true,
    data: {
      auth: true,
      workspace: WorkspaceType.USER,
      title: () => UsersService.getCachedUser()?.full_name,
      hideProjectSelector: true,
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
    name: 'profile-affiliations',
    abstract: true,
    parent: 'profile',
    component: UIView,
    url: '',
    data: {
      breadcrumb: () => translate('Affiliations'),
      priority: 105,
    },
  },

  {
    name: 'profile-calls',
    abstract: true,
    parent: 'profile',
    component: UIView,
    url: '',
    data: {
      feature: MarketplaceFeatures.show_call_management_functionality,
      breadcrumb: () => translate('Calls'),
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
    name: 'profile.issues',
    url: 'issues/',
    component: UserIssuesList,
    data: {
      breadcrumb: () => translate('Issues'),
      skipBreadcrumb: true,
      permissions: [hasSupport],
    },
  },
  {
    name: 'profile.issue-details',
    url: 'issues/:issue_uuid',
    component: IssueDetailsContainer,
    data: {
      permissions: [hasSupport],
    },
  },

  {
    name: 'profile-keys',
    url: 'keys/',
    component: MyKeysList,
    parent: 'profile-credentials',
    data: {
      feature: UserFeatures.ssh_keys,
      breadcrumb: () => translate('SSH keys'),
    },
  },
  {
    name: 'profile.notifications',
    url: 'notifications/',
    component: HooksList,
    data: {
      feature: UserFeatures.notifications,
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
      breadcrumb: () => translate('FreeIPA account'),
      permissions: [
        (state) => getConfig(state).plugins.WALDUR_FREEIPA?.ENABLED,
      ],
    },
  },
  {
    name: 'profile-remote-accounts',
    url: 'remote-accounts/',
    component: UserOfferingList,
    parent: 'profile-credentials',
    data: {
      breadcrumb: () => translate('Remote accounts'),
    },
  },
  {
    name: 'profile.permission-requests',
    url: 'permission-requests/',
    component: UserPermissionRequestsList,
    data: {
      breadcrumb: () => translate('Permission requests'),
    },
  },
  {
    name: 'profile-api-key',
    url: 'api-key/',
    component: UserApiKey,
    parent: 'profile-credentials',
    data: {
      breadcrumb: () => translate('API token'),
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
    name: 'profile-projects',
    url: 'projects/',
    component: ProjectsList,
    parent: 'profile-affiliations',
    data: {
      breadcrumb: () => translate('Projects'),
    },
  },
  {
    name: 'profile.resources',
    url: 'user-resources/',
    component: ResourcesListContainer,
    data: {
      breadcrumb: () => translate('Resources'),
      priority: 110,
    },
  },
  {
    name: 'profile-organizations',
    url: 'organizations/',
    component: OrganizationsList,
    parent: 'profile-affiliations',
    data: {
      breadcrumb: () => translate('Organizations'),
    },
  },
  {
    name: 'user-email-change',
    url: '/user_email_change/:token/',
    component: UserEmailChangeCallback,
  },
];
