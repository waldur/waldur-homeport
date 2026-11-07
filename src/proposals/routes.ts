import { UIView } from '@uirouter/react';

import { lazyComponent } from '@/core/lazyComponent';
import { StateDeclaration } from '@/core/types';
import { fetchCustomer } from '@/customer/workspace/fetchCustomer';
import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';
import { ANONYMOUS_LAYOUT_ROUTE_CONFIG } from '@/marketplace/constants';
import { isCallsSectionVisible } from '@/marketplace/serviceAccessMode';
import { callsSection } from '@/navigation/sidebar/sidebarSection';
import {
  canManageCallsOf,
  canReadAllCallWork,
  canReadCallReportsOf,
  isCallsOperator,
} from '@/proposals/callOperators';
import { getMyWorkTitle } from '@/proposals/review/myWorkTitle';
import {
  MyAssignmentsPageLazy,
  MyCallsPageLazy,
  MyEvaluatorRolesPageLazy,
  MyInvitationsPageLazy,
  MyReviewsPageLazy,
  MyTasksPageLazy,
} from '@/proposals/review/pages';
import store from '@/store/store';
import {
  canOpenOfferingTeamProposal,
  getCustomer,
  getUser,
} from '@/workspace/selectors';

// The review tabs share one page heading, "My reviews" or "My tasks", rendered by each
// tab's table. The browser tab title is read from the route's breadcrumb, so
// without one it was left as just the deployment name. `skipBreadcrumb`
// keeps the tabs out of the header menu, which the page's own tab strip
// already covers.
const myReviewsTab = {
  // Named as the sidebar and the heading name it: "My tasks" for whoever
  // only has tasks there, an offering manager or an applicant.
  breadcrumb: () => getMyWorkTitle(getUser(store.getState())),
  skipBreadcrumb: true,
};

/**
 * The call catalogue: in marketplace-only mode applicants reach services
 * through offerings and never a call, so only those running or working on
 * calls may browse it there.
 */
const canBrowseCalls = (state) =>
  isCallsSectionVisible() || isCallsOperator(getUser(state));

/** The cross-call pages, for those the sidebar offers them to. */
const canReadAllCallWorkGuard = (state) => canReadAllCallWork(getUser(state));

/**
 * The organisation's call-management pages. Its uuid is the route's on entry;
 * the tab strip asks without a transition, on a page that has already loaded
 * the organisation, so it reads that one.
 */
const canManageCallsOfGuard = (state, transition?) =>
  canManageCallsOf(
    getUser(state),
    transition?.params()?.uuid ?? getCustomer(state)?.uuid,
  );

/**
 * The organisation's call reports: the report endpoint asks for CALL.UPDATE,
 * which an owner without a call role does not hold.
 */
