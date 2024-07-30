import { UIView } from '@uirouter/react';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { StateDeclaration } from '@waldur/core/types';
import { fetchCustomer } from '@waldur/customer/workspace/CustomerWorkspace';
import { MarketplaceFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { ANONYMOUS_LAYOUT_ROUTE_CONFIG } from '@waldur/marketplace/constants';
import { OrganizationUIView } from '@waldur/organization/OrganizationUIView';

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
const PublicCallDetails = lazyComponent(
  () => import('./details/PublicCallDetails'),
  'PublicCallDetails',
);

const CallUpdateContainer = lazyComponent(
  () => import('./update/CallUpdateContainer'),
  'CallUpdateContainer',
);

const RoundUIView = lazyComponent(
  () => import('./round/RoundUIView'),
  'RoundUIView',
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

const CallsForProposals = lazyComponent(
  () => import('./CallsForProposals'),
  'CallsForProposals',
);

const CallsAvailableOfferingsPage = lazyComponent(
  () => import('./CallsAvailableOfferingsPage'),
  'CallsAvailableOfferingsPage',
);

export const states: StateDeclaration[] = [
  {
    name: 'call-management',
    url: '/call-management/:uuid/',
    parent: 'layout',
    component: OrganizationUIView,
    abstract: true,
    data: {
      auth: true,
      title: () => translate('Call management'),
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
    url: '/call/:call_uuid/',
    abstract: true,
    component: UIView,
    parent: 'layout',
  },
  {
    name: 'protected-call.main',
    url: 'edit/?tab',
    component: CallUpdateContainer,
  },

  {
    name: 'protected-call-round',
    url: '',
    abstract: true,
    parent: 'protected-call',
    component: RoundUIView,
  },
  {
    name: 'protected-call-round.details',
    url: 'round/:round_uuid/?tab',
    component: RoundPage,
  },
  {
    name: 'proposal-review',
    url: 'review/:review_uuid/',
    component: ProposalReviewCreatePage,
    parent: 'call-management',
  },

  {
    name: 'proposal-review-view',
    url: 'review/:review_uuid/view/',
    component: ProposalReviewCreatePage,
    parent: 'reviews',
  },

  // Public calls
  {
    name: 'calls-for-proposals',
    url: '/calls-for-proposals/',
    abstract: true,
    parent: 'public',
    component: UIView,
    data: {
      title: () => translate('Calls for proposals'),
    },
  },
  {
    name: 'proposals',
    url: '/proposals/',
    abstract: true,
    parent: 'layout',
    component: UIView,
    data: {
      title: () => translate('Proposals'),
    },
  },
  {
    name: 'reviews',
    url: '/reviews/',
    abstract: true,
    parent: 'layout',
    component: UIView,
    data: {
      title: () => translate('Reviews'),
    },
  },

  {
    name: 'calls-for-proposals-dashboard',
    url: '',
    parent: 'calls-for-proposals',
    component: CallsForProposals,
    data: {
      breadcrumb: () => translate('Dashboard'),
      priority: 100,
    },
  },
  {
    name: 'calls-for-proposals-all-calls',
    url: 'all-calls/?:offering_uuid/',
    parent: 'calls-for-proposals',
    component: PublicCallsPage,
    data: {
      breadcrumb: () => translate('All calls'),
    },
  },
  {
    name: 'proposals-all-proposals',
    url: '',
    parent: 'proposals',
    component: UserProposalsList,
    data: {
      breadcrumb: () => translate('All proposals'),
      priority: 100,
    },
  },
  {
    name: 'proposals-call-proposals',
    url: 'call/:call',
    parent: 'proposals',
    component: UserProposalsList,
  },
  {
    name: 'reviews-all-reviews',
    url: '',
    parent: 'reviews',
    component: UserReviewsList,
    data: {
      breadcrumb: () => translate('All reviews'),
      priority: 100,
    },
  },
  {
    name: 'calls-for-proposals-all-available-offerings',
    url: 'all-available-offerings/',
    parent: 'calls-for-proposals',
    component: CallsAvailableOfferingsPage,
    data: {
      breadcrumb: () => translate('Available offerings'),
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
      ...ANONYMOUS_LAYOUT_ROUTE_CONFIG,
    },
  },
  {
    name: 'public-call',
    url: ':call_uuid/',
    abstract: true,
    component: PublicCallDetailsContainer,
    parent: 'public-calls',
  },
  {
    name: 'public-call.details',
    url: '?tab',
    component: PublicCallDetails,
    data: {
      ...ANONYMOUS_LAYOUT_ROUTE_CONFIG,
    },
  },
  {
    name: 'proposals.manage-proposal',
    url: ':proposal_uuid/',
    component: ProposalManagePage,
    data: {},
  },
];
