import { UIView } from '@uirouter/react';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { StateDeclaration } from '@waldur/core/types';
import { isFeatureVisible } from '@waldur/features/connect';
import {
  InvitationsFeatures,
  MarketplaceFeatures,
} from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { isStaff, isStaffOrSupport } from '@waldur/workspace/selectors';

export const states: StateDeclaration[] = [
  {
    name: 'admin',
    url: '/administration/',
    abstract: true,
    parent: 'layout',
    component: UIView,
    data: {
      title: () => translate('Administration'),
      permissions: [isStaffOrSupport],
      workspace: 'admin',
    },
  },

  {
    name: 'admin.dashboard',
    url: '',
    component: lazyComponent(() =>
      import('./dashboard/AdministrationDashboard').then((module) => ({
        default: module.AdministrationDashboard,
      })),
    ),
    data: {
      breadcrumb: () => translate('Dashboard'),
      priority: 100,
    },
  },
  {
    name: 'admin-marketplace',
    parent: 'admin',
    abstract: true,
    component: UIView,
    url: '',
    data: {
      breadcrumb: () => translate('Marketplace'),
    },
  },

  {
    name: 'admin-settings',
    parent: 'admin',
    abstract: true,
    component: UIView,
    url: '',
    data: {
      breadcrumb: () => translate('Settings'),
    },
  },

  {
    name: 'admin-service-desk',
    parent: 'admin',
    abstract: true,
    component: UIView,
    url: '',
    data: {
      breadcrumb: () => translate('Service desk'),
    },
  },

  {
    name: 'admin-accounts',
    parent: 'admin',
    abstract: true,
    component: UIView,
    url: '',
    data: {
      breadcrumb: () => translate('Accounts'),
    },
  },

  {
    name: 'admin-system-info',
    url: 'system-info/',
    parent: 'admin-settings',
    component: lazyComponent(() =>
      import('./SystemInfoPage').then((module) => ({
        default: module.SystemInfoPage,
      })),
    ),
    data: {
      breadcrumb: () => translate('System info'),
    },
  },

  {
    name: 'admin-announcements',
    url: 'announcements/',
    parent: 'admin-settings',
    component: lazyComponent(() =>
      import('./announcements/AnnouncementsList').then((module) => ({
        default: module.AnnouncementsList,
      })),
    ),
    data: {
      breadcrumb: () => translate('Announcements'),
    },
  },

  {
    name: 'admin-celery-info',
    url: 'celery-info/',
    parent: 'admin-settings',
    component: lazyComponent(() =>
      import('./CeleryInfoPage').then((module) => ({
        default: module.CeleryInfoPage,
      })),
    ),
    data: {
      breadcrumb: () => translate('Celery info'),
    },
  },

  {
    name: 'admin-branding',
    url: 'branding/',
    parent: 'admin-settings',
    component: lazyComponent(() =>
      import('./settings/AdministrationBranding').then((module) => ({
        default: module.AdministrationBranding,
      })),
    ),
    data: {
      breadcrumb: () => translate('Branding'),
    },
  },

  {
    name: 'admin-languages',
    url: 'languages/',
    parent: 'admin-settings',
    component: lazyComponent(() =>
      import('./languages/AdministrationLanguages').then((module) => ({
        default: module.AdministrationLanguages,
      })),
    ),
    data: {
      breadcrumb: () => translate('Languages'),
    },
  },

  {
    name: 'admin-integration-settings',
    url: 'integration-settings/',
    parent: 'admin-service-desk',
    component: lazyComponent(() =>
      import('./service-desk/AdministrationServiceDesk').then((module) => ({
        default: module.AdministrationServiceDesk,
      })),
    ),
    data: {
      breadcrumb: () => translate('Integration settings'),
    },
  },

  {
    name: 'admin-issue-templates',
    url: 'issue-templates/',
    parent: 'admin-service-desk',
    component: lazyComponent(() =>
      import(
        './service-desk/issue-templates/AdministrationIssueTemplatesList'
      ).then((module) => ({
        default: module.AdministrationIssueTemplatesList,
      })),
    ),
    data: {
      breadcrumb: () => translate('Issue templates'),
    },
  },

  {
    name: 'admin-marketplace-settings',
    url: 'marketplace/',
    parent: 'admin-settings',
    component: lazyComponent(() =>
      import('./marketplace/AdministrationMarketplace').then((module) => ({
        default: module.AdministrationMarketplace,
      })),
    ),
    data: {
      breadcrumb: () => translate('Marketplace'),
    },
  },

  {
    name: 'admin-telemetry-settings',
    url: 'telemetry/',
    parent: 'admin-settings',
    component: lazyComponent(() =>
      import('./telemetry/AdministrationTelemetry').then((module) => ({
        default: module.AdministrationTelemetry,
      })),
    ),
    data: {
      breadcrumb: () => translate('Telemetry'),
    },
  },
  {
    name: 'admin-custom-scripts-settings',
    url: 'custom-scripts/',
    parent: 'admin-settings',
    component: lazyComponent(() =>
      import('./custom-scripts/AdministrationCustomScripts').then((module) => ({
        default: module.AdministrationCustomScripts,
      })),
    ),
    data: {
      breadcrumb: () => translate('Custom Scripts'),
    },
  },

  {
    name: 'admin-features',
    url: 'features/',
    parent: 'admin-settings',
    component: lazyComponent(() =>
      import('./FeaturesList').then((module) => ({
        default: module.FeaturesList,
      })),
    ),
    data: {
      breadcrumb: () => translate('Features'),
    },
  },

  {
    name: 'admin-user-agreements',
    url: 'user-agreements/',
    parent: 'admin-settings',
    component: lazyComponent(() =>
      import('./agreements/UserAgreementsList').then((module) => ({
        default: module.UserAgreementsList,
      })),
    ),
    data: {
      breadcrumb: () => translate('User agreements'),
    },
  },

  {
    name: 'admin-user-users',
    url: 'users/?role',
    parent: 'admin-accounts',
    component: lazyComponent(() =>
      import('@waldur/user/support/UserList').then((module) => ({
        default: module.UserList,
      })),
    ),
    data: {
      breadcrumb: () => translate('Users'),
    },
  },
  {
    name: 'admin-user-user-manage-container',
    url: '',
    parent: 'admin-accounts',
    component: lazyComponent(() =>
      import('@waldur/user/UserManageContainer').then((module) => ({
        default: module.UserManageContainer,
      })),
    ),
    abstract: true,
    data: { skipBreadcrumb: true },
  },
  {
    name: 'admin-user-user-manage',
    url: 'users/:user_uuid/?tab',
    parent: 'admin-user-user-manage-container',
    component: lazyComponent(() =>
      import('@waldur/user/UserManage').then((module) => ({
        default: module.UserManage,
      })),
    ),
  },
  {
    name: 'admin-user-notifications',
    url: 'users/notifications/',
    parent: 'admin-accounts',
    component: lazyComponent(() =>
      import('./hooks/HooksList').then((module) => ({
        default: module.HooksList,
      })),
    ),
    data: {
      breadcrumb: () => translate('Notifications'),
    },
  },
  {
    name: 'admin-user-active-sessions',
    url: 'users/active-sessions/',
    parent: 'admin-accounts',
    component: lazyComponent(() =>
      import('./TokensList').then((module) => ({ default: module.TokensList })),
    ),
    data: {
      breadcrumb: () => translate('Active sessions'),
    },
  },
  {
    name: 'admin-user-freeipa-users',
    url: 'freeipa-users/',
    parent: 'admin-accounts',
    component: lazyComponent(() =>
      import('./users/FreeIPAUsersList').then((module) => ({
        default: module.FreeIPAUsersList,
      })),
    ),
    data: {
      breadcrumb: () => translate('FreeIPA users'),
    },
  },
  {
    name: 'admin-user-robot-accounts',
    url: 'robot-accounts/',
    component: lazyComponent(() =>
      import(
        '@waldur/marketplace/robot-accounts/ProviderRobotAccountList'
      ).then((module) => ({ default: module.ProviderRobotAccountList })),
    ),
    parent: 'admin-accounts',
    data: {
      breadcrumb: () => translate('Robot accounts'),
    },
  },
  {
    name: 'admin-user-offering-users',
    url: 'offering-users/',
    component: lazyComponent(() =>
      import('./users/OfferingUsersList').then((module) => ({
        default: module.OfferingUsersList,
      })),
    ),
    parent: 'admin-accounts',
    data: {
      breadcrumb: () => translate('Offering users'),
    },
  },
  {
    name: 'admin-user-lexis-links-list',
    url: 'lexis-links/',
    component: lazyComponent(() =>
      import('@waldur/marketplace/resources/lexis/BasicLexisLinkList').then(
        (module) => ({ default: module.BasicLexisLinkList }),
      ),
    ),
    parent: 'admin-accounts',
    data: {
      breadcrumb: () => translate('LEXIS links'),
      permissions: [
        () => {
          if (isFeatureVisible(MarketplaceFeatures.lexis_links)) {
            return true;
          }
        },
      ],
    },
  },

  {
    name: 'admin-invitations',
    url: 'invitations/',
    component: lazyComponent(() =>
      import('./InvitationList').then((module) => ({
        default: module.InvitationList,
      })),
    ),
    parent: 'admin-accounts',
    data: {
      breadcrumb: () => translate('Invitations'),
    },
  },

  {
    name: 'admin-service-accounts',
    url: 'service-accounts/?tab',
    parent: 'admin-accounts',
    component: lazyComponent(() =>
      import('./service-accounts/ServiceAccountsTable').then((module) => ({
        default: module.ServiceAccountsTable,
      })),
    ),
    data: {
      breadcrumb: () => translate('Service accounts'),
      feature: InvitationsFeatures.show_service_accounts,
    },
  },

  {
    name: 'admin-marketplace-category-groups',
    url: 'category-groups',
    parent: 'admin-marketplace',
    component: lazyComponent(() =>
      import('@waldur/marketplace/category/admin/CategoryGroupsList').then(
        (module) => ({ default: module.CategoryGroupsList }),
      ),
    ),
    data: {
      breadcrumb: () => translate('Category groups'),
    },
  },

  {
    name: 'admin-marketplace-categories',
    url: 'categories/',
    parent: 'admin-marketplace',
    component: lazyComponent(() =>
      import('@waldur/marketplace/category/admin/AdminCategoriesPage').then(
        (module) => ({ default: module.AdminCategoriesPage }),
      ),
    ),
    data: {
      breadcrumb: () => translate('Categories'),
    },
  },

  {
    name: 'admin-marketplace-remote-sync',
    url: 'remote-offering-sync/',
    parent: 'admin-marketplace',
    component: lazyComponent(() =>
      import('./remote-offering-sync/RemoteOfferingSyncList').then(
        (module) => ({ default: module.RemoteOfferingSyncList }),
      ),
    ),
    data: {
      breadcrumb: () => translate('Remote offering sync'),
    },
  },

  {
    name: 'admin-organizations',
    parent: 'admin',
    abstract: true,
    component: UIView,
    url: '',
    data: {
      breadcrumb: () => translate('Organizations'),
    },
  },
  {
    name: 'admin-organizations-group-list',
    url: 'organization-groups/',
    parent: 'admin-organizations',
    component: lazyComponent(() =>
      import('./organizations/OrganizationGroupsList').then((module) => ({
        default: module.OrganizationGroupsList,
      })),
    ),
    data: {
      breadcrumb: () => translate('Organization groups'),
    },
  },
  {
    name: 'admin-organization-cost-policies',
    url: 'organization-cost-policies/',
    parent: 'admin-organizations',
    component: lazyComponent(() =>
      import('./organizations/OrganizationCostPoliciesList').then((module) => ({
        default: module.OrganizationCostPoliciesList,
      })),
    ),
    data: {
      breadcrumb: () => translate('Cost policies'),
      permissions: [isStaff],
    },
  },
  {
    name: 'admin-organization-credit-management',
    url: 'organization-credits/',
    parent: 'admin-organizations',
    component: lazyComponent(() =>
      import('./organizations/OrganizationCreditsList').then((module) => ({
        default: module.OrganizationCreditsList,
      })),
    ),
    data: {
      breadcrumb: () => translate('Credit management'),
      permissions: [isStaff],
    },
  },

  {
    name: 'admin-identity',
    url: 'identity/',
    parent: 'admin-settings',
    component: lazyComponent(() =>
      import('./providers/IdentityProvidersList').then((module) => ({
        default: module.IdentityProvidersList,
      })),
    ),
    data: {
      breadcrumb: () => translate('Identity providers'),
    },
  },

  {
    name: 'admin-roles',
    url: 'roles/',
    parent: 'admin-settings',
    component: lazyComponent(() =>
      import('./roles/RolesList').then((module) => ({
        default: module.RolesList,
      })),
    ),
    data: {
      breadcrumb: () => translate('User roles'),
    },
  },

  {
    name: 'admin-notification-messages',
    url: 'notification-messages/',
    parent: 'admin-settings',
    component: lazyComponent(() =>
      import('./notifications/NotificationList').then((module) => ({
        default: module.NotificationList,
      })),
    ),
    data: {
      breadcrumb: () => translate('Notifications'),
    },
  },
];
