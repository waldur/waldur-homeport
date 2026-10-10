import { useRouter } from '@uirouter/react';
import { Proposal, ProposalReview, PublicCall } from 'waldur-js-client';

import { TabNav } from 'waldur-ui';

import { Link } from '@/core/Link';
import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';
import { userHasRole } from '@/permissions/hasPermission';
import { useUser } from '@/workspace/hooks';

export const ProposalRoleBasedTabs = ({
  proposal,
  review,
  call,
}: {
  proposal: Proposal;
  /** user review */
  review: ProposalReview;
  call: Pick<PublicCall, 'uuid' | 'customer_uuid' | 'manager_uuid'>;
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
    if (state === 'call-management.proposal-details') {
      Object.assign(params, { uuid: call.customer_uuid });
    }

    return params;
  };

  const userIsCallOrganizer = userHasRole(
    user,
    'CUSTOMER.CALL_ORGANIZER',
    call?.manager_uuid,
  );
  const userIsCallManager = userHasRole(user, 'CALL.MANAGER', call?.uuid);

  const showCallManagement = isFeatureVisible(
    MarketplaceFeatures.show_call_management_functionality,
  );

  const showsReviewerTab = Boolean(review);
  const showsCallManagerTab =
    (userIsCallManager || userIsCallOrganizer) && showCallManagement;

  // With nothing to switch between, the bar is a control that does nothing —
  // which is every applicant on a marketplace-only deployment.
  if (!showsReviewerTab && !showsCallManagerTab) {
    return null;
  }

  const reviewerState =
    router.globals.current.parent === 'reviews'
      ? 'proposal-review-view'
      : 'proposal-review';

  return (
    <TabNav
      // Follows the router: a tab click the unsaved-changes prompt cancels
      // must not leave the clicked tab looking active.
      activeKey={router.globals.current.name}
      className="mb-8"
      items={[
        { key: 'proposals.manage-proposal', title: translate('Applicant') },
        showsReviewerTab && {
          key: reviewerState,
          title: translate('Reviewer'),
        },
        showsCallManagerTab && {
          key: 'call-management.proposal-details',
          title: translate('Call manager'),
          disabled: !call?.customer_uuid,
        },
      ]
        .filter(Boolean)
        .map((item) => ({
          ...item,
          link: <Link state={item.key} params={getParams(item.key)} />,
        }))}
    />
  );
};
