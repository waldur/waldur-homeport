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
const SupportCustomersContainer = lazyComponent(
  () => import('@waldur/customer/list/SupportCustomersContainer'),
  'SupportCustomersContainer',
);
const SupportProjectsList = lazyComponent(
  () => import('@waldur/project/SupportProjectsList'),
  'SupportProjectsList',
);
const SupportOfferingsContainer = lazyComponent(
  () =>
    import('@waldur/marketplace/offerings/support/SupportOfferingsContainer'),
  'SupportOfferingsContainer',
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
const FlowMapViewContainer = lazyComponent(
  () => import('@waldur/providers/support/FlowMapViewContainer'),
  'FlowMapViewContainer',
);
const HeatMapContainer = lazyComponent(
  () => import('@waldur/providers/support/HeatMapContainer'),
  'HeatMapContainer',
);
const SankeyDiagramContainer = lazyComponent(
  () => import('@waldur/providers/support/SankeyDiagramContainer'),
  'SankeyDiagramContainer',
);
const UserListView = lazyComponent(
  () => import('@waldur/user/support/UserListView'),
  'UserListView',
);
const IssueDetailsContainer = lazyComponent(
  () => import('./IssueDetails'),
  'IssueDetails',
);
const NotificationList = lazyComponent(
  () => import('../notifications/NotificationList'),
  'NotificationList',
);
const FeaturesList = lazyComponent(
  () => import('./FeaturesList'),
  'FeaturesList',
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
    },
  },

  {
    name: 'support.detail',
    url: 'issue/:uuid/',
    component: IssueDetailsContainer,
    data: {
      permissions: [isStaffOrSupport, hasSupport],
    },
  },

  {
    name: 'support.list',
    url: 'list/',
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
      breadcrumb: () => translate('Financial'),
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
      breadcrumb: () => translate('Organizations'),
    },
  },

  {
    name: 'admin.users',
    url: 'users/',
    component: UserListView,
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
    name: 'support.customer-update',
    url: 'customer-update/:customer_uuid/',
    component: OrganizationUpdateContainer,
    data: {
      feature: 'support.customers_list',
    },
  },

  {
    name: 'marketplace-support-offerings',
    url: 'offerings/',
    component: SupportOfferingsContainer,
    parent: 'support',
    data: {
      breadcrumb: () => translate('Offerings'),
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
    name: 'support.flowmap',
    url: 'flowmap/',
    component: FlowMapViewContainer,
    data: {
      feature: 'support.flowmap',
    },
  },

  {
    name: 'support.heatmap',
    url: 'heatmap/',
    component: HeatMapContainer,
    data: {
      feature: 'support.heatmap',
    },
  },

  {
    name: 'support.sankey-diagram',
    url: 'sankey-diagram/',
    component: SankeyDiagramContainer,
    data: {
      feature: 'support.sankey_diagram',
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

  {
    name: 'admin.features',
    url: 'features/',
    component: FeaturesList,
    data: {
      breadcrumb: () => translate('Features'),
    },
  },
];
