import { useRouter } from '@uirouter/react';
import { Proposal, ProposalReview, PublicCall } from 'waldur-js-client';

import { TabNav } from 'waldur-ui';

import { Link } from '@/core/Link';
import { translate } from '@/i18n';
import { useUser } from '@/workspace/hooks';

import { OFFERING_TEAM_PROPOSAL_STATE, ownProposalViews } from './proposalView';

export const ProposalRoleBasedTabs = ({
  proposal,
  review,
  call,
}: {
  proposal: Proposal;
  /** user review */
  review: ProposalReview;
  /** Undefined until loaded; meanwhile staff see the Call manager tab disabled. */
  call?: Pick<PublicCall, 'uuid' | 'customer_uuid' | 'manager_uuid'>;
}) => {
  const router = useRouter();
  const user = useUser();
  const getParams = (state: string) => {
    const params = {};
    if (
      [
        'proposals.manage-proposal',
        'call-management.proposal-details',
      ].includes(state)
    ) {
      Object.assign(params, { proposal_uuid: proposal.uuid });
      if (
        ['proposal-review-view', 'proposal-review'].includes(
          router.globals.current.name,
        )
      ) {
        // Save the review uuid in the url, so we don't lose it and can come back to it if there are other reviews
        Object.assign(params, { review_uuid: review.uuid });
      }
    } else if (['proposal-review-view', 'proposal-review'].includes(state)) {
      Object.assign(params, { review_uuid: review.uuid });
    }

    // The call-manager proposal view is customer-workspace-scoped and needs the
    // organization uuid. (proposal-review is review-scoped and needs no uuid.)
    // The call arrives after the proposal: until then the tab is disabled.
    if (state === 'call-management.proposal-details') {
      Object.assign(params, { uuid: call?.customer_uuid });
    }

    return params;
  };

  // The same rule decides whether the applicant's view is a preview.
  const own = ownProposalViews(user, proposal);
  const showsReviewerTab = Boolean(review);
  const showsCallManagerTab = own.callManager;
  const current = router.globals.current.name;
  const currentProvider = router.globals.params?.uuid;
  // One tab per provider whose offering team the user is on, and the one
  // the page is open as, should a staff member or the provider's owner
  // have come here without such a role.
  const offeringTeams =
    current === OFFERING_TEAM_PROPOSAL_STATE &&
    currentProvider &&
    !own.offeringTeams.some((item) => item.uuid === currentProvider)
      ? [...own.offeringTeams, { uuid: currentProvider, name: '' }]
      : own.offeringTeams;

  // With nothing to switch between, the bar is a control that does nothing —
  // which is every applicant on a marketplace-only deployment, and an
  // evaluator whose work is on the plain page.
  if (!showsReviewerTab && !showsCallManagerTab && !offeringTeams.length) {
    return null;
  }

  const reviewerState =
    router.globals.current.parent === 'reviews'
      ? 'proposal-review-view'
      : 'proposal-review';
  const offeringTeamKey = (providerUuid: string) =>
    `${OFFERING_TEAM_PROPOSAL_STATE}:${providerUuid}`;

  const items = [
    {
      key: 'proposals.manage-proposal',
      title: translate('Applicant'),
      link: (
        <Link
          state="proposals.manage-proposal"
          params={getParams('proposals.manage-proposal')}
        />
      ),
    },
    showsReviewerTab && {
      key: reviewerState,
      title: translate('Reviewer'),
      link: <Link state={reviewerState} params={getParams(reviewerState)} />,
    },
    ...offeringTeams.map((provider) => ({
      key: offeringTeamKey(provider.uuid),
      title:
        offeringTeams.length > 1 && provider.name
          ? translate('Offering team: {provider}', { provider: provider.name })
          : translate('Offering team'),
      link: (
        <Link
          state={OFFERING_TEAM_PROPOSAL_STATE}
          params={{ uuid: provider.uuid, proposal_uuid: proposal.uuid }}
        />
      ),
    })),
    showsCallManagerTab && {
      key: 'call-management.proposal-details',
      title: translate('Call manager'),
      disabled: !call?.customer_uuid,
      link: (
        <Link
          state="call-management.proposal-details"
          params={getParams('call-management.proposal-details')}
        />
      ),
    },
  ].filter(Boolean);

  return (
    <TabNav
      // Follows the router: a tab click the unsaved-changes prompt cancels
      // must not leave the clicked tab looking active.
      activeKey={
        current === OFFERING_TEAM_PROPOSAL_STATE
          ? offeringTeamKey(currentProvider)
          : current
      }
      className="mb-6"
      items={items}
    />
  );
};
