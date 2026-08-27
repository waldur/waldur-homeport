import { UIView } from '@uirouter/react';

import { ENV } from '@/core/config';
import { lazyComponent } from '@/core/lazyComponent';
import { StateDeclaration } from '@/core/types';
import { isFeatureVisible } from '@/features/connect';
import {
  CustomerFeatures,
  MarketplaceFeatures,
  UserFeatures,
} from '@/FeaturesEnums';
import { translate } from '@/i18n';
import { hasSupport } from '@/issues/hooks';
import {
  isCallsSectionVisible,
  isProposalRequestEnabled,
} from '@/marketplace/serviceAccessMode';
import { requestListTitle } from '@/proposals/presentation';
import {
  getUser,
  hasNonProjectPermissions,
  isStaffOrSupport,
} from '@/workspace/selectors';

import { UsersService } from './UsersService';

// PAT is gated globally (PAT_ENABLED) and then per-user: staff are implicitly
// allowed, other users need the can_use_personal_access_tokens flag.
const canUsePersonalAccessTokens = (state) => {
  if (!ENV.plugins.WALDUR_CORE.PAT_ENABLED) {
    return false;
  }
  const user = getUser(state);
  return Boolean(
    user && (user.is_staff || user.can_use_personal_access_tokens),
  );
};

// Passkeys are inert unless an operator enabled one of the two flows, so the
// whole section is hidden rather than shown empty.
const arePasskeysEnabled = () => {
  const methods = ENV.plugins.WALDUR_CORE.AUTHENTICATION_METHODS ?? [];
  return methods.includes('PASSKEY_SIGNIN') || methods.includes('PASSKEY_MFA');
};

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
          !isFeatureVisible(UserFeatures.conceal_api_token) ||
          canUsePersonalAccessTokens(state) ||
          arePasskeysEnabled(),
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
    name: 'profile.resource-requests',
    url: 'resource-requests/',
    component: lazyComponent(() =>
      import('@/proposals/requests/ProfileResourceRequests').then((module) => ({
        default: module.ProfileResourceRequests,
      })),
    ),
    data: {
      breadcrumb: () => translate('Resource requests'),
      // Same gate as the Request button; with calls as the only way in there
      // is no offering page to request from.
      permissions: [() => isProposalRequestEnabled()],
      priority: 122,
    },
  },
  {
    // Marketplace-only deployments have no calls section, so a submitted
    // proposal would otherwise be untrackable. Everything personal already
    // lives here, next to Resource requests.
    name: 'profile.proposals',
    url: 'proposals/',
    component: lazyComponent(() =>
      import('@/proposals/proposal/UserProposalsList').then((module) => ({
        default: module.UserProposalsList,
      })),
    ),
    data: {
      breadcrumb: () => requestListTitle(),
      permissions: [() => !isCallsSectionVisible()],
      priority: 123,
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
      import('@/navigation/header/quick-issue-drawer/UserIssuesTable').then(
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
    params: {
      tab: { dynamic: true },
      section: { dynamic: true },
    },
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
      import('@/freeipa/FreeIPAAccount').then((module) => ({
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
    params: { filterState: null, filterAttention: false },
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
    name: 'profile-passkeys',
    url: 'passkeys/',
    component: lazyComponent(() =>
      import('./passkeys/PasskeysList').then((module) => ({
        default: module.PasskeysList,
      })),
    ),
    parent: 'profile-credentials',
    data: {
      breadcrumb: () => translate('Passkeys'),
      permissions: [() => arePasskeysEnabled()],
    },
  },
  {
    name: 'profile-personal-access-tokens',
    url: 'personal-access-tokens/',
    component: lazyComponent(() =>
      import('./personal-access-tokens/PersonalAccessTokensList').then(
        (module) => ({
          default: module.PersonalAccessTokensList,
        }),
      ),
    ),
    parent: 'profile-credentials',
    data: {
      breadcrumb: () => translate('Personal access tokens'),
      permissions: [canUsePersonalAccessTokens],
    },
  },

  {
    name: 'projects',
    url: '/projects/',
    component: lazyComponent(() =>
      import('@/user/affiliations/ProjectsList').then((module) => ({
        default: module.ProjectsList,
      })),
    ),
    parent: 'layout',
  },
  {
    name: 'organizations',
    url: '/organizations/',
    component: lazyComponent(() =>
      import('@/user/affiliations/OrganizationsList').then((module) => ({
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
    url: '/resources/:category_uuid/?organization&project',
    component: lazyComponent(() =>
      import('@/marketplace/resources/list/CategoryResourcesContainer').then(
        (module) => ({ default: module.CategoryResourcesContainer }),
      ),
    ),
    parent: 'layout',
  },
  {
    name: 'all-resources',
    url: '/all-resources/?organization&project',
    component: lazyComponent(() =>
      import('@/marketplace/resources/list/AllResourcesList').then(
        (module) => ({ default: module.AllResourcesList }),
      ),
    ),
    parent: 'layout',
  },
];
