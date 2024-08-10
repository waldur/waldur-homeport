import { UIView } from '@uirouter/react';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { StateDeclaration } from '@waldur/core/types';
import { UserFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { hasSupport } from '@waldur/issues/hooks';
import { getConfig } from '@waldur/store/config';
import { WorkspaceType } from '@waldur/workspace/types';

import { PersonalManageContainer } from './PersonalManageContainer';
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
const ProjectsList = lazyComponent(
  () => import('@waldur/user/affiliations/ProjectsList'),
  'ProjectsList',
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
const CategoryResourcesContainer = lazyComponent(
  () => import('@waldur/marketplace/resources/list/CategoryResourcesContainer'),
  'CategoryResourcesContainer',
);
const AllResourcesList = lazyComponent(
  () => import('@waldur/marketplace/resources/list/AllResourcesList'),
  'AllResourcesList',
);

const UserDetails = lazyComponent(() => import('./UserDetails'), 'UserDetails');

export const states: StateDeclaration[] = [
  {
    name: 'profile',
    url: '/profile/',
    parent: 'layout',
    abstract: true,
    data: {
      auth: true,
      workspace: WorkspaceType.USER,
      title: () => UsersService.getCachedUser()?.full_name,
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
      priority: 110,
    },
  },

  {
    name: 'profile.details',
    url: '',
    component: UserDashboard,
    data: {
      breadcrumb: () => translate('User dashboard'),
      priority: 100,
    },
  },
  {
    name: 'profile.events',
    url: 'events/',
    component: UserEventsWrapper,
    data: {
      breadcrumb: () => translate('Audit logs'),
    },
  },
  {
    name: 'profile.issues',
    url: 'issues/',
    component: UserIssuesList,
    data: {
      breadcrumb: () => translate('Issues'),
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
      priority: 120,
    },
  },
  {
    name: 'profile-manage-container',
    url: '',
    parent: 'profile',
    component: PersonalManageContainer,
    abstract: true,
  },
  {
    name: 'profile-manage',
    url: 'manage/?tab',
    parent: 'profile-manage-container',
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
      priority: 130,
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
    name: 'projects',
    url: '/projects/',
    component: ProjectsList,
    parent: 'layout',
  },
  {
    name: 'organizations',
    url: '/organizations/',
    component: OrganizationsList,
    parent: 'layout',
  },
  {
    name: 'user-email-change',
    url: '/user_email_change/:token/',
    component: UserEmailChangeCallback,
  },
  {
    name: 'category-resources',
    url: '/resources/:category_uuid/',
    component: CategoryResourcesContainer,
    parent: 'layout',
  },
  {
    name: 'all-resources',
    url: '/all-resources/?offering',
    component: AllResourcesList,
    parent: 'layout',
  },
];
