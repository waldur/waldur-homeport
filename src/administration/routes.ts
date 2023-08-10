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
    name: 'admin.branding',
    url: 'branding/',
    component: AdministrationBranding,
    data: {
      breadcrumb: () => translate('Branding'),
    },
  },

  {
    name: 'admin.features',
    url: 'features/',
    component: FeaturesList,
    data: {
      breadcrumb: () => translate('Features'),
    },
  },

  {
    name: 'admin.users',
    url: 'users/?role',
    component: UserList,
    data: {
      feature: 'support.users',
      breadcrumb: () => translate('Users'),
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
    name: 'admin.identity',
    url: 'identity/',
    component: IdentityProvidersList,
    data: {
      breadcrumb: () => translate('Identity providers'),
    },
  },
];
