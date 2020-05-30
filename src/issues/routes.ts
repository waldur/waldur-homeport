import { StateDeclaration } from '@waldur/core/types';
import { LazyCustomerList } from '@waldur/customer/list/LazyCustomerList';
import { gettext } from '@waldur/i18n';
import { FlowMapViewContainer } from '@waldur/providers/support/FlowMapViewContainer';
import { HeatMapContainer } from '@waldur/providers/support/HeatMapContainer';
import { SankeyDiagramContainer } from '@waldur/providers/support/SankeyDiagramContainer';
import { withStore } from '@waldur/store/connect';
import { UserListView } from '@waldur/user/support/UserListView';

import { WOKSPACE_NAMES } from '../navigation/workspace/constants';

import { IssueDetailsContainer } from './IssueDetailsContainer';
import { checkPermission } from './utils';
import { IssuesDashboard } from './workspace/IssuesDashboard';
import { IssuesHelpdesk } from './workspace/IssuesHelpdesk';
import { SupportWorkspace } from './workspace/SupportWorkspace';

export const states: StateDeclaration[] = [
  {
    name: 'support',
    url: '/support/',
    component: withStore(SupportWorkspace),
    abstract: true,
    data: {
      auth: true,
      workspace: WOKSPACE_NAMES.support,
      pageClass: 'gray-bg',
    },
  },

  {
    name: 'support.dashboard',
    url: '',
    component: withStore(IssuesDashboard),
    data: {
      pageTitle: gettext('Support dashboard'),
      hideBreadcrumbs: true,
      feature: 'support',
    },
  },

  {
    name: 'support.helpdesk',
    url: 'helpdesk/',
    component: withStore(IssuesHelpdesk),
    data: {
      pageTitle: gettext('Helpdesk dashboard'),
      feature: 'support',
    },
  },

  {
    name: 'support.detail',
    url: 'issue/:uuid/',
    component: withStore(IssueDetailsContainer),
    data: {
      pageTitle: gettext('Request detail'),
      feature: 'support',
    },
  },

  {
    name: 'support.list',
    url: 'list/',
    template:
      '<div class="ibox"><div class="ibox-content"><issues-list filter="{}"></issues-list></div></div>',
    data: {
      pageTitle: gettext('Support requests'),
      feature: 'support',
    },
  },

  {
    name: 'support.organizations',
    url: 'organizations/',
    component: withStore(LazyCustomerList),
    data: {
      feature: 'support.organizations',
      pageTitle: gettext('Financial overview'),
    },
    resolve: {
      permission: checkPermission,
    },
  },

  {
    name: 'support.users',
    url: 'users/',
    component: withStore(UserListView),
    data: {
      pageTitle: gettext('Users'),
      feature: 'support.users',
    },
    resolve: {
      permission: checkPermission,
    },
  },

  {
    name: 'support.flowmap',
    url: 'flowmap/',
    component: withStore(FlowMapViewContainer),
    data: {
      pageTitle: gettext('Flowmap'),
      feature: 'support.flowmap',
    },
    resolve: {
      permission: checkPermission,
    },
  },

  {
    name: 'support.heatmap',
    url: 'heatmap/',
    component: withStore(HeatMapContainer),
    data: {
      pageTitle: gettext('Heatmap'),
      feature: 'support.heatmap',
    },
    resolve: {
      permission: checkPermission,
    },
  },

  {
    name: 'support.sankey-diagram',
    url: 'sankey-diagram/',
    component: withStore(SankeyDiagramContainer),
    data: {
      pageTitle: gettext('Sankey diagram'),
      feature: 'support.sankey-diagram',
    },
    resolve: {
      permission: checkPermission,
    },
  },
];

export default function registerRoutes($stateProvider) {
  states.forEach(({ name, ...rest }) => $stateProvider.state(name, rest));
}
registerRoutes.$inject = ['$stateProvider'];
