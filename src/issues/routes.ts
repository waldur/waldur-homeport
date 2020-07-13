import { StateDeclaration } from '@waldur/core/types';
import { LazyCustomerList } from '@waldur/customer/list/LazyCustomerList';
import { SupportIssues } from '@waldur/issues/SupportIssues';
import { FlowMapViewContainer } from '@waldur/providers/support/FlowMapViewContainer';
import { HeatMapContainer } from '@waldur/providers/support/HeatMapContainer';
import { SankeyDiagramContainer } from '@waldur/providers/support/SankeyDiagramContainer';
import { UserListView } from '@waldur/user/support/UserListView';
import { SUPPORT_WORKSPACE } from '@waldur/workspace/types';

import { IssueDetailsContainer } from './IssueDetailsContainer';
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
];
