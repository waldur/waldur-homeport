import { UIView } from '@uirouter/react';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { StateDeclaration } from '@waldur/core/types';
import { fetchCustomer } from '@waldur/customer/workspace/CustomerWorkspace';
import { translate } from '@waldur/i18n';
import { ANONYMOUS_LAYOUT_ROUTE_CONFIG } from '@waldur/marketplace/constants';

const CallManagementDashboard = lazyComponent(
  () => import('./call-management/CallManagementDashboard'),
  'CallManagementDashboard',
);

const PublicCallsPage = lazyComponent(
  () => import('./PublicCallsPage'),
  'PublicCallsPage',
);

const PublicCallDetailsContainer = lazyComponent(
  () => import('./details/PublicCallDetailsContainer'),
  'PublicCallDetailsContainer',
);

const CallUpdateContainer = lazyComponent(
  () => import('./update/CallUpdateContainer'),
  'CallUpdateContainer',
);

const RoundPage = lazyComponent(() => import('./round/RoundPage'), 'RoundPage');

const ProposalCompletionPage = lazyComponent(
  () => import('./proposal/create/ProposalCompletionPage'),
  'ProposalCompletionPage',
);

const CallManagementPage = lazyComponent(
  () => import('./call-management/CallManagementPage'),
  'CallManagementPage',
);

export const states: StateDeclaration[] = [
  {
    name: 'call-management',
    url: '/call-management/:uuid/',
    parent: 'layout',
    component: UIView,
    abstract: true,
    data: {
      auth: true,
      title: () => translate('Call management'),
      hideProjectSelector: true,
      skipInitWorkspace: true,
    },
    resolve: [
      {
        token: 'fetchCustomer',
        resolveFn: fetchCustomer,
        deps: ['$transition$'],
      },
    ],
  },
  {
    name: 'call-management.dashboard',
    url: 'dashboard/',
    component: CallManagementDashboard,
    data: {
      breadcrumb: () => translate('Dashboard'),
      priority: 100,
      feature: 'marketplace.show_call_management_functionality',
    },
  },
  {
    name: 'call-management.call-list',
    url: 'calls/?{state}',
    component: CallManagementPage,
    data: {
      breadcrumb: () => translate('Calls'),
    },
  },
  {
    name: 'call-management.call-update',
    url: 'call/:call_uuid/',
    component: CallUpdateContainer,
  },
  {
    name: 'call-management.round-update',
    url: 'call/:call_uuid/round/:round_uuid/',
    component: RoundPage,
  },

  // Public calls
  {
    name: 'public-calls-user',
    url: 'calls/',
    component: PublicCallsPage,
    parent: 'profile',
    data: {
      hideProjectSelector: true,
    },
  },
  {
    name: 'public-calls',
    url: '/calls/',
    abstract: true,
    component: UIView,
    parent: 'public',
  },
  {
    name: 'public-calls.list-public',
    url: '',
    component: PublicCallsPage,
    data: {
      hideProjectSelector: true,
      ...ANONYMOUS_LAYOUT_ROUTE_CONFIG,
    },
  },
  {
    name: 'public-calls.details',
    url: ':uuid/',
    component: PublicCallDetailsContainer,
    data: {
      hideProjectSelector: true,
      ...ANONYMOUS_LAYOUT_ROUTE_CONFIG,
    },
  },
  {
    name: 'public-calls.manage-proposal',
    url: 'proposals/:proposal_uuid/',
    component: ProposalCompletionPage,
    data: {
      hideProjectSelector: true,
    },
  },
];
