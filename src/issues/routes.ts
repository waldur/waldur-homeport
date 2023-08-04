import { UIView } from '@uirouter/react';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { StateDeclaration } from '@waldur/core/types';
import { translate } from '@waldur/i18n';
import { isStaffOrSupport } from '@waldur/workspace/selectors';
import { SUPPORT_WORKSPACE } from '@waldur/workspace/types';

import { hasSupport } from './hooks';

const CustomersOrganizationGroupsContainer = lazyComponent(
  () =>
    import(
      '@waldur/customer/organization-groups/CustomersOrganizationGroupsContainer'
    ),
  'CustomersOrganizationGroupsContainer',
);
const CustomerListContainer = lazyComponent(
  () => import('@waldur/customer/list/CustomerListContainer'),
  'CustomerListContainer',
);
const PriceList = lazyComponent(
  () => import('@waldur/marketplace/offerings/PriceList'),
  'PriceList',
);
const CustomerRequestContainer = lazyComponent(
  () => import('@waldur/marketplace-flows/CustomerRequestContainer'),
  'CustomerRequestContainer',
);
const OrganizationUpdateContainer = lazyComponent(
  () => import('@waldur/customer/list/OrganizationUpdateContainer'),
  'OrganizationUpdateContainer',
);
const SupportDashboard = lazyComponent(
  () => import('@waldur/support/dashboard/SupportDashboard'),
  'SupportDashboard',
);
const SupportFeedback = lazyComponent(
  () => import('@waldur/issues/feedback/SupportFeedback'),
  'SupportFeedback',
);
const SupportFeedbackListContainer = lazyComponent(
  () => import('@waldur/issues/feedback/SupportFeedbackListContainer'),
  'SupportFeedbackListContainer',
);
const SupportIssues = lazyComponent(
  () => import('@waldur/issues/SupportIssues'),
  'SupportIssues',
);
const IssueDetailsContainer = lazyComponent(
  () => import('./IssueDetails'),
  'IssueDetails',
);
const NotificationList = lazyComponent(
  () => import('../notifications/NotificationList'),
  'NotificationList',
);

export const states: StateDeclaration[] = [
  {
    name: 'support',
    url: '/support/',
    parent: 'layout',
    component: UIView,
    abstract: true,
    data: {
      auth: true,
      workspace: SUPPORT_WORKSPACE,
      title: () => translate('Support'),
      permissions: [isStaffOrSupport],
      hideProjectSelector: true,
    },
  },

  {
    name: 'support-dashboard',
    url: '',
    parent: 'support',
    component: SupportDashboard,
    data: {
      breadcrumb: () => translate('Dashboard'),
      priority: 100,
    },
  },

  {
    name: 'support.detail',
    url: 'issue/:issue_uuid/',
    component: IssueDetailsContainer,
    data: {
      permissions: [isStaffOrSupport, hasSupport],
    },
  },

  {
    name: 'support.list',
    url: 'list/?{status}',
    component: SupportIssues,
    data: {
      breadcrumb: () => translate('Issues'),
      permissions: [isStaffOrSupport, hasSupport],
    },
  },

  {
    name: 'supportFeedback',
    url: '/support/feedback/?token&evaluation',
    component: SupportFeedback,
    data: {
      permissions: [hasSupport],
    },
  },

  {
    name: 'support.feedback',
    url: 'feedback/',
    component: SupportFeedbackListContainer,
    data: {
      breadcrumb: () => translate('Feedback'),
      permissions: [isStaffOrSupport, hasSupport],
    },
  },

  {
    name: 'reporting.organizations',
    url: 'organizations/',
    component: CustomerListContainer,
    data: {
      feature: 'support.customers_list',
      breadcrumb: () => translate('Monthly revenue'),
    },
  },

  {
    name: 'reporting.pricelist',
    url: 'pricelist/',
    component: PriceList,
    data: {
      feature: 'support.pricelist',
      breadcrumb: () => translate('Pricelist'),
    },
  },

  {
    name: 'support.customers-requests',
    url: 'customers-requests/',
    component: CustomerRequestContainer,
    data: {
      feature: 'support.customers_requests',
      breadcrumb: () => translate('Organization requests'),
    },
  },

  {
    name: 'reporting.organizations-divisions',
    url: 'organizations-divisions/',
    component: CustomersOrganizationGroupsContainer,
    data: {
      feature: 'support.customers_list',
      breadcrumb: () => translate('Organization groups'),
    },
  },

  {
    name: 'support.customer-update',
    url: 'customer-update/:customer_uuid/',
    component: OrganizationUpdateContainer,
    data: {
      feature: 'support.customers_list',
    },
  },

  {
    name: 'support.broadcast',
    url: 'broadcast/',
    component: NotificationList,
    data: {
      breadcrumb: () => translate('Broadcast'),
    },
  },
];
