import { UIView } from '@uirouter/react';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { StateDeclaration } from '@waldur/core/types';
import { translate } from '@waldur/i18n';
import { isStaffOrSupport } from '@waldur/workspace/selectors';
import { SUPPORT_WORKSPACE } from '@waldur/workspace/types';

import { hasSupport } from './hooks';

const CustomersDivisionsContainer = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "CustomersDivisionsContainer" */ '@waldur/customer/divisions/CustomersDivisionsContainer'
    ),
  'CustomersDivisionsContainer',
);
const CustomerListContainer = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "CustomerListContainer" */ '@waldur/customer/list/CustomerListContainer'
    ),
  'CustomerListContainer',
);
const PriceList = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "PriceList" */ '@waldur/marketplace/offerings/PriceList'
    ),
  'PriceList',
);
const CustomerRequestContainer = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "CustomerRequestContainer" */ '@waldur/marketplace-flows/CustomerRequestContainer'
    ),
  'CustomerRequestContainer',
);
const OrganizationUpdateContainer = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "OrganizationUpdateContainer" */ '@waldur/customer/list/OrganizationUpdateContainer'
    ),
  'OrganizationUpdateContainer',
);
const SupportCustomersContainer = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "SupportCustomersContainer" */ '@waldur/customer/list/SupportCustomersContainer'
    ),
  'SupportCustomersContainer',
);
const SupportProjectsList = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "SupportProjectsList" */ '@waldur/project/SupportProjectsList'
    ),
  'SupportProjectsList',
);
const SupportFeedback = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "SupportFeedback" */ '@waldur/issues/feedback/SupportFeedback'
    ),
  'SupportFeedback',
);
const SupportFeedbackListContainer = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "SupportFeedbackListContainer" */ '@waldur/issues/feedback/SupportFeedbackListContainer'
    ),
  'SupportFeedbackListContainer',
);
const SupportIssues = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "SupportIssues" */ '@waldur/issues/SupportIssues'
    ),
  'SupportIssues',
);
const FlowMapViewContainer = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "FlowMapViewContainer" */ '@waldur/providers/support/FlowMapViewContainer'
    ),
  'FlowMapViewContainer',
);
const HeatMapContainer = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "HeatMapContainer" */ '@waldur/providers/support/HeatMapContainer'
    ),
  'HeatMapContainer',
);
const SankeyDiagramContainer = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "SankeyDiagramContainer" */ '@waldur/providers/support/SankeyDiagramContainer'
    ),
  'SankeyDiagramContainer',
);
const UserListView = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "UserListView" */ '@waldur/user/support/UserListView'
    ),
  'UserListView',
);
const IssueDetailsContainer = lazyComponent(
  () => import(/* webpackChunkName: "IssueDetails" */ './IssueDetails'),
  'IssueDetails',
);
const BroadcastList = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "BroadcastList" */ './notifications/BroadcastList'
    ),
  'BroadcastList',
);
const FeaturesList = lazyComponent(
  () => import(/* webpackChunkName: "FeaturesList" */ './FeaturesList'),
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
      permissions: [isStaffOrSupport, hasSupport],
    },
  },

  {
    name: 'support.detail',
    url: 'issue/:uuid/',
    component: IssueDetailsContainer,
  },

  {
    name: 'support.list',
    url: 'list/',
    component: SupportIssues,
    data: {
      breadcrumb: () => translate('Issues'),
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
    component: CustomersDivisionsContainer,
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
    component: BroadcastList,
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