const canReadCallReportsOfGuard = (state, transition?) =>
  canReadCallReportsOf(
    getUser(state),
    transition?.params()?.uuid ?? getCustomer(state)?.uuid,
  );

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
      ...callsSection('manage-calls'),
      auth: true,
      title: () => translate('Call management'),
      // Every page under it: the organisation's call workers, not anyone who
      // can read the organisation.
      permissions: [canManageCallsOfGuard],
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
    // The state tabs rewrite ?state; without `dynamic` UI-Router would remount
    // the whole page on every tab click.
    params: { state: { dynamic: true } },
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
      // A page's own permissions replace its parent's: repeat the guard.
      permissions: [
        canManageCallsOfGuard,
        () => !isFeatureVisible(MarketplaceFeatures.call_only),
      ],
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
      permissions: [
        canManageCallsOfGuard,
        () => !isFeatureVisible(MarketplaceFeatures.call_only),
      ],
    },
  },
  {
    name: 'call-management.reports',
    url: 'reports/?report&call&round&from&to',
    // The report switcher and the filters rewrite these; without `dynamic`
    // UI-Router would remount the page on every change.
    params: {
      report: { dynamic: true },
      call: { dynamic: true, array: true },
      round: { dynamic: true },
      from: { dynamic: true },
      to: { dynamic: true },
    },
    component: lazyComponent(() =>
      import('./reports/CallManagementReportsPage').then((module) => ({
        default: module.CallManagementReportsPage,
      })),
    ),
    data: {
      breadcrumb: () => translate('Reports'),
      permissions: [
        canReadCallReportsOfGuard,
        () => !isFeatureVisible(MarketplaceFeatures.call_only),
      ],
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
    // A proposal as an offering's team reads it, in its provider's workspace.
    // Hung off the layout rather than the provider workspace: an offering
    // evaluator holds no organisation role to open that with.
    name: 'provider-call-proposal',
    url: '/providers/:uuid/call-proposals/:proposal_uuid/?review_uuid&panels',
    parent: 'layout',
    component: lazyComponent(() =>
      import('./proposal/create/ProposalManagePage').then((module) => ({
        default: module.ProposalManagePage,
      })),
    ),
    data: {
      ...callsSection('provider-calls'),
      auth: true,
      hideHeaderMenu: true,
      // Not behind the call management feature: tasks and mails link here,
      // as they linked the plain proposal page, which is not either.
      permissions: [canOpenOfferingTeamProposal],
    },
  },
  {
    name: 'protected-call',
    url: '/call/:call_uuid/',
    abstract: true,
    component: UIView,
    parent: 'layout',
    data: callsSection('manage-calls'),
  },
  {
    name: 'protected-call.main',
    url: 'edit/?tab&coi_tab&matching_tab&validation_tab&config_tab',
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
      validation_tab: {
        dynamic: true,
      },
      // The general configuration's group (TabbedSection).
      config_tab: {
        dynamic: true,
      },
    },
  },
  {
    // Between Manage and Edit: whether the call's workflow works as
    // intended. Its sections are the tabs of the page's bar.
    name: 'protected-call.validation',
    url: 'validation/?tab',
    component: lazyComponent(() =>
      import('./validation/CallValidationContainer').then((module) => ({
        default: module.CallValidationContainer,
      })),
    ),
    params: {
      tab: {
        dynamic: true,
      },
    },
  },
  {
    // One mail of the call: the rules that send it and its wording.
    name: 'protected-call.mail',
    url: 'mail/?step&step_name&trigger&recipient&days_before&mail_type&variant&tab',
    component: lazyComponent(() =>
      import('./workflow-description/mail/CallMailPage').then((module) => ({
        default: module.CallMailPage,
      })),
    ),
    // The header's Go back, as on other pages reached from another.
    data: { showGoBack: true },
    params: {
      tab: {
        dynamic: true,
      },
    },
  },
  {
    name: 'protected-call.manage',
    url: 'manage/?tab&pool_tab&discovery_tab&validation_tab&report&round&from&to',
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
      validation_tab: {
        dynamic: true,
      },
      // The Reports tab's report and filters.
      report: { dynamic: true },
      round: { dynamic: true },
      from: { dynamic: true },
      to: { dynamic: true },
    },
  },

  {
    // A round report is its author's to write, and its author -- a panel
    // chair, say -- may not open the call's management pages: the report has
    // a page of its own, scoped to it.
    name: 'round-report',
    url: '/round-reports/:report_uuid/',
    component: lazyComponent(() =>
      import('./round/reports/RoundReportPage').then((module) => ({
        default: module.RoundReportPage,
      })),
    ),
    parent: 'layout',
    data: {
      auth: true,
      breadcrumb: () => translate('Round report'),
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
      ...callsSection('my-reviews'),
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
    component: lazyComponent(() =>
      import('./CallsForProposalsLayout').then((module) => ({
        default: module.CallsForProposalsLayout,
      })),
    ),
    data: {
      ...callsSection('calls-for-proposals'),
      title: () => translate('Calls for proposals'),
      permissions: [canBrowseCalls],
      // The page draws its own tabs under its title.
      hideHeaderMenu: true,
    },
  },
  {
    name: 'proposals',
    url: '/proposals/',
    abstract: true,
    parent: 'layout',
    component: UIView,
    data: {
      ...callsSection('my-proposals'),
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
      ...callsSection('my-reviews'),
      title: () => translate('Reviews'),
    },
  },

  {
    // The Open calls tab. It keeps its old name, which the sidebar, the
    // footer and the landing page all link to.
    name: 'calls-for-proposals-dashboard',
    url: '',
    parent: 'calls-for-proposals',
    component: lazyComponent(() =>
      import('./OpenCallsPage').then((module) => ({
        default: module.OpenCallsPage,
      })),
    ),
    data: {
      breadcrumb: () => translate('Open calls'),
      priority: 100,
    },
  },
  {
    name: 'calls-for-proposals-all-calls',
    url: 'all-calls/?:offering_uuid&{state}',
    parent: 'calls-for-proposals',
    // The state tabs rewrite ?state; without `dynamic` UI-Router would remount
    // the whole page on every tab click.
    params: { state: { dynamic: true } },
    component: lazyComponent(() =>
      import('./PublicCallsPage').then((module) => ({
        default: module.AllCallsPage,
      })),
    ),
    data: {
      breadcrumb: () => translate('All calls'),
    },
  },
  {
    name: 'proposals-all-proposals',
    // The summary cards above the calls link here filtered by state.
    url: '?{state}',
    parent: 'proposals',
    // The applicant's list sits under the calls section, which marketplace-only
    // mode does not show; there it lives in the profile instead, so an old
    // link or a typed URL lands on the same list under the name the rest of
    // that mode uses.
    redirectTo: () =>
      isCallsSectionVisible() ? undefined : { state: 'profile.requests' },
    component: lazyComponent(() =>
      import('./proposal/UserProposalsList').then((module) => ({
        default: module.UserProposalsList,
      })),
    ),
    data: {
      // The applicant's own list: the sidebar and the page call it so too.
      breadcrumb: () => translate('My proposals'),
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
    name: 'reviews-tasks',
    url: '',
    parent: 'reviews',
    component: MyTasksPageLazy,
    data: {
      ...myReviewsTab,
      priority: 100,
    },
  },
  {
    name: 'reviews-all-reviews',
    url: 'all/',
    parent: 'reviews',
    component: MyReviewsPageLazy,
    data: myReviewsTab,
  },
  {
    name: 'reviews-assignments',
    url: 'assignments/',
    parent: 'reviews',
    component: MyAssignmentsPageLazy,
    data: myReviewsTab,
  },
  {
    name: 'reviews-invitations',
    url: 'invitations/',
    parent: 'reviews',
    component: MyInvitationsPageLazy,
    data: myReviewsTab,
  },
  {
    name: 'reviews-evaluator-roles',
    url: 'evaluator-roles/',
    parent: 'reviews',
    component: MyEvaluatorRolesPageLazy,
    data: myReviewsTab,
  },
  {
    name: 'reviews-calls',
    url: 'calls/',
    parent: 'reviews',
    component: MyCallsPageLazy,
    data: myReviewsTab,
  },

  // Every call this user can manage, whichever organisation runs it. The
  // organisation-scoped list at call-management.call-list stays for the
  // Call management tab of a single organisation.
  {
    name: 'manage-calls',
    url: '/manage-calls/?{state}',
    parent: 'layout',
    // The state tabs rewrite ?state; without `dynamic` UI-Router would remount
    // the whole page on every tab click.
    params: { state: { dynamic: true } },
    component: lazyComponent(() =>
      import('./call-management/ManageCallsPage').then((module) => ({
        default: module.ManageCallsPage,
      })),
    ),
    data: {
      ...callsSection('manage-calls'),
      title: () => translate('Manage calls'),
      breadcrumb: () => translate('Manage calls'),
    },
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
      ...callsSection('all-proposals'),
      title: () => translate('All proposals'),
      breadcrumb: () => translate('All proposals'),
      permissions: [canReadAllCallWorkGuard],
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
      ...callsSection('all-reviews'),
      title: () => translate('All reviews'),
      breadcrumb: () => translate('All reviews'),
      permissions: [canReadAllCallWorkGuard],
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
    data: {
      ...callsSection('calls-for-proposals'),
      permissions: [canBrowseCalls],
    },
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
    params: { tab: { dynamic: true } },
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
    // `provider`: opened from a provider's proposals, whose chain it keeps.
    // `results`: opened from an organisation's call results, likewise.
    url: ':proposal_uuid/?review_uuid&panels&provider&results',
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
      ...callsSection('my-reviews'),
      auth: true,
      showGoBack: true,
      title: () => translate('Reviewer invitation'),
    },
  },
];
