import { UIView } from '@uirouter/react';

import { lazyComponent } from '@/core/lazyComponent';
import { StateDeclaration } from '@/core/types';
import { fetchCustomer } from '@/customer/workspace/fetchCustomer';
import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';
import { ANONYMOUS_LAYOUT_ROUTE_CONFIG } from '@/marketplace/constants';

export const states: StateDeclaration[] = [
  {
    name: 'call-management',
    url: '/call-management/:uuid/',
    parent: 'layout',
    component: lazyComponent(() =>
      import('@/organization/OrganizationUIView').then((module) => ({
        default: module.OrganizationUIView,
      })),
    ),
    abstract: true,
    data: {
      auth: true,
      title: () => translate('Call management'),
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
    component: lazyComponent(() =>
      import('./call-management/CallManagementDashboard').then((module) => ({
        default: module.CallManagementDashboard,
      })),
    ),
    data: {
      breadcrumb: () => translate('Dashboard'),
      priority: 100,
      feature: MarketplaceFeatures.show_call_management_functionality,
    },
  },
  {
    name: 'call-management.team',
    url: 'team/',
    component: lazyComponent(() =>
      import('./call-management/CallManagementTeamPage').then((module) => ({
        default: module.CallManagementTeamPage,
      })),
    ),
    data: {
      breadcrumb: () => translate('Team'),
    },
  },
  {
    name: 'call-management.call-list',
    url: 'calls/?{state}',
    component: lazyComponent(() =>
      import('./call-management/CallManagementPage').then((module) => ({
        default: module.CallManagementPage,
      })),
    ),
    data: {
      breadcrumb: () => translate('Calls'),
    },
  },
  {
    name: 'call-management.proposal-list',
    url: 'proposals/?{state}',
    component: lazyComponent(() =>
      import('./proposal/CustomerProposalsList').then((module) => ({
        default: module.CustomerProposalsList,
      })),
    ),
    data: {
      breadcrumb: () => translate('Proposals'),
      permissions: [() => !isFeatureVisible(MarketplaceFeatures.call_only)],
    },
  },
  {
    name: 'call-management.review-list',
    url: 'reviews/?{state}',
    component: lazyComponent(() =>
      import('./review/CustomerReviewsList').then((module) => ({
        default: module.CustomerReviewsList,
      })),
    ),
    data: {
      breadcrumb: () => translate('Reviews'),
      permissions: [() => !isFeatureVisible(MarketplaceFeatures.call_only)],
    },
  },
  {
    name: 'call-management.proposal-details',
    url: 'proposals/:proposal_uuid/?review_uuid&panels',
    component: lazyComponent(() =>
      import('./proposal/create/ProposalManagePage').then((module) => ({
        default: module.ProposalManagePage,
      })),
    ),
    data: {
      skipHero: true,
      hideHeaderMenu: true,
    },
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
    url: 'edit/?tab&coi_tab&matching_tab',
    component: lazyComponent(() =>
      import('./update/CallUpdateContainer').then((module) => ({
        default: module.CallUpdateContainer,
      })),
    ),
    params: {
      tab: {
        dynamic: true,
      },
      coi_tab: {
        dynamic: true,
      },
      matching_tab: {
        dynamic: true,
      },
    },
  },
  {
    name: 'protected-call.manage',
    url: 'manage/?tab&pool_tab&discovery_tab',
    component: lazyComponent(() =>
      import('./manage/CallManageContainer').then((module) => ({
        default: module.CallManageContainer,
      })),
    ),
    params: {
      tab: {
        dynamic: true,
      },
      pool_tab: {
        dynamic: true,
      },
      discovery_tab: {
        dynamic: true,
      },
    },
  },

  {
    // The editable "Submit review" page is review-scoped and role-neutral: both
    // reviewers (from "My reviews") and call managers (from the review list)
    // open the same review, and the page reads only :review_uuid. It used to
    // live at /call-management/:uuid/review/... — a customer-workspace URL that
    // wrongly implied call-manager scope and carried a dead :uuid segment
    // (a call uuid via some links, a customer uuid via others), whose inherited
    // fetchCustomer 404'd on the call-uuid variant. Now it is a standalone,
    // layout-parented, review-scoped route.
    name: 'proposal-review',
    url: '/proposal-review/:review_uuid/',
    component: lazyComponent(() =>
      import('./proposal/create-review/ProposalReviewCreatePage').then(
        (module) => ({ default: module.ProposalReviewCreatePage }),
      ),
    ),
    parent: 'layout',
    data: {
      auth: true,
      skipHero: true,
      hideHeaderMenu: true,
    },
  },

  {
    name: 'proposal-review-view',
    url: 'review/:review_uuid/view/',
    component: lazyComponent(() =>
      import('./proposal/create-review/ProposalReviewCreatePage').then(
        (module) => ({ default: module.ProposalReviewCreatePage }),
      ),
    ),
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
    component: lazyComponent(() =>
      import('./CallsForProposals').then((module) => ({
        default: module.CallsForProposals,
      })),
    ),
    data: {
      breadcrumb: () => translate('Dashboard'),
      priority: 100,
    },
  },
  {
    name: 'calls-for-proposals-all-calls',
    url: 'all-calls/?:offering_uuid&{state}',
    parent: 'calls-for-proposals',
    component: lazyComponent(() =>
      import('./PublicCallsPage').then((module) => ({
        default: module.PublicCallsPage,
      })),
    ),
    data: {
      breadcrumb: () => translate('All calls'),
    },
  },
  {
    name: 'proposals-all-proposals',
    url: '',
    parent: 'proposals',
    component: lazyComponent(() =>
      import('./proposal/UserProposalsList').then((module) => ({
        default: module.UserProposalsList,
      })),
    ),
    data: {
      breadcrumb: () => translate('All proposals'),
      priority: 100,
    },
  },
  {
    name: 'proposals-call-proposals',
    url: 'call/:call',
    parent: 'proposals',
    component: lazyComponent(() =>
      import('./proposal/UserProposalsList').then((module) => ({
        default: module.UserProposalsList,
      })),
    ),
  },
  {
    name: 'reviews-all-reviews',
    url: '',
    parent: 'reviews',
    component: lazyComponent(() =>
      import('./review/MyReviewsPage').then((module) => ({
        default: module.MyReviewsPage,
      })),
    ),
    data: {
      priority: 100,
    },
  },
  {
    name: 'reviews-assignments',
    url: 'assignments/',
    parent: 'reviews',
    component: lazyComponent(() =>
      import('./review/MyAssignmentsPage').then((module) => ({
        default: module.MyAssignmentsPage,
      })),
    ),
  },
  {
    name: 'reviews-invitations',
    url: 'invitations/',
    parent: 'reviews',
    component: lazyComponent(() =>
      import('./review/MyInvitationsPage').then((module) => ({
        default: module.MyInvitationsPage,
      })),
    ),
  },
  {
    name: 'reviews-calls',
    url: 'calls/',
    parent: 'reviews',
    component: lazyComponent(() =>
      import('./review/MyCallsPage').then((module) => ({
        default: module.MyCallsPage,
      })),
    ),
  },

  // Admin routes for staff/support/call managers
  {
    name: 'admin-proposals',
    url: '/admin/proposals/?{state}&{call}&{organization}',
    parent: 'layout',
    component: lazyComponent(() =>
      import('./proposal/AdminProposalsList').then((module) => ({
        default: module.AdminProposalsList,
      })),
    ),
    data: {
      title: () => translate('All proposals'),
      breadcrumb: () => translate('All proposals'),
    },
  },
  {
    name: 'admin-reviews',
    url: '/admin/reviews/?{state}&{call}&{organization}&{reviewer}',
    parent: 'layout',
    component: lazyComponent(() =>
      import('./review/AdminReviewsList').then((module) => ({
        default: module.AdminReviewsList,
      })),
    ),
    data: {
      title: () => translate('All reviews'),
      breadcrumb: () => translate('All reviews'),
    },
  },
  {
    name: 'calls-for-proposals-all-available-offerings',
    url: 'all-available-offerings/',
    parent: 'calls-for-proposals',
    component: lazyComponent(() =>
      import('./CallsAvailableOfferingsPage').then((module) => ({
        default: module.CallsAvailableOfferingsPage,
      })),
    ),
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
    component: lazyComponent(() =>
      import('./PublicCallsPage').then((module) => ({
        default: module.PublicCallsPage,
      })),
    ),
    data: {
      ...ANONYMOUS_LAYOUT_ROUTE_CONFIG,
    },
  },
  {
    name: 'public-call',
    url: ':call_uuid/',
    abstract: true,
    component: lazyComponent(() =>
      import('./details/PublicCallDetailsContainer').then((module) => ({
        default: module.PublicCallDetailsContainer,
      })),
    ),
    parent: 'public-calls',
  },
  {
    name: 'public-call.details',
    url: '?tab',
    component: lazyComponent(() =>
      import('./details/PublicCallDetails').then((module) => ({
        default: module.PublicCallDetails,
      })),
    ),
    data: {
      ...ANONYMOUS_LAYOUT_ROUTE_CONFIG,
    },
  },
  {
    name: 'proposals.manage-proposal',
    url: ':proposal_uuid/?review_uuid&panels',
    component: lazyComponent(() =>
      import('./proposal/create/ProposalManagePage').then((module) => ({
        default: module.ProposalManagePage,
      })),
    ),
    data: {
      hideHeaderMenu: true,
    },
  },

  // Reviewer invitation acceptance
  {
    name: 'reviewer-invitation-accept',
    url: '/reviewer-invitation/:token/',
    parent: 'layout',
    component: lazyComponent(() =>
      import('./invitations/ReviewerInvitationAccept').then((module) => ({
        default: module.ReviewerInvitationAccept,
      })),
    ),
    data: {
      auth: true,
      title: () => translate('Reviewer invitation'),
    },
  },
];
