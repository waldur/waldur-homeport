import { UIView } from '@uirouter/react';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { StateDeclaration } from '@waldur/core/types';
import { fetchCustomer } from '@waldur/customer/workspace/CustomerWorkspace';
import { MarketplaceFeatures } from '@waldur/FeaturesEnums';
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

const ProposalManagePage = lazyComponent(
  () => import('./proposal/create/ProposalManagePage'),
  'ProposalManagePage',
);

const ProposalDetailsContainer = lazyComponent(
  () => import('./proposal/ProposalDetailsContainer'),
  'ProposalDetailsContainer',
);

const CallManagementPage = lazyComponent(
  () => import('./call-management/CallManagementPage'),
  'CallManagementPage',
);

const CustomerProposalsList = lazyComponent(
  () => import('./proposal/CustomerProposalsList'),
  'CustomerProposalsList',
);

const ProposalReviewCreatePage = lazyComponent(
  () => import('./proposal/create-review/ProposalReviewCreatePage'),
  'ProposalReviewCreatePage',
);

const CustomerReviewsList = lazyComponent(
  () => import('./review/CustomerReviewsList'),
  'CustomerReviewsList',
);

const UserProposalsList = lazyComponent(
  () => import('./proposal/UserProposalsList'),
  'UserProposalsList',
);

const UserReviewsList = lazyComponent(
  () => import('./review/UserReviewsList'),
  'UserReviewsList',
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
      feature: MarketplaceFeatures.show_call_management_functionality,
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
    name: 'call-management.proposal-list',
    url: 'proposals/?{state}',
    component: CustomerProposalsList,
    data: {
      breadcrumb: () => translate('Proposals'),
    },
  },
  {
    name: 'call-management.review-list',
    url: 'reviews/?{state}',
    component: CustomerReviewsList,
    data: {
      breadcrumb: () => translate('Reviews'),
    },
  },
  {
    name: 'call-management.proposal-details',
    url: 'proposals/:proposal_uuid/',
    component: ProposalDetailsContainer,
  },
  {
    name: 'protected-call',
    url: 'call/:call_uuid/',
    abstract: true,
    component: UIView,
    parent: 'call-management',
  },
  {
    name: 'protected-call.main',
    url: '',
    component: CallUpdateContainer,
  },
  {
    name: 'protected-call.round',
    url: 'round/:round_uuid/',
    component: RoundPage,
  },
  {
    name: 'proposal-review',
    url: 'review/:review_uuid/',
    component: ProposalReviewCreatePage,
    parent: 'call-management',
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
    component: ProposalManagePage,
    data: {
      hideProjectSelector: true,
    },
  },

  {
    name: 'profile-proposals',
    url: 'user-proposals/',
    component: UserProposalsList,
    parent: 'profile-calls',
    data: {
      feature: MarketplaceFeatures.show_call_management_functionality,
      breadcrumb: () => translate('Proposals'),
    },
  },
  {
    name: 'profile-reviews',
    url: 'user-reviews/',
    component: UserReviewsList,
    parent: 'profile-calls',
    data: {
      feature: MarketplaceFeatures.show_call_management_functionality,
      breadcrumb: () => translate('Reviews'),
    },
  },
];
