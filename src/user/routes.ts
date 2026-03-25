import { UIView } from '@uirouter/react';

import { ENV } from '@waldur/core/config';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { StateDeclaration } from '@waldur/core/types';
import { isFeatureVisible } from '@waldur/features/connect';
import {
  CustomerFeatures,
  MarketplaceFeatures,
  UserFeatures,
} from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { hasSupport } from '@waldur/issues/hooks';
import {
  hasNonProjectPermissions,
  isStaffOrSupport,
} from '@waldur/workspace/selectors';

import { UsersService } from './UsersService';

const canAccessOrganization = (state) => {
  const hideFromProjectMembers = isFeatureVisible(
    MarketplaceFeatures.hide_organization_information_from_project_members,
  );
  if (!hideFromProjectMembers) {
    return true;
  }
  return hasNonProjectPermissions(state);
};

export const states: StateDeclaration[] = [
  {
    name: 'profile',
    url: '/profile/',
    parent: 'layout',
    abstract: true,
    data: {
      auth: true,
      title: () => UsersService.getCachedUser()?.full_name,
    },
    component: lazyComponent(() =>
      import('./UserDetailsPage').then((module) => ({
        default: module.UserDetailsPage,
      })),
    ),
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
      permissions: [
        (state) =>
          isFeatureVisible(UserFeatures.ssh_keys) ||
          ENV.plugins.WALDUR_CORE.FREEIPA_ENABLED ||
          !isFeatureVisible(UserFeatures.conceal_remote_accounts) ||
          isStaffOrSupport(state) ||
          !isFeatureVisible(UserFeatures.conceal_api_token),
      ],
    },
  },

  {
    name: 'profile.details',
    url: '',
    component: lazyComponent(() =>
      import('./dashboard/UserDashboard').then((module) => ({
        default: module.UserDashboard,
      })),
    ),
    data: {
      breadcrumb: () => translate('User dashboard'),
      priority: 100,
    },
  },
  {
    name: 'profile.onboarding-applications',
    url: 'onboarding-applications/',
    component: lazyComponent(() =>
      import('./UserOnboardingVerificationsList').then((module) => ({
        default: module.UserOnboardingVerificationsList,
      })),
    ),
    data: {
      breadcrumb: () => translate('Onboarding applications'),
      feature: CustomerFeatures.show_onboarding,
      priority: 121,
    },
  },
  {
    name: 'profile.verification-details',
    url: 'verifications/:uuid/',
    component: lazyComponent(() =>
      import('./UserOnboardingJustificationDetailsPage').then((module) => ({
        default: module.UserOnboardingJustificationDetailsPage,
      })),
    ),
    data: {
      breadcrumb: () => translate('Verification details'),
      skipBreadcrumb: true,
    },
  },
  {
    name: 'profile.events',
    url: 'events/',
    component: lazyComponent(() =>
      import('./dashboard/UserEventsWrapper').then((module) => ({
        default: module.UserEventsWrapper,
      })),
    ),
    data: {
      breadcrumb: () => translate('Audit logs'),
      permissions: [
        (state) =>
          !isFeatureVisible(
            MarketplaceFeatures.conceal_audit_log_from_end_users,
          ) || isStaffOrSupport(state),
      ],
    },
  },
  {
    name: 'profile.issues',
    url: 'issues/',
    component: lazyComponent(() =>
      import('@waldur/navigation/header/quick-issue-drawer/UserIssuesTable').then(
        (module) => ({
          default: module.UserIssuesTable,
        }),
      ),
    ),
    data: {
      breadcrumb: () => translate('Support'),
      skipBreadcrumb: true,
      permissions: [hasSupport],
    },
  },

  {
    name: 'profile-keys',
    url: 'keys/',
    component: lazyComponent(() =>
      import('./keys/MyKeysList').then((module) => ({
        default: module.MyKeysList,
      })),
    ),
    parent: 'profile-credentials',
    data: {
      feature: UserFeatures.ssh_keys,
      breadcrumb: () => translate('SSH keys'),
    },
  },
  {
    name: 'profile.notifications',
    url: 'notifications/',
    component: lazyComponent(() =>
      import('./hooks/HooksList').then((module) => ({
        default: module.HooksList,
      })),
    ),
    data: {
      feature: UserFeatures.notifications,
      breadcrumb: () => translate('Notifications'),
      priority: 120,
    },
  },
  {
    name: 'profile.tos-management',
    url: 'tos-management/',
    component: lazyComponent(() =>
      import('./dashboard/UserTosManagement').then((module) => ({
        default: module.UserTosManagementSection,
      })),
    ),
    data: {
      feature: MarketplaceFeatures.display_user_tos,
      breadcrumb: () => translate('ToS management'),
      priority: 130,
    },
  },
  {
    name: 'profile-manage-container',
    url: '',
    parent: 'profile',
    component: lazyComponent(() =>
      import('./PersonalManageContainer').then((module) => ({
        default: module.PersonalManageContainer,
      })),
    ),
    abstract: true,
  },
  {
    name: 'profile-manage',
    url: 'manage/?tab&section',
    parent: 'profile-manage-container',
    component: lazyComponent(() =>
      import('./UserManage').then((module) => ({ default: module.UserManage })),
    ),
    data: {
      breadcrumb: () => translate('Settings'),
      skipBreadcrumb: true,
    },
  },
  {
    name: 'profile-freeipa',
    url: 'freeipa-account/',
    component: lazyComponent(() =>
      import('@waldur/freeipa/FreeIPAAccount').then((module) => ({
        default: module.FreeIpaAccount,
      })),
    ),
    parent: 'profile-credentials',
    data: {
      breadcrumb: () => translate('FreeIPA account'),
      permissions: [() => ENV.plugins.WALDUR_CORE.FREEIPA_ENABLED],
    },
  },
  {
    name: 'profile-remote-accounts',
    url: 'remote-accounts/',
    component: lazyComponent(() =>
      import('./UserOfferingList').then((module) => ({
        default: module.UserOfferingList,
      })),
    ),
    parent: 'profile-credentials',
    data: {
      breadcrumb: () => translate('Remote accounts'),
      permissions: [
        (state) =>
          !isFeatureVisible(UserFeatures.conceal_remote_accounts) ||
          isStaffOrSupport(state),
      ],
    },
  },
  {
    name: 'profile.permission-requests',
    url: 'permission-requests/',
    component: lazyComponent(() =>
      import('./UserPermissionRequestsList').then((module) => ({
        default: module.UserPermissionRequestsList,
      })),
    ),
    data: {
      breadcrumb: () => translate('Permission requests'),
      permissions: [
        (state) =>
          !isFeatureVisible(UserFeatures.conceal_permission_requests) ||
          isStaffOrSupport(state),
      ],
      priority: 130,
    },
  },
  {
    name: 'profile-api-key',
    url: 'api-key/',
    component: lazyComponent(() =>
      import('./api-key/UserApiKey').then((module) => ({
        default: module.UserApiKey,
      })),
    ),
    parent: 'profile-credentials',
    data: {
      breadcrumb: () => translate('API token'),
      permissions: [
        (state) =>
          !isFeatureVisible(UserFeatures.conceal_api_token) ||
          isStaffOrSupport(state),
      ],
    },
  },
  {
    name: 'projects',
    url: '/projects/',
    component: lazyComponent(() =>
      import('@waldur/user/affiliations/ProjectsList').then((module) => ({
        default: module.ProjectsList,
      })),
    ),
    parent: 'layout',
  },
  {
    name: 'organizations',
    url: '/organizations/',
    component: lazyComponent(() =>
      import('@waldur/user/affiliations/OrganizationsList').then((module) => ({
        default: module.OrganizationsList,
      })),
    ),
    parent: 'layout',
    data: {
      permissions: [canAccessOrganization],
    },
  },
  {
    name: 'organizations-create',
    url: '/organizations/create/',
    component: lazyComponent(() =>
      import('./organization-create/OrganizationCreatePage').then((module) => ({
        default: module.OrganizationCreatePage,
      })),
    ),
    parent: 'layout',
    data: {
      auth: true,
      breadcrumb: () => translate('Create organization'),
      feature: CustomerFeatures.show_onboarding,
      permissions: [canAccessOrganization],
    },
  },
  {
    name: 'user-email-change',
    url: '/user_email_change/:token/',
    component: lazyComponent(() =>
      import('./support/UserEmailChangeCallback').then((module) => ({
        default: module.UserEmailChangeCallback,
      })),
    ),
  },
  {
    name: 'category-resources',
    url: '/resources/:category_uuid/',
    component: lazyComponent(() =>
      import('@waldur/marketplace/resources/list/CategoryResourcesContainer').then(
        (module) => ({ default: module.CategoryResourcesContainer }),
      ),
    ),
    parent: 'layout',
  },
  {
    name: 'all-resources',
    url: '/all-resources/',
    component: lazyComponent(() =>
      import('@waldur/marketplace/resources/list/AllResourcesList').then(
        (module) => ({ default: module.AllResourcesList }),
      ),
    ),
    parent: 'layout',
  },
];
