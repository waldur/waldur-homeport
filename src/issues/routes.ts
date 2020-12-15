import { lazyComponent } from '@waldur/core/lazyComponent';
import { StateDeclaration } from '@waldur/core/types';
import { SUPPORT_WORKSPACE } from '@waldur/workspace/types';

import { checkPermission } from './utils';

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
const SupportFeedback = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "SupportFeedback" */ '@waldur/issues/feedback/SupportFeedback'
    ),
  'SupportFeedback',
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
const NotificationsList = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "NotificationsList" */ './notifications/NotificationsList'
    ),
  'NotificationsList',
);
const IssuesDashboard = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "IssuesDashboard" */ './workspace/IssuesDashboard'
    ),
  'IssuesDashboard',
);
const IssuesHelpdesk = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "IssuesHelpdesk" */ './workspace/IssuesHelpdesk'
    ),
  'IssuesHelpdesk',
);
const SupportWorkspace = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "SupportWorkspace" */ './workspace/SupportWorkspace'
    ),
  'SupportWorkspace',
);

export const states: StateDeclaration[] = [
  {
    name: 'support',
    url: '/support/',
    component: SupportWorkspace,
    abstract: true,
    data: {
      auth: true,
      workspace: SUPPORT_WORKSPACE,
      pageClass: 'gray-bg',
    },
  },

  {
    name: 'support.dashboard',
    url: '',
    component: IssuesDashboard,
    data: {
      hideBreadcrumbs: true,
      feature: 'support',
    },
  },

  {
    name: 'support.helpdesk',
    url: 'helpdesk/',
    component: IssuesHelpdesk,
    data: {
      feature: 'support',
    },
  },

  {
    name: 'support.detail',
    url: 'issue/:uuid/',
    component: IssueDetailsContainer,
    data: {
      feature: 'support',
    },
  },

  {
    name: 'support.list',
    url: 'list/',
    component: SupportIssues,
    data: {
      feature: 'support',
    },
  },

  {
    name: 'supportFeedback',
    url: '/support/feedback/?token&evaluation',
    component: SupportFeedback,
    data: {
      feature: 'support',
      bodyClass: 'old',
    },
  },

  {
    name: 'support.organizations',
    url: 'organizations/',
    component: CustomerListContainer,
    data: {
      feature: 'support.organizations',
    },
    resolve: {
      permission: checkPermission,
    },
  },

  {
    name: 'support.organizations-divisions',
    url: 'organizations-divisions/',
    component: CustomersDivisionsContainer,
    data: {
      feature: 'support.organizations',
    },
    resolve: {
      permission: checkPermission,
    },
  },

  {
    name: 'support.users',
    url: 'users/',
    component: UserListView,
    data: {
      feature: 'support.users',
    },
    resolve: {
      permission: checkPermission,
    },
  },

  {
    name: 'support.customers',
    url: 'customers/',
    component: SupportCustomersContainer,
    data: {
      feature: 'support.organizations',
    },
    resolve: {
      permission: checkPermission,
    },
  },

  {
    name: 'support.customer-update',
    url: 'customer-update/:customer_uuid/',
    component: OrganizationUpdateContainer,
    data: {
      feature: 'support.organizations',
      pageClass: 'white-bg',
    },
    resolve: {
      permission: checkPermission,
    },
  },

  {
    name: 'support.flowmap',
    url: 'flowmap/',
    component: FlowMapViewContainer,
    data: {
      feature: 'support.flowmap',
    },
    resolve: {
      permission: checkPermission,
    },
  },

  {
    name: 'support.heatmap',
    url: 'heatmap/',
    component: HeatMapContainer,
    data: {
      feature: 'support.heatmap',
    },
    resolve: {
      permission: checkPermission,
    },
  },

  {
    name: 'support.sankey-diagram',
    url: 'sankey-diagram/',
    component: SankeyDiagramContainer,
    data: {
      feature: 'support.sankey-diagram',
    },
    resolve: {
      permission: checkPermission,
    },
  },

  {
    name: 'support.notifications',
    url: 'notifications/',
    component: NotificationsList,
    resolve: {
      permission: checkPermission,
    },
  },
];
