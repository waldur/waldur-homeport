import { UIView } from '@uirouter/react';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { StateDeclaration } from '@waldur/core/types';
import { isFeatureVisible } from '@waldur/features/connect';
import { MarketplaceFeatures, SupportFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { UserManageContainer } from '@waldur/user/UserManageContainer';
import { isStaff, isStaffOrSupport } from '@waldur/workspace/selectors';

const AdministrationDashboard = lazyComponent(
  () => import('./dashboard/AdministrationDashboard'),
  'AdministrationDashboard',
);

const AdministrationBranding = lazyComponent(
  () => import('./settings/AdministrationBranding'),
  'AdministrationBranding',
);

const AdministrationServiceDesk = lazyComponent(
  () => import('./service-desk/AdministrationServiceDesk'),
  'AdministrationServiceDesk',
);

const FeaturesList = lazyComponent(
  () => import('./FeaturesList'),
  'FeaturesList',
);

const UserAgreementsList = lazyComponent(
  () => import('./agreements/UserAgreementsList'),
  'UserAgreementsList',
);

const CategoryGroupsList = lazyComponent(
  () => import('@waldur/marketplace/category/admin/CategoryGroupsList'),
  'CategoryGroupsList',
);

const AdminCategoriesPage = lazyComponent(
  () => import('@waldur/marketplace/category/admin/AdminCategoriesPage'),
  'AdminCategoriesPage',
);

const ProviderRobotAccountList = lazyComponent(
  () => import('@waldur/marketplace/robot-accounts/ProviderRobotAccountList'),
  'ProviderRobotAccountList',
);

const BasicLexisLinkList = lazyComponent(
  () => import('@waldur/marketplace/resources/lexis/BasicLexisLinkList'),
  'BasicLexisLinkList',
);

const UserList = lazyComponent(
  () => import('@waldur/user/support/UserList'),
  'UserList',
);

const UserManage = lazyComponent(
  () => import('@waldur/user/UserManage'),
  'UserManage',
);

const InvitationList = lazyComponent(
  () => import('./InvitationList'),
  'InvitationList',
);

const IdentityProvidersList = lazyComponent(
  () => import('./providers/IdentityProvidersList'),
  'IdentityProvidersList',
);

const RolesList = lazyComponent(() => import('./roles/RolesList'), 'RolesList');
const TokensList = lazyComponent(() => import('./TokensList'), 'TokensList');
const HooksList = lazyComponent(() => import('./hooks/HooksList'), 'HooksList');

const NotificationList = lazyComponent(
  () => import('./notifications/NotificationList'),
  'NotificationList',
);

const OrganizationGroupsList = lazyComponent(
  () => import('./organizations/OrganizationGroupsList'),
  'OrganizationGroupsList',
);

const OrganizationGroupTypesList = lazyComponent(
  () => import('./organizations/OrganizationGroupTypesList'),
  'OrganizationGroupTypesList',
);

const OrganizationCostPoliciesList = lazyComponent(
  () => import('./organizations/OrganizationCostPoliciesList'),
  'OrganizationCostPoliciesList',
);

const AdministrationLanguages = lazyComponent(
  () => import('./languages/AdministrationLanguages'),
  'AdministrationLanguages',
);

const OfferingUsersList = lazyComponent(
  () => import('./users/OfferingUsersList'),
  'OfferingUsersList',
);

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
    },
  },

  {
    name: 'admin.dashboard',
    url: '',
    component: AdministrationDashboard,
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
    name: 'admin-branding',
    url: 'branding/',
    parent: 'admin-settings',
    component: AdministrationBranding,
    data: {
      breadcrumb: () => translate('Branding'),
    },
  },

  {
    name: 'admin-languages',
    url: 'languages/',
    parent: 'admin-settings',
    component: AdministrationLanguages,
    data: {
      breadcrumb: () => translate('Languages'),
    },
  },

  {
    name: 'admin-service-desk',
    url: 'service-desk/',
    parent: 'admin-settings',
    component: AdministrationServiceDesk,
    data: {
      breadcrumb: () => translate('Service desk'),
    },
  },

  {
    name: 'admin-features',
    url: 'features/',
    parent: 'admin-settings',
    component: FeaturesList,
    data: {
      breadcrumb: () => translate('Features'),
    },
  },

  {
    name: 'admin-user-agreements',
    url: 'user-agreements/',
    parent: 'admin-settings',
    component: UserAgreementsList,
    data: {
      breadcrumb: () => translate('User agreements'),
    },
  },

  {
    name: 'admin-user-users',
    url: 'users/?role',
    parent: 'admin-accounts',
    component: UserList,
    data: {
      feature: SupportFeatures.users,
      breadcrumb: () => translate('Users'),
    },
  },
  {
    name: 'admin-user-user-manage-container',
    url: '',
    parent: 'admin-accounts',
    component: UserManageContainer,
    abstract: true,
    data: { skipBreadcrumb: true },
  },
  {
    name: 'admin-user-user-manage',
    url: 'users/:user_uuid/?tab',
    parent: 'admin-user-user-manage-container',
    component: UserManage,
    data: {
      feature: SupportFeatures.users,
    },
  },
  {
    name: 'admin-user-notifications',
    url: 'users/notifications/',
    parent: 'admin-accounts',
    component: HooksList,
    data: {
      breadcrumb: () => translate('Notifications'),
    },
  },
  {
    name: 'admin-user-active-sessions',
    url: 'users/active-sessions/',
    parent: 'admin-accounts',
    component: TokensList,
    data: {
      breadcrumb: () => translate('Active sessions'),
    },
  },
  {
    name: 'admin-user-robot-accounts',
    url: 'robot-accounts/',
    component: ProviderRobotAccountList,
    parent: 'admin-accounts',
    data: {
      breadcrumb: () => translate('Robot accounts'),
    },
  },
  {
    name: 'admin-user-offering-users',
    url: 'offering-users/',
    component: OfferingUsersList,
    parent: 'admin-accounts',
    data: {
      breadcrumb: () => translate('Offering users'),
    },
  },
  {
    name: 'admin-user-lexis-links-list',
    url: 'lexis-links/',
    component: BasicLexisLinkList,
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
    component: InvitationList,
    parent: 'admin-accounts',
    data: {
      breadcrumb: () => translate('Invitations'),
    },
  },

  {
    name: 'admin-marketplace-category-groups',
    url: 'category-groups',
    parent: 'admin-marketplace',
    component: CategoryGroupsList,
    data: {
      breadcrumb: () => translate('Category groups'),
    },
  },

  {
    name: 'admin-marketplace-categories',
    url: 'categories/',
    parent: 'admin-marketplace',
    component: AdminCategoriesPage,
    data: {
      breadcrumb: () => translate('Categories'),
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
    component: OrganizationGroupsList,
    data: {
      breadcrumb: () => translate('Organization groups'),
    },
  },
  {
    name: 'admin-organization-group-types-list',
    url: 'organization-group-types/',
    parent: 'admin-organizations',
    component: OrganizationGroupTypesList,
    data: {
      breadcrumb: () => translate('Organization group types'),
    },
  },
  {
    name: 'admin-organization-cost-policies',
    url: 'organization-cost-policies/',
    parent: 'admin-organizations',
    component: OrganizationCostPoliciesList,
    data: {
      breadcrumb: () => translate('Cost policies'),
      permissions: [isStaff],
    },
  },
  {
    name: 'admin-identity',
    url: 'identity/',
    parent: 'admin-settings',
    component: IdentityProvidersList,
    data: {
      breadcrumb: () => translate('Identity providers'),
    },
  },

  {
    name: 'admin-roles',
    url: 'roles/',
    parent: 'admin-settings',
    component: RolesList,
    data: {
      breadcrumb: () => translate('User roles'),
    },
  },

  {
    name: 'admin-notification-messages',
    url: 'notification-messages/',
    parent: 'admin-settings',
    component: NotificationList,
    data: {
      breadcrumb: () => translate('Notifications'),
    },
  },
];
