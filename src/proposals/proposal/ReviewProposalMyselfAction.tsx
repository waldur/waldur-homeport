import { ClipboardTextIcon } from '@phosphor-icons/react';
import { useRouter } from '@uirouter/react';
import {
  Proposal,
  proposalProtectedCallsAddUser,
  proposalReviewsCreate,
  proposalReviewsList,
  usersMeRetrieve,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { RoleEnum } from '@/permissions/enums';
import { ActionItem } from '@/resource/actions/ActionItem';
import { useUser } from '@/workspace/hooks';

// Let a call manager review a proposal themselves when the assigned reviewer is
// idle — WITHOUT bypassing the "reviewer must be in the pool" check.
// Instead of a special-cased serializer bypass, this composes existing,
// permission-checked primitives:
//   1. if the manager already has a review for this proposal, reuse it;
//   2. otherwise grant self CALL.REVIEWER on the call (join the pool) — needs
//      CALL.CREATE_PERMISSION, which a call manager already holds;
//   3. create a review assigned to self (proposalReviewsCreate) — needs
//      PROPOSAL.MANAGE_REVIEW, which a call manager already holds; the
//      pool-membership validation passes because step 2 put the manager into
//      call.reviewers;
//   4. open the review form.
// The existing "can't override another reviewer's review" gate (obj.reviewer ==
// user) is untouched, so any idle reviewer's review is left intact.
export const ReviewProposalMyselfAction = ({
  row,
  refetch,
}: {
  row: Proposal;
  refetch: () => void;
}) => {
  const user = useUser();
  const router = useRouter();

  const reviewMyself = useManagedMutation<any, any, void>({
    mutationFn: async () => {
      // Reuse an existing review by this manager rather than erroring on the
      // per-(proposal, reviewer) uniqueness constraint.
      const existing = await proposalReviewsList({
        query: {
          proposal_uuid: row.uuid,
          reviewer_uuid: user!.uuid,
          page_size: 1,
        },
      });
      const existingReview = existing.data?.[0];
      if (existingReview) {
        return { data: existingReview };
      }
      // Ensure the manager is in the call's reviewer pool. Look up their actual
      // role grants rather than catching a duplicate-grant error. We refetch the
      // current user (the cached login copy may not reflect a CALL.REVIEWER
      // granted earlier in this session) and check role grants directly —
      // userHasRole can't be used here, it reports staff as holding every role.
      const me = await usersMeRetrieve();
      const alreadyReviewer = (me.data?.permissions ?? []).some(
        (perm) =>
          perm.role_name === RoleEnum.CALL_REVIEWER &&
          perm.scope_uuid === row.call_uuid,
      );
      if (!alreadyReviewer) {
        await proposalProtectedCallsAddUser({
          path: { uuid: row.call_uuid },
          body: { role: RoleEnum.CALL_REVIEWER, user: user!.uuid },
        });
      }
      // Create the review assigned to self. The serializer's proposal/reviewer
      // are hyperlink fields, so they take resource URLs (not bare UUIDs).
      return proposalReviewsCreate({
        body: { proposal: row.url, reviewer: user!.url },
      });
    },
    confirmation: {
      title: translate('Review this proposal yourself'),
      body: translate(
        'You will be added as a reviewer on this call (if you are not already) and taken to your review of this proposal. Other reviewers’ reviews are not affected. Continue?',
      ),
    },
    successMessage: translate('Opening your review of this proposal.'),
    errorMessage: translate('Unable to start your review of this proposal.'),
    refetch,
    onSuccess: (response: any) => {
      const reviewUuid = response?.data?.uuid;
      if (reviewUuid) {
        router.stateService.go('proposal-review', { review_uuid: reviewUuid });
      }
    },
  });

  // A manager shouldn't review a proposal they authored (and we need a user).
  if (!user || user.uuid === row.created_by_uuid) {
    return null;
  }

  return (
    <ActionItem
      title={translate('Review it myself')}
      action={() => reviewMyself.mutate()}
      iconNode={<ClipboardTextIcon weight="bold" />}
    />
  );
};
