import { StateDeclaration } from '@waldur/core/types';
import { CustomersDivisionsContainer } from '@waldur/customer/divisions/CustomersDivisionsContainer';
import { LazyCustomerList } from '@waldur/customer/list/LazyCustomerList';
import { OrganizationUpdateContainer } from '@waldur/customer/list/OrganizationUpdateContainer';
import { SupportCustomersContainer } from '@waldur/customer/list/SupportCustomersContainer';
import { SupportFeedback } from '@waldur/issues/feedback/SupportFeedback';
import { SupportIssues } from '@waldur/issues/SupportIssues';
import { FlowMapViewContainer } from '@waldur/providers/support/FlowMapViewContainer';
import { HeatMapContainer } from '@waldur/providers/support/HeatMapContainer';
import { SankeyDiagramContainer } from '@waldur/providers/support/SankeyDiagramContainer';
import { UserListView } from '@waldur/user/support/UserListView';
import { SUPPORT_WORKSPACE } from '@waldur/workspace/types';

import { IssueDetailsContainer } from './IssueDetailsContainer';
import { NotificationsList } from './notifications/NotificationsList';
import { checkPermission } from './utils';
import { IssuesDashboard } from './workspace/IssuesDashboard';
import { IssuesHelpdesk } from './workspace/IssuesHelpdesk';
import { SupportWorkspace } from './workspace/SupportWorkspace';

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
    component: LazyCustomerList,
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
