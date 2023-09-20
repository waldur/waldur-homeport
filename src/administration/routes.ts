import { UIView } from '@uirouter/react';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { StateDeclaration } from '@waldur/core/types';
import { translate } from '@waldur/i18n';
import { isStaffOrSupport } from '@waldur/workspace/selectors';

const AdministrationDashboard = lazyComponent(
  () => import('./dashboard/AdministrationDashboard'),
  'AdministrationDashboard',
);

const AdministrationBranding = lazyComponent(
  () => import('./branding/AdministrationBranding'),
  'AdministrationBranding',
);

const FeaturesList = lazyComponent(
  () => import('./FeaturesList'),
  'FeaturesList',
);

const SupportCustomersContainer = lazyComponent(
  () => import('@waldur/customer/list/SupportCustomersContainer'),
  'SupportCustomersContainer',
);
const SupportProjectsList = lazyComponent(
  () => import('@waldur/project/SupportProjectsList'),
  'SupportProjectsList',
);

const UserList = lazyComponent(
  () => import('@waldur/user/support/UserList'),
  'UserList',
);

const IdentityProvidersList = lazyComponent(
  () => import('./providers/IdentityProvidersList'),
  'IdentityProvidersList',
);

const RolesList = lazyComponent(() => import('./roles/RolesList'), 'RolesList');
const TokensList = lazyComponent(() => import('./TokensList'), 'TokensList');

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
      hideProjectSelector: true,
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
    name: 'admin-users',
    parent: 'admin',
    abstract: true,
    component: UIView,
    url: '',
    data: {
      breadcrumb: () => translate('Users'),
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
    name: 'admin-features',
    url: 'features/',
    parent: 'admin-settings',
    component: FeaturesList,
    data: {
      breadcrumb: () => translate('Features'),
    },
  },

  {
    name: 'admin-user-users',
    url: 'users/?role',
    parent: 'admin-users',
    component: UserList,
    data: {
      feature: 'support.users',
      breadcrumb: () => translate('Users'),
    },
  },
  {
    name: 'admin-user-active-sessions',
    url: 'users/active-sessions/',
    parent: 'admin-users',
    component: TokensList,
    data: {
      breadcrumb: () => translate('Active sessions'),
    },
  },
  {
    name: 'admin.customers',
    url: 'customers/',
    component: SupportCustomersContainer,
    data: {
      feature: 'support.customers_list',
      breadcrumb: () => translate('Organizations'),
    },
  },

  {
    name: 'admin.projects',
    url: 'projects/',
    component: SupportProjectsList,
    data: {
      breadcrumb: () => translate('Projects'),
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
];
